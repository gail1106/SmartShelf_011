#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- WIFI SETTINGS ---
const char* WIFI_SSID = "WIFIALIABO 2.4G";
const char* WIFI_PASS = "KAPITANDANDAN";

// --- API SETTINGS ---
const char* API_URL = "https://smartshelf-2025.onrender.com";

// --- RFID SETTINGS ---
#define SS_PIN 5      // SDA
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

// --- Multiple UID Definitions ---
#define MAX_CARDS 21  // Total number of cards
#define UID_SIZE 4    // Standard 4-byte UID

byte acceptedUIDs[MAX_CARDS][UID_SIZE] = {
    {0x25, 0xDE, 0x80, 0x05},{0xA3, 0x7B, 0xA2, 0x02},{0x93, 0x89, 0xA4, 0x02},
    {0x53, 0x3F, 0xA8, 0x02},{0x93, 0xA8, 0xA3, 0x02},{0x83, 0x3C, 0xA8, 0x02},
    {0x93, 0xC5, 0xAD, 0x02},{0x23, 0xAC, 0xB2, 0x02},{0xA3, 0xE9, 0xA3, 0x02},
    {0x63, 0x82, 0xB7, 0x02},{0x63, 0x78, 0xB2, 0x02},{0x03, 0x35, 0x5C, 0xFE},
    {0x93, 0x72, 0x5D, 0xFE},{0x53, 0xC8, 0x67, 0xFE},{0x23, 0x62, 0x5B, 0xFE},
    {0xB3, 0x31, 0x5B, 0xFE},{0x43, 0x58, 0x67, 0xFE},{0x93, 0xFB, 0x5C, 0xFE},
    {0xA3, 0xBF, 0x5A, 0xFE},{0x23, 0x30, 0x5C, 0xFE},{0xD3, 0xA0, 0x5D, 0xFE}
};

// 0 = Available (IN), 1 = Unavailable (OUT)
int cardStatus[MAX_CARDS] = {0};

// --- WIFI FUNCTIONS ---
void wifiConnect() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected.");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to WiFi. Restarting...");
        delay(5000);
        ESP.restart();
    }
    Serial.println("------------------------------------");
}

// --- POST TO API ---
void sendTagStatus(int index) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected. Reconnecting...");
        wifiConnect();
        return;
    }

    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument jsonDoc(128);
    char uidString[9]; // 4 bytes UID -> 8 hex chars + null

    sprintf(uidString, "%02X%02X%02X%02X",
        acceptedUIDs[index][0],
        acceptedUIDs[index][1],
        acceptedUIDs[index][2],
        acceptedUIDs[index][3]);

    jsonDoc["uid"] = String(uidString);
    jsonDoc["status"] = (cardStatus[index] == 0) ? "IN" : "OUT";

    String requestBody;
    serializeJson(jsonDoc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("API Response [%d]: %s\n", httpResponseCode, response.c_str());
    } else {
        Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

// --- RFID STATUS PRINT ---
void printAllTagStatus() {
    Serial.println("\n--- 📦 Current Inventory Status ---");
    for (int i = 0; i < MAX_CARDS; i++) {
        Serial.printf("Tag #%02d (UID: %02X %02X %02X %02X): ",
            i + 1,
            acceptedUIDs[i][0], acceptedUIDs[i][1],
            acceptedUIDs[i][2], acceptedUIDs[i][3]);

        if (cardStatus[i] == 0) Serial.println("🟢 IN (On Shelf)");
        else Serial.println("🔴 OUT (Checked Out)");
    }
    Serial.println("----------------------------------");
}

// --- SETUP ---
void setup() {
    Serial.begin(115200);
    delay(100);
    SPI.begin(18, 19, 23);
    rfid.PCD_Init();

    wifiConnect();

    Serial.println("SmartShelf RFID + WiFi ready.");
    Serial.println("Scan a tag to check in/out, or type 'STATUS' in Serial Monitor.");
}

// --- LOOP ---
void loop() {
    // Serial Command Check
    if (Serial.available()) {
        String command = Serial.readStringUntil('\n');
        command.trim();
        command.toUpperCase();
        if (command == "STATUS") printAllTagStatus();
        while (Serial.available()) Serial.read();
    }

    // Check for new RFID card
    if (!rfid.PICC_IsNewCardPresent()) return;
    if (!rfid.PICC_ReadCardSerial()) return;

    bool cardFound = false;

    if (rfid.uid.size == UID_SIZE) {
        for (int i = 0; i < MAX_CARDS; i++) {
            if (memcmp(rfid.uid.uidByte, acceptedUIDs[i], UID_SIZE) == 0) {
                cardFound = true;
                // Toggle status
                if (cardStatus[i] == 0) {
                    cardStatus[i] = 1;
                    Serial.printf("✅ Tag #%d CHECKED OUT (OUT)\n", i + 1);
                } else {
                    cardStatus[i] = 0;
                    Serial.printf("🔄 Tag #%d CHECKED IN (IN)\n", i + 1);
                }
                // Send update to API
                sendTagStatus(i);
                break;
            }
        }
    }

    if (!cardFound) {
        Serial.print("❌ Unknown Tag Scanned: ");
        for (byte i = 0; i < rfid.uid.size; i++) {
            Serial.printf("%02X ", rfid.uid.uidByte[i]);
        }
        Serial.println(" -> Not tracked.");
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}
