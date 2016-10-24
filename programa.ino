#include "Thread.h"
#include "ThreadController.h"
ThreadController cpu;


String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete


int HR_PIN = 7;
int pinoLM35 = A1;
int pinoPressao = A0;


long hr = 0;

long last_hr_ts = 0;
long last_report_ts = 0;
int report_delay = 1000; //Must be > 1000 miliseconds
long atualiza = 0;

long samples[8] = {0};  //size was chosen since it's optimized in division and modulus
byte last_sample = 0;


int valorLidoPressao;
float pressao = 0;

int valorLidoTemperatura;
float temperatura = 0;


Thread verificaTemperatura;
void lerTemperatura() {
  valorLidoTemperatura = 0;
  for(int i= 0; i<10; i++) {
    valorLidoTemperatura += analogRead(pinoLM35);
  }
  temperatura = ((valorLidoTemperatura/10) * 0.00488) * 100;
  //temperatura = temperatura * 100;
  //Serial.print("Temperatura actual: ");
  //Serial.println(temperatura);  
}

Thread verificaPressao;
void lerPressao() {
  valorLidoPressao = 0;
  for(int i= 0; i<10; i++) {
    valorLidoPressao += analogRead(pinoPressao);
  }
  pressao = valorLidoPressao/10;
  //Serial.print("Temperatura actual: ");
  //Serial.println(temperatura);  
}

Thread verificaCo2;
void lerCo2() {
  //valorLidoTemperatura = analogRead(pinoLM35);
  //temperatura = (valorLidoTemperatura * 0.00488);
  //temperatura = temperatura * 100;
  //Serial.print("Temperatura actual: ");
  //Serial.println(temperatura);  
}

void setup() {
  // initialize serial:
  Serial.begin(9600);
  
  pinMode(HR_PIN, INPUT); 
  // reserve 200 bytes for the inputString:
  inputString.reserve(200);
  
  verificaTemperatura.setInterval(500);
  verificaTemperatura.onRun(lerTemperatura);
  
  verificaPressao.setInterval(500);
  verificaPressao.onRun(lerPressao);
  
  verificaCo2.setInterval(10000);
  verificaCo2.onRun(lerCo2);
  
  
  cpu.add(&verificaTemperatura);
  cpu.add(&verificaPressao);
  cpu.add(&verificaCo2);
  
  
  

}

void loop() {
  cpu.run();
  // print the string when a newline arrives:
  long current_time = millis();
  
  if (current_time - atualiza > 1000)   {
    atualiza = current_time;
    stringComplete = true;
  }
  
  
  if (digitalRead(HR_PIN) == HIGH)  {
        //First sample will be garbage, since last_hr_ts = 0
        //dt < 10 means the same sample. Otherwise it means hr of 6000bpm...
        //That's fast even for a colibri
        if (current_time - last_hr_ts > 10) {
            byte next_sample = ((last_sample + 1) % 8);
            samples[next_sample] = current_time - last_hr_ts;
            last_sample = next_sample;
        }
        last_hr_ts = current_time;
      }

  if (current_time - last_report_ts > report_delay)   {
    if (current_time - last_hr_ts < report_delay) {
      {
        long sum_samples = 0;
        byte i;
        for (i = 1; i < 9; ++i) {
          sum_samples += samples[((last_sample + i) % 8)];  //optimizes to (last_sample + 1)&7
      }
        sum_samples /= 8;  //optimizes to sum_samples >>= 3
          /*To be accurate (2 digits), we multiply the sample  by 100, and finally divide result */
        //hr = ((100000/(sum_samples))*60)/100;
        hr = (6000000/(sum_samples))/100;
        //Serial.println(hr);
      }
    } else {
      //Serial.println("Sem sinal Fc");
    }
    last_report_ts = current_time;
  }

  if (stringComplete) {
    //Serial.print("Valor string: ");    
    //Serial.print(inputString);
    Serial.print("{\"p\":\"");    
    Serial.print(pressao);
    Serial.print("\", \"f\":\"");    
    Serial.print(hr);
    Serial.print("\", \"t\": \"");
    Serial.print(temperatura);
    Serial.print("\"}\n");
    //Serial.println();
    
    
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
}

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  
  
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read(); 
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    } 
  }
}


