//Char variable
var myLineChart; //global

//MQTTT variable
var mqtt;
var reconnectTimeOut = 2000;
var host = "test.mosquitto.org";
// var port = 8080;
// var port = 8883;
var port = 9001;

(function () {
  builChart();
  MQTTConnect();
})();

function builChart() {
  var ctx = document.getElementById("myChart").getContext("2d");

  myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperatura",
          // backgroundColor: "rgb(155,0, 132)",
          borderColor: "rgb(55, 99, 132)",
          data: [],
        },
      ],
    },
    options: {},
  });
}

function updateChart(timeX, valueY) {
  //Testando o update
  myLineChart.data.datasets[0].data.push(50);
  myLineChart.data.labels.push("8s");
  myLineChart.update();
}

function onConnect() {
  console.log("Connected");
  mqtt.subscribe("controlproject/temperature");
}

function onMessageArrived(msg) {
  let temperature = parseInt(msg.payloadString);
  let today = new Date();
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  updateChart(time, temperature);
}

function MQTTConnect() {
  console.log("Connecting to " + host + " in port " + port);
  mqtt = new Paho.MQTT.Client(host, port, "webpage-dashboard");
  mqtt.onMessageArrived = onMessageArrived;

  var options = {
    timeout: 3,
    onSuccess: onConnect,
  };

  mqtt.connect(options);
}
