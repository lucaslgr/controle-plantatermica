#include <Arduino.h>

//--- WIFI ---
#include <ESP8266WiFi.h>
const char *ssid = "WOLF_2Ghz";
const char *password = "wheyebatatadoce";
WiFiClient nodemcuClient;

//--- MQTT CLIENT ---
#include <MQTT.h>
const char *mqtt_server = "pid-controller.cloud.shiftr.io";
// const char *mqtt_server = "test.mosquitto.org"; //Broker MQTT Remoto alternativo
const char *client_id = "nodemcu";
const char *topicTemperature = "/controlproject/temperature";
MQTTClient client;
const char *mqttUser = "pid-controller";
const char *mqttPassword = "YipriUzio5iDmCar";
#define MQTT_BROKER_PORT 1883 // insecure port TCP
unsigned long lastMillis = 0;
#define TIME_INTERRUPT 500 //Tempo para interrupção ativar o PID e publicar no broker MQTT o valor da temperatura

//--- LM35 ---
#define LM35_ANALOG A0 //Setando o pino de leitura analógica do LM35

// --- TIMER ---
os_timer_t pidTimer;   //Timer para ler a saída e recalcular a entrada pelo controle PID
bool _timeout = false; //Flag para o @pidTimer
void timerCallBack(void *tCall);

void timerInit(void);

//--- SETUP FUNCOES ---
float temperature = 0.0;
unsigned long currentTime = 0.0;
void wifiSettingsConnectWifi();
void mqttConnectServer();
void mqttReconnect();
void measureTemperature();
void publishAtTopicTemperature();
void showMeasurements();

//--- SETUP --- 
void setup()
{
  Serial.begin(115200);
  wifiSettingsConnectWifi();
  client.begin(mqtt_server, nodemcuClient);
  // client.onMessage(messageReceived);
  mqttConnectServer();

  //Configurando o @pidTimer
  timerInit();
}

//--- LOOP ---
void loop()
{
  client.loop();
  delay(10); // <- resolve alguns problemas de estabilidade com a conexão WiFi

  if (!client.connected())
    mqttReconnect();

  if (_timeout)
  {
    // Serial.println("Timer estourou...");
    measureTemperature();
    _timeout = false;
  }
}

//--- CONECTA AO WIFI ---
void wifiSettingsConnectWifi()
{
  Serial.print("Conectando o Wifi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado com sucesso!");
}

//--- CONECTA AO MQTT ---
void mqttConnectServer()
{
  Serial.print("Checando o wifi...");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\n Conectando...");
  // client.connect(client_id, "public", "public");
  while (!client.connect(client_id, mqttUser, mqttPassword))
  {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nMQTT Server Connected!");
  client.subscribe(topicTemperature);
  // client.unsubscribe("/hello");
}

//--- RECONECTA O MQTT ---
void mqttReconnect()
{
  while (!client.connected())
  {
    Serial.println("\n\rServidor mqtt não conectado, tentando a reconexão...");
    mqttConnectServer();
  }
}

//--- PUBLICA A TEMP. ---
void publishAtTopicTemperature()
{
  //Publicação com intervalo de tempo entre as publicações
  // currentTime = millis() - lastMillis;
  // if (currentTime > TIME_INTERRUPT)
  // {
  //   lastMillis = millis();
  //   char valueNum[20];
  //   sprintf(valueNum, "%f", temperature);
  //   client.publish(
  //       topicTemperature,
  //       valueNum);
  // }

  currentTime = millis() - lastMillis;
  char valueNum[20];
  sprintf(valueNum, "%f", temperature);
  client.publish(
    topicTemperature,
    valueNum
  );
  lastMillis = millis();
}

//--- MEDIÇÃO DE TEMPERATURA ---
void measureTemperature()
{
  int analogicValue = analogRead(LM35_ANALOG);
  float milivolts = analogicValue * (3300.0 / 1024);
  temperature = milivolts / 10; // Cada 10mV = 1Cº [Em Celsius]

  publishAtTopicTemperature();
  showMeasurements();
}

//--- Envia a temperatura pela comunicação Serial ---
void showMeasurements()
{
  Serial.print("Temperatura: ");
  Serial.print(abs(temperature));
  Serial.print(" *C");
  Serial.print(", ");
  Serial.println(currentTime);
}

//!--- [TIMER] ---
//Funcao callback a ser chamada no estouro do Timer @pidTimer
void timerCallBack(void *tCall)
{
  _timeout = true;
}
//Funcao que configura o @pidTimer
void timerInit(void)
{
  os_timer_setfn(&pidTimer, timerCallBack, NULL);
  os_timer_arm(&pidTimer, TIME_INTERRUPT, true);
}