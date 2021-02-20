//Chart variable
var myLineChart; //global

var mqtt;
var client;
var reconnectTimeOut = 2000;

//MQTTT variable | .shiftr.io server
var host = "wss://pid-controller.cloud.shiftr.io";
var port = 443; //MQTT over Websocket Por on .shiftr.io

//Topicos
const topics = {
  shiftr_temperature: "/controlproject/temperature",
};

//Variavel global para salvar ambos os valores no localStorage
var measuredValues = {
  temperatureY: [],//Valores em Y (temperatura)
  timeX: []//Valores em X (tempo)
};

function builChart() {
  var ctx = document.getElementById("myChart").getContext("2d");

  myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [], //Dados para o eixo X
      datasets: [
        {
          label: "Temperatura",
          // backgroundColor: "rgb(155,0, 132)",
          borderColor: "rgb(55, 99, 132)",
          data: [], //Dados para o eixo Y
        },
      ],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            suggestedMax: 100,
            stepSize: 1
          }
        }]
      }
    },
  });

  //Checando se existe valores para Tempo no eixo X e para Temperatura no eixo Y já armazenados
  if(localStorage.getItem('graphic-values')){
    myLineChart.data.datasets[0].data.push(...JSON.parse(localStorage.getItem('graphic-values')).temperatureY);
    myLineChart.data.labels.push(...JSON.parse(localStorage.getItem('graphic-values')).timeX);
  }
}

function updateChart(timeX, valueY) {
  myLineChart.data.datasets[0].data.push(valueY);
  myLineChart.data.labels.push(timeX);
  myLineChart.update();
}

function onConnect() {
  console.log("Connected!");
  client.subscribe(topics.shiftr_temperature);
}

function onMessageArrived(msg) {
  let currentTime;

  if(!localStorage.getItem('start-time')){
    const startTime = new Date();
    localStorage.setItem('start-time', startTime);
    currentTime = 0.000;
  } else {
    //Diferenca de tempo decorrido em segundos.milisegundos
    currentTime = parseFloat(((new Date()) - (new Date(localStorage.getItem('start-time'))))/ 1000.0); 
    // console.log(currentTime)
  }

  let temperature = parseInt(msg);
  updateChart(currentTime, temperature);

  measuredValues.temperatureY.push(temperature);
  measuredValues.timeX.push(currentTime);
  localStorage.setItem('graphic-values', JSON.stringify(measuredValues));
}

// function publishOnTopic(){
//     var temperature = "15";
//     temperature++;
//     client.publish(topics.shiftr_temperature, temperature.toString());
// }

function MQTTConnect() {
  console.log("Connecting to " + host + " in port " + port);
  //wss://public:public@public.cloud.shiftr.io
  client = mqtt.connect(
    "wss://pid-controller:yHyPglmMTKUo2kSI@pid-controller.cloud.shiftr.io",
    {
      clientId: "lgrdev-browser",
      username: "pid-controller",
      password: "yHyPglmMTKUo2kSI",
    },
  );

  client.on("connect", () => onConnect());

  client.on("message", function (topic, message) {
    var msgStr = new TextDecoder("utf-8").decode(message);

    //Teste
    // console.log(
    //   topic + ": " + msgStr,
    //   JSON.parse(message.toString()),
    //   message.toString(),
    //   message,
    //   msgStr,
    //   Utf8ArrayToStr(message),
    // );
    return onMessageArrived(msgStr);
  });
}

// function onFailure(msg) {
//     console.log("Connection Attempt to Host " + host + " Failed");
//     setTimeout(() => { MQTTConnect(); }, reconnectTimeOut);
// }

//Funcao para gerar o arquivo com os dados da curva para download ao clicar no botão
function btnFileDataDownload(event)
{
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('graphic-values'));
  event.target.setAttribute("href",     dataStr     );
  event.target.setAttribute("download", "data.json");
  event.target.click();
}

(function () {
  builChart();
  MQTTConnect();

  document.querySelector('#btn-data-download').addEventListener('click', btnFileDataDownload);
})();

function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
    }
  }

  return out;
}
