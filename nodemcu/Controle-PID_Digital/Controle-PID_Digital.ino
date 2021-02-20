void setup() {
  // put your setup code here, to run once:
  int vdig;
  float Kp=10.0, Kd=5, Ki=20, v,temp,erro,m,ref=50.0, erroa=0.0, dedt, integral=0.0;
  pinMode(3,OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  vdig = analogRead(0);
  v=(5.0/1023.0)*float(vdig);
  temp=v/(10e-3);

  // Controle PID 
  erro=ref-temp;
  dedt=(erro-erroa)/0.1;
  integral=integral+((erro+erroa)/2.0)*0.1;
  m=Kp*erro+Kd*dedt+Ki*integral; // Proporcional+Derivativo
  erroa=erro;
  if (m>255)
    m=255;
  analogWrite(3,int(m));
  
  delay(100);
}
