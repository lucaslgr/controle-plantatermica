// #include <Arduino.h>

// //--- WIFI ---
// #include <ESP8266WiFi.h>
// const char *ssid = "WOLF_2Ghz";
// const char *password = "wheyebatatadoce";
// WiFiClient nodemcuClient;

// //--- MQTT CLIENT ---
// #include <PubSubClient.h>
// const char *mqtt_server = "pid-controller.cloud.shiftr.io";
// // const char *mqtt_server = "test.mosquitto.org";
// const char *client_id = "nodemcu";
// PubSubClient client(nodemcuClient);
// const char *topicTemperature = "controlproject/temperature";
// const char *topicHumidity = "controlproject/humidity";
// #define MQTT_BROKER_PORT 1883 // insecure port TCP

// //--- DHT ---
// #include <DHT.h>
// #define DHTPIN D3 //Setando o pino de DATA do DHT11
// #define DHTTYPE DHT11
// DHT dht(DHTPIN, DHTTYPE);

// //--- SETUP ---
// int humidity = 0, temperature = 0;
// void wifiSettingsConnectWifi();
// void mqttReconnect();
// void measureTemperatureAndHumidity();
// void publishAtTopicTemperatureAndHumidity();
// void showMeasurements();

// void setup()
// {
//   Serial.begin(115200);
//   wifiSettingsConnectWifi();
//   client.setServer(mqtt_server, MQTT_BROKER_PORT);
// }

// //--- LOOP ---
// void loop()
// {
//   if (!client.connected())
//     mqttReconnect();
//   measureTemperatureAndHumidity();
// }

// //--- CONECTA AO WIFI ---
// void wifiSettingsConnectWifi()
// {
//   Serial.print("Conectando o Wifi...");
//   WiFi.begin(ssid, password);
//   while (WiFi.status() != WL_CONNECTED)
//   {
//     delay(500);
//     Serial.print(".");
//   }
//   Serial.println("WiFi conectado com sucesso!");
// }

// //--- RECONECTA O MQTT ---
// void mqttReconnect()
// {
//   while (!client.connected())
//   {
//     Serial.println("\n\rServidor mqtt não conectado, tentando a reconexão...");
//     client.connect(client_id);
//   }
// }

// //--- PUBLICA A TEMP. E A UMIDADE NOS SEUS RESPECTIVOS TÓPICOS ---
// void publishAtTopicTemperatureAndHumidity()
// {
//   client.publish(
//       topicTemperature,
//       String(temperature).c_str(),
//       true);

//   client.publish(
//       topicHumidity,
//       String(humidity).c_str(),
//       true);
// }

// //--- MEDIÇÃO DE TEMPERATURA E UMIDADE ---
// void measureTemperatureAndHumidity()
// {
//   humidity = dht.readHumidity();
//   temperature = dht.readTemperature(false);

//   if (!isnan(temperature) && !isnan(humidity) && temperature != 2147483647 && humidity != 2147483647)
//   {
//     publishAtTopicTemperatureAndHumidity();
//     showMeasurements();
//     delay(5000);
//   }
//   else
//   {
//     delay(5000);
//   }
// }

// //--- MOSTRA A TEMPERATURA E A UMIDADE ---
// void showMeasurements()
// {
//   Serial.print("Temperatura: ");
//   Serial.print(abs(temperature));
//   Serial.print(" *C");
//   Serial.print(" | ");
//   Serial.print("Umidade: ");
//   Serial.println(abs(humidity));
// }
