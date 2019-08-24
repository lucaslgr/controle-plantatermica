
/*
  Caracteristicas da porta analógica:
  -> 0V = 0
  -> 5V = 1023

  Caracteristica do sensor LM35:
  -> cada grau Celsius são 10mV/ºC

  Cáculo:
  Tensão em A0 = (Valor emitido pelo sensor) * (5.0/1023)
  Temperatura = (Tensão em A0) / 10mV
*/
#define pino A0
float temp = 0.0, ultimatemp = 0.0;


void setup()
{
  Serial.begin(9600);
}

void loop()
{
  //temp = ((analogRead(pino) * (5.0 / 1023)) / 0.01); //Para arduino
  temp = ((analogRead(pino) * (3.0 / 1023)) / 0.01); //Para NODEMCU

  //Se não houver alteração na temperatura, imprime o valor anterior
  if (temp != ultimatemp)
  {
    ultimatemp = temp;
    Serial.print("Temp: ");
    Serial.print(temp);
    Serial.println("ºC");
  }
  delay(1000);
}
