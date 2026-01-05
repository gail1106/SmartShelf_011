#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define PIN_BUZZER 2
#define PIN_LED_RED 5
#define PIN_LED_BLUE 4
#define PIN_LED_GREEN 3
#define PIN_RAIN_SENSOR 7
#define PIN_BAROMETER A1

int waterLevelSensor = A0;
int waterLevelValue = 0;
int isRaining = 0;
int rainStrength = 0;

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_BLUE, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_RAIN_SENSOR, INPUT);

  lcd.print("Initializing...");
}

void loop() {
  // put your main code here, to run repeatedly:
  waterLevelValue = analogRead(waterLevelSensor);
  Serial.print("Water Level: ");
  Serial.println(waterLevelValue);
  rainStrength = analogRead(PIN_BAROMETER);
  Serial.print("barometer: ");
  Serial.println(rainStrength);
  delay(60);
  isRaining = digitalRead(PIN_RAIN_SENSOR);

  if(rainStrength > 170){
    lcd.setCursor(0, 1);
    lcd.print("barometer: 70 ml");
  }else if(rainStrength > 160){
    lcd.setCursor(0, 1);
    lcd.print("barometer: 60 ml");
  }else if(rainStrength > 150){
    lcd.setCursor(0, 1);
    lcd.print("barometer: 50 ml");
  }else{
    lcd.setCursor(0, 1);
    lcd.print("barometer < 45ml");
  }

  if(isRaining == 0){
      if(waterLevelValue > 300){
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_BLUE, LOW);
      digitalWrite(PIN_LED_RED, LOW);
      lcd.setCursor(0, 0);
      lcd.print("                ");
      lcd.setCursor(0, 0);
      lcd.print("Dangerous!!!");
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_RED, HIGH);
      delay(600);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_RED, LOW);
      delay(200);
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_RED, HIGH);
      delay(600);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_RED, LOW);
      delay(200);
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_RED, HIGH);
      delay(600);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_RED, LOW);
      delay(200);
    }else if(waterLevelValue > 250){
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_BLUE, LOW);
      digitalWrite(PIN_LED_RED, LOW);
      lcd.setCursor(0, 0);
      lcd.print("                ");
      lcd.setCursor(0, 0);
      lcd.print("Alert!!!");
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_BLUE, HIGH);
      delay(200);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_BLUE, LOW);
      delay(200);
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_BLUE, HIGH);
      delay(200);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_BLUE, LOW);
      delay(200);
      tone(PIN_BUZZER, 1000);
      digitalWrite(PIN_LED_BLUE, HIGH);
      delay(200);
      noTone(PIN_BUZZER);
      digitalWrite(PIN_LED_BLUE, LOW);
      delay(200);
    }else{
      digitalWrite(PIN_LED_GREEN, HIGH);
      lcd.setCursor(0, 0);
      lcd.print("                ");
      lcd.setCursor(0, 0);
      lcd.print("Not Hazardous   ");
      delay(3000);
      digitalWrite(PIN_LED_GREEN, LOW);
    }
    
  }else{
    lcd.setCursor(0, 0);
    lcd.print("No Rain Detected");
    lcd.setCursor(0, 1);
    lcd.print("                ");
  }
  delay(1000);
}
