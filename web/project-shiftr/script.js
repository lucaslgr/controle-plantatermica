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
var dataReactionCurve = {
  temperatureY: [],//Valores em Y (temperatura)
  timeX: []//Valores em X (tempo)
};

async function builChart() {
  //Peando o elemento canva para inserir o Gráfico de Linhas
  let ctx = document.getElementById("reactionCurve").getContext("2d");
  
  //Se não tiver salvo no navegador, faz a request
  if(!localStorage.getItem('graphic-values')){
    dataReactionCurve = await fetch("data/dataReactionCurve.json")
    .then(response => response.json())
    .then(jsonResponse => jsonResponse);

    //Salvando no navegador para não precisar ficar carregando o arquivo toda vez
    localStorage.setItem('graphic-values', JSON.stringify(dataReactionCurve));
  } else {
    dataReactionCurve = JSON.parse(localStorage.getItem('graphic-values'));
  }

  myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataReactionCurve.timeX, //Dados para o eixo X
      datasets: [
        {
          label: "Temperatura",
          // backgroundColor: "rgb(155,0, 132)",
          borderColor: "rgb(55, 99, 132)",
          data: dataReactionCurve.temperatureY, //Dados para o eixo Y
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

  dataReactionCurve.temperatureY.push(temperature);
  dataReactionCurve.timeX.push(currentTime);
  localStorage.setItem('graphic-values', JSON.stringify(dataReactionCurve));
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
  event.target.setAttribute("download", "dataReactionCurve.json");
  event.target.click();
}

//Funcao que encontra os parametros para montar a G(s) aproximada da planta através do método de SMITH aplicado aos dados da curva de reação
function  calcMethodSmithG()
{
  //Recuperando os dados da curva de reacao
  let dataReactionCurve = JSON.parse(localStorage.getItem('graphic-values'));
  
  //Tamanho dos dados
  let dataLenght = dataReactionCurve.timeX.length;

  //Flag para controlar o loop for para quando os respectivos valores de tempo já tiverem sidos encontrados
  let flagT28found = false, flagT63found =  false;
  let t28_3, t63_2;
  
  //Valor inicial da curva de reação do sistema
  let initialValue = dataReactionCurve.temperatureY[0];
  //Valor de estabilizacao do sistema
  let stabilizationValue = dataReactionCurve.temperatureY[dataLenght - 1];
  //28.3% do valor de estabilizacao
  let stabilizationValue28_3 = stabilizationValue * 0.283;
  //63.2% do valor de estabilizacao
  let stabilizationValue63_2 = stabilizationValue * 0.632;

  //Encontrando t para 63.2% e 28.3% dos valores da curva respectivamente
  for (let index = 0; index < dataLenght; index++) {
    
    if(dataReactionCurve.temperatureY[index] >= stabilizationValue28_3 && !flagT28found===true){
      flagT28found = true;
      t28_3 = dataReactionCurve.temperatureY[index];
    }
    if(dataReactionCurve.temperatureY[index] >= stabilizationValue63_2 && !flagT63found===true){
      flagT63found = true;
      t63_2 = dataReactionCurve.temperatureY[index];
    }    
  }

  //Calculando a constante de tempo do sistema (TAL)
  let constantTime_Tal = 1.5*(t63_2 - t28_3);
  //Calculando o atraso de transporte (L)
  let transportDelay_L = 1.5*(t28_3 - (t63_2/3));
  //Calculando o ganho estático do sistema (K) = deltaSaida/deltaEntrada
  let staticGain_K = (stabilizationValue - initialValue)/(1-0);

  console.log(`Valor 63,2% do ganho: ${stabilizationValue63_2} | Valor 28,3% do ganho: ${stabilizationValue28_3}`);
  console.log(`Tempo para o valor 63,2% do ganho: ${t63_2} | Tempo para o valor de 28,3% do ganho: ${t28_3}`);
  console.log(`Tal: ${constantTime_Tal} | Atraso de Transporte: ${transportDelay_L} | Ganho Estático: ${staticGain_K}`);
  document.querySelector('#variable-tal').value = constantTime_Tal;
  document.querySelector('#variable-transport-delay').value = transportDelay_L;
  document.querySelector('#variable-static-gain').value = staticGain_K;
}

(function () {
  builChart();
  // MQTTConnect();

  document.querySelector('#btn-data-download').addEventListener('click', btnFileDataDownload);

  document.querySelector('#btn-method-smith-calc').addEventListener('click', calcMethodSmithG);
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
