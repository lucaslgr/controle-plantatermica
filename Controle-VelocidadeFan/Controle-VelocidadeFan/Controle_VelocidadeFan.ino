#define PINO_PWM A0
#define TEMPO_NA_MESMA_VELOCIDADE     300  //tempo (ms) em que o motor ficara na mesma velocidade 

void setup()
{
  pinMode(PINO_PWM, OUTPUT);
}

void loop() {
  int valor_pwm = 0;   //variavel que armazena o valor do PWM (0..255 -> 0%..100% da rotação do motor)

  //Aumento de velocidade (0%..100%)
  for (valor_pwm = 0; valor_pwm < 256; valor_pwm++)
  {
    analogWrite(PINO_PWM, valor_pwm);
    delay(TEMPO_NA_MESMA_VELOCIDADE);
  }

  //Diminuição de velocidade (100%..0%)
  for (valor_pwm = 255; valor_pwm >= 0; valor_pwm--)
  {
    analogWrite(PINO_PWM, valor_pwm);
    delay(TEMPO_NA_MESMA_VELOCIDADE);
  }
}
