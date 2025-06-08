const filters = [
  { usbVendorId: 0x2341 }, // Arduino SA
];

const baudRate = 9600;

// CRC-16 (Modbus) calculation
function modbusCRC16 (buffer) {
  let crc = 0xFFFF;

  for (let pos = 0; pos < buffer.length; pos++) {
    crc ^= buffer[pos];

    for (let i = 0; i < 8; i++) {
      if ((crc & 0x0001) !== 0) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

// Function to verify CRC
function verifyCRC (buffer) {
  const dataWithoutCRC = buffer.slice(0, -2);
  const receivedCRC = (buffer[buffer.length - 1] << 8) | buffer[buffer.length - 2];
  const calculatedCRC = modbusCRC16(dataWithoutCRC);
  return receivedCRC === calculatedCRC;
}

function isSupported () {
  return 'serial' in navigator;
}

async function connectToDevice (arduinoDevicesOnly) {
  return await navigator.serial.requestPort(arduinoDevicesOnly ? { filters } : undefined);
}

async function openPort (port) {
  return await port.open({ baudRate });
}

function createReadHoldingRegistersRequest (slaveId, startAddress, quantity) {
  // Create buffer for frame without CRC
  const buffer = new Uint8Array(6);
  buffer[0] = slaveId; // Slave address
  buffer[1] = 0x03; // Function code for Read Holding Registers
  buffer[2] = (startAddress >> 8) & 0xFF; // High byte of start address
  buffer[3] = startAddress & 0xFF; // Low byte of start address
  buffer[4] = (quantity >> 8) & 0xFF; // High byte of quantity
  buffer[5] = quantity & 0xFF; // Low byte of quantity

  // Calculate CRC
  const crc = modbusCRC16(buffer);
  const crcBytes = new Uint8Array(2);
  crcBytes[0] = crc & 0xFF; // CRC Low byte
  crcBytes[1] = (crc >> 8) & 0xFF; // CRC High byte

  // Append CRC to frame
  const frame = new Uint8Array(buffer.length + 2);
  frame.set(buffer, 0);
  frame.set(crcBytes, buffer.length);

  return frame;
}

function createWriteHoldingRegistersRequest (slaveId, startAddress, registerValues) {
  // registerValues is an array of register data (each 16-bit)
  const quantity = registerValues.length;
  const byteCount = quantity * 2; // 2 bytes per register

  // Create buffer for frame without CRC
  const buffer = new Uint8Array(7 + byteCount);
  buffer[0] = slaveId; // Slave address
  buffer[1] = 0x10; // Function code for Write Multiple Registers
  buffer[2] = (startAddress >> 8) & 0xFF; // High byte of start address
  buffer[3] = startAddress & 0xFF; // Low byte of start address
  buffer[4] = (quantity >> 8) & 0xFF; // High byte of quantity
  buffer[5] = quantity & 0xFF; // Low byte of quantity
  buffer[6] = byteCount; // Byte count

  // Fill in register values
  for (let i = 0; i < quantity; i++) {
    buffer[7 + i * 2] = (registerValues[i] >> 8) & 0xFF; // High byte of register value
    buffer[8 + i * 2] = registerValues[i] & 0xFF; // Low byte of register value
  }

  // Calculate CRC
  const crc = modbusCRC16(buffer);
  const crcBytes = new Uint8Array(2);
  crcBytes[0] = crc & 0xFF; // CRC Low byte
  crcBytes[1] = (crc >> 8) & 0xFF; // CRC High byte

  // Append CRC to frame
  const frame = new Uint8Array(buffer.length + 2);
  frame.set(buffer, 0);
  frame.set(crcBytes, buffer.length);

  return frame;
}

function processModbusResponse (responseBuffer, expectedSlaveId) {
  const buffer = responseBuffer;

  const slaveId = buffer[0];

  const functionCode = buffer[1];

  switch (functionCode) {
    case 0x03: // Read Holding Registers
    {
      const byteCount = buffer[2];

      // Response structure for function 0x10:
      // [slaveId, functionCode, byteCount, [dataHi, dataLo, ...], CRCLo, CRCHi]
      // Usually 8 bytes
      if (buffer.length !== byteCount + 5) {
        throw new Error('Unexpected response length for function 0x03');
      }

      // Verify CRC (assumed you have a verifyCRC function)
      if (!verifyCRC(buffer)) {
        throw new Error('CRC check failed');
      }

      // Verify that response is from the expected slave
      if (slaveId !== expectedSlaveId) {
        throw new Error(`Unexpected slave ID: ${slaveId}`);
      }

      const registerData = [];
      for (let i = 0; i < byteCount; i += 2) {
        const highByte = buffer[3 + i];
        const lowByte = buffer[4 + i];
        const value = (highByte << 8) | lowByte;
        registerData.push(value);
      }
      return registerData;
    }

    case 0x10: // Write Multiple Registers
    {
      // Response structure for function 0x10:
      // [slaveId, functionCode, startAddrHi, startAddrLo, quantityHi, quantityLo, CRCLo, CRCHi]
      // Usually 8 bytes
      if (buffer.length !== 8) {
        throw new Error('Unexpected response length for function 0x10');
      }

      // Verify CRC (assumed you have a verifyCRC function)
      if (!verifyCRC(buffer)) {
        throw new Error('CRC check failed');
      }

      // Verify that response is from the expected slave
      if (slaveId !== expectedSlaveId) {
        throw new Error(`Unexpected slave ID: ${slaveId}`);
      }

      const startAddr = (buffer[2] << 8) | buffer[3];
      const quantity = (buffer[4] << 8) | buffer[5];

      return {
        startAddress: startAddr,
        quantity,
      };
    }

    default:
      throw new Error(`Unsupported function code: ${functionCode?.toString(16).padStart(2, '0')}`);
  }
}

export default {
  install: app => {
    app.provide('$api', {
      isSupported,
      connectToDevice,
      openPort,
      createReadHoldingRegistersRequest,
      createWriteHoldingRegistersRequest,
      processModbusResponse,
    });
  },
}
