/*
 * Copyright 2025 DJ WoodZ (djwoodz.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /*
 * Arduino Modbus Controller Firmware by DJ WoodZ
 *
 * This code accompanies the Arduino Modbus Controller:
 * https://arduino-modbus.djwoodz.com/
 *
 * Dependencies:
 *   ModbusRTUSlave by C. M. Bulliner: https://github.com/CMB27/ModbusRTUSlave
 *
 * Arduino Modbus Controller Firmware v1.0 (8 June 2025)
 */

#include "Arduino_LED_Matrix.h"
#include "ModbusRTUSlave.h"

ModbusRTUSlave modbus(Serial);
ModbusRTUSlave modbus1(Serial1);
ArduinoLEDMatrix matrix;

bool coils[1];

#define ROWS 12
#define COLS 8
#define REGISTERS ROWS / 2

uint16_t holdingRegisters[REGISTERS] = {
  (uint16_t) random(0, 65536), // LED rows 1 & 2
  (uint16_t) random(0, 65536), // LED rows 3 & 4
  (uint16_t) random(0, 65536), // LED rows 5 & 6
  (uint16_t) random(0, 65536), // LED rows 7 & 8
  (uint16_t) random(0, 65536), // LED rows 9 & 10
  (uint16_t) random(0, 65536), // LED rows 11 & 12
};

// rotate uint16_t array and pack into uint32_t array
void rotateAndPack(uint16_t input[REGISTERS], uint32_t output[3]) {
  output[0] = output[1] = output[2] = 0;

  for (int position = 0; position < ROWS * COLS; position++) {
    int colIndex = position / ROWS; // 0 - 7
    int rowIndex = ROWS - 1 - (position % ROWS); // 0 - 11

    uint16_t holdingRegister = input[rowIndex / 2];

    uint8_t byte;
    if (rowIndex % 2 == 0) {
      // high byte
      byte = (holdingRegister >> 8) & 0xFF;
    } else {
      // low byte
      byte = holdingRegister & 0xFF;
    }

    bool bitSet = byte & (1 << (7 - colIndex));

    int uint32Index = position / 32;
    int bitPosition = 31 - (position % 32);

    if (bitSet) {
      output[uint32Index] |= (1UL << bitPosition);
    }
  }
}

void updateMatrix() {
  uint32_t packed[3] = {0};
  rotateAndPack(holdingRegisters, packed);
  matrix.loadFrame(packed);
}

void setup() {
  matrix.begin();

  modbus.configureHoldingRegisters(holdingRegisters, REGISTERS);
  Serial.begin(9600);
  modbus.begin(1, 9600);

  modbus1.configureHoldingRegisters(holdingRegisters, REGISTERS);
  Serial1.begin(9600);
  modbus1.begin(1, 9600);
}

void loop() {
  modbus.poll();
  modbus1.poll();
  updateMatrix();
}
