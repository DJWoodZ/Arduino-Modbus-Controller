import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/plugins/api';
import apiPlugin from '../../src/plugins/api';

const { modbusCRC16, verifyCRC, isSupported, connectToDevice, openPort, createReadHoldingRegistersRequest, createWriteHoldingRegistersRequest, processModbusResponse } = api;

afterEach(() => {
  vi.restoreAllMocks();
})

describe('modbusCRC16', () => {
  it('should calculate the CRC of an empty buffer', () => {
    expect(modbusCRC16(Buffer.from([]))).toBe(0xFFFF);
  });

  it('should calculate the CRC of a known input', () => {
    const buffer = Buffer.from([0x01, 0x10, 0xC0, 0x03, 0x00, 0x01]);
    const crc = modbusCRC16(buffer);
    expect(crc).toBe(0xC9CD);
  });

  it('should calculate the CRC of a single byte', () => {
    const buffer = Buffer.from([0xFF]);
    const crc = modbusCRC16(buffer);
    expect(crc).toBe(0x00FF);
  });

  it('should calculate the CRC of multiple bytes', () => {
    const buffer = Buffer.from([0x12, 0x34, 0x56, 0x78]);
    const crc = modbusCRC16(buffer);
    expect(crc).toBe(0x107B);
  });
});

describe('verifyCRC', () => {
  it('should call modbusCRC16 with correct input', () => {
    const crc = 0xABCD;
    const spy = vi.spyOn(api, 'modbusCRC16').mockReturnValue(crc);

    const data = Uint8Array.from([0x01, 0x10, 0xC0, 0x03, 0x00, 0x01]);

    // Append CRC to data to form a full frame
    const bufferWithCRC = new Uint8Array([...data, crc & 0xFF, (crc >> 8) & 0xFF]);
    expect(verifyCRC(bufferWithCRC)).toBe(true);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(data);
  });

  it('should verify a buffer with correct CRC', () => {
    const data = Uint8Array.from([0x01, 0x10, 0xC0, 0x03, 0x00, 0x01]);
    const crc = 0xC9CD;

    // Append CRC to data to form a full frame
    const bufferWithCRC = new Uint8Array([...data, crc & 0xFF, (crc >> 8) & 0xFF]);
    expect(verifyCRC(bufferWithCRC)).toBe(true);
  });
  
  it('should detect a buffer with an incorrect CRC', () => {
    const data = Uint8Array.from([0x01, 0x04, 0x00, 0x00, 0x00, 0x02]);
    // Append intentionally incorrect CRC
    const corruptedBuffer = Uint8Array.from([...data, 0x00, 0x00]);
    expect(verifyCRC(corruptedBuffer)).toBe(false);
  });
});

describe('isSupported', () => {
  it('should return true when navigator.serial exists', () => {
    // Mock navigator.serial
    const originalSerial = navigator.serial;
    navigator.serial = {};
    
    expect(isSupported()).toBe(true);
    
    // Restore original navigator.serial
    navigator.serial = originalSerial;
  });
  
  it('should return false when navigator.serial does not exist', () => {
    // Temporarily delete navigator.serial
    const originalSerial = (navigator).serial;
    delete navigator.serial;
    
    expect(isSupported()).toBe(false);
    
    // Restore original navigator.serial
    navigator.serial = originalSerial;
  });
});

describe('connectToDevice', () => {
  const filters = [{ usbVendorId: 0x2341 }];

  beforeEach(() => {
    // Mock navigator.serial.requestPort before each test
    navigator.serial = {
      requestPort: vi.fn(),
    };
  });

  it('should call requestPort with filters when arduinoDevicesOnly is true', async () => {
    const mockPort = { id: 'mock-port-1' };
    navigator.serial.requestPort.mockResolvedValue(mockPort);

    const result = await connectToDevice(true);

    expect(navigator.serial.requestPort).toHaveBeenCalledWith({ filters });
    expect(result).toBe(mockPort);
  });

  it('should call requestPort without arguments when arduinoDevicesOnly is false', async () => {
    const mockPort = { id: 'mock-port-2' };
    navigator.serial.requestPort.mockResolvedValue(mockPort);

    const result = await connectToDevice(false);

    expect(navigator.serial.requestPort).toHaveBeenCalledWith(undefined);
    expect(result).toBe(mockPort);
  });
});

describe('openPort', () => {
  it('should call port.open with correct baudRate and return its result', async () => {
    const mockOpen = vi.fn().mockResolvedValue('opened');
    const port = { open: mockOpen };
    const baudRate = 9600;

    const result = await openPort(port, baudRate);

    expect(mockOpen).toHaveBeenCalledWith({ baudRate });
    expect(result).toBe('opened');
  });

  it('should handle errors thrown by port.open', async () => {
    const mockOpen = vi.fn().mockRejectedValue(new Error('Failed to open'));
    const port = { open: mockOpen };
    const baudRate = 115200;

    await expect(openPort(port, baudRate)).rejects.toThrow('Failed to open');
  });
});

describe('createReadHoldingRegistersRequest', () => {
  it('should call modbusCRC16 with correct input', () => {
    const crc = 0xABCD;
    const spy = vi.spyOn(api, 'modbusCRC16').mockReturnValue(crc);

    const slaveId = 1;
    const startAddress = 0x0010; // 16
    const quantity = 0x0002; // 2

    createReadHoldingRegistersRequest(slaveId, startAddress, quantity);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(new Uint8Array([
      0x01,
      0x03,
      0x00,
      0x10,
      0x00,
      0x02,
    ]));
  });

  it('should create a valid frame with correct structure', () => {
    const slaveId = 1;
    const startAddress = 0x0010; // 16
    const quantity = 0x0002; // 2

    const frame = createReadHoldingRegistersRequest(slaveId, startAddress, quantity);

    // The frame should be a Uint8Array of length 8 (6 + 2 CRC bytes)
    expect(frame).toBeInstanceOf(Uint8Array);
    expect(frame.length).toBe(8);

    // Check the first two bytes: slave ID and function code
    expect(frame[0]).toBe(slaveId);
    expect(frame[1]).toBe(0x03);

    // Check start address bytes
    expect(frame[2]).toBe((startAddress >> 8) & 0xFF);
    expect(frame[3]).toBe(startAddress & 0xFF);

    // Check quantity bytes
    expect(frame[4]).toBe((quantity >> 8) & 0xFF);
    expect(frame[5]).toBe(quantity & 0xFF);

    // Check CRC bytes
    expect(frame[6]).toBe(0xC5);
    expect(frame[7]).toBe(0xCE);
  });
});

describe('createWriteHoldingRegistersRequest', () => {
  it('should call modbusCRC16 with correct input', () => {
    const crc = 0xABCD;
    const spy = vi.spyOn(api, 'modbusCRC16').mockReturnValue(crc);

    const slaveId = 1;
    const startAddress = 0x0010;
    const registerValues = [0x1234, 0xABCD];

    createWriteHoldingRegistersRequest(slaveId, startAddress, registerValues);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(new Uint8Array([
      0x01,
      0x10,
      0x00,
      0x10,
      0x00,
      0x02,
      0x04,
      0x12,
      0x34,
      0xAB,
      0xCD,
    ]));
  });

  it('should create a correct frame for given inputs', () => {
    const slaveId = 1;
    const startAddress = 0x0010;
    const registerValues = [0x1234, 0xABCD];

    // Generate the frame
    const frame = createWriteHoldingRegistersRequest(slaveId, startAddress, registerValues);

    // Basic length check: 7 header + 2 registers * 2 bytes each + 2 CRC bytes
    expect(frame.length).toBe(7 + registerValues.length * 2 + 2);

    // Verify header fields
    expect(frame[0]).toBe(slaveId); // Slave ID
    expect(frame[1]).toBe(0x10); // Function code
    expect(frame[2]).toBe((startAddress >> 8) & 0xFF); // High byte of start address
    expect(frame[3]).toBe(startAddress & 0xFF); // Low byte of start address
    expect(frame[4]).toBe((registerValues.length >> 8) & 0xFF); // High byte of quantity
    expect(frame[5]).toBe(registerValues.length & 0xFF); // Low byte of quantity
    expect(frame[6]).toBe(registerValues.length * 2); // Byte count

    // Verify register values
    expect(frame[7]).toBe((registerValues[0] >> 8) & 0xFF);
    expect(frame[8]).toBe(registerValues[0] & 0xFF);
    expect(frame[9]).toBe((registerValues[1] >> 8) & 0xFF);
    expect(frame[10]).toBe(registerValues[1] & 0xFF);

    // Verify CRC
    const crcReceived = (frame[frame.length - 1] << 8) | frame[frame.length - 2];
    expect(crcReceived).toBe(0xB008);
  });

  it('should handle different start addresses and register values', () => {
    const slaveId = 2;
    const startAddress = 0x00FF;
    const registerValues = [0x0001, 0x00FF, 0xABCD];

    const frame = createWriteHoldingRegistersRequest(slaveId, startAddress, registerValues);

    // Check header fields
    expect(frame[1]).toBe(0x10);
    expect(frame[2]).toBe(0x00);
    expect(frame[3]).toBe(0xFF);
    expect(frame[4]).toBe(0x00);
    expect(frame[5]).toBe(0x03); // 3 registers
    expect(frame[6]).toBe(6); // Byte count

    // Check register values
    expect(frame[7]).toBe(0x00);
    expect(frame[8]).toBe(0x01);
    expect(frame[9]).toBe(0x00);
    expect(frame[10]).toBe(0xFF);
    expect(frame[11]).toBe(0xAB);
    expect(frame[12]).toBe(0xCD);
  });
});

describe('processModbusResponse', () => {
  it('should call verifyCRC with correct input (function 0x03)', () => {
    const spy = vi.spyOn(api, 'verifyCRC').mockReturnValue(true);

    const responseBuffer = [
      1,    // Slave ID
      0x03, // Function code
      4,    // Byte count
      0x00, 0x0A, // register value 10
      0x00, 0x14, // register value 20
      0xDA, 0x3E, // CRC bytes
    ];

    processModbusResponse(responseBuffer, 1);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(responseBuffer);
  });

  it('should process a valid Read Holding Registers response (function 0x03)', () => {
    const responseBuffer = [
      1,    // Slave ID
      0x03, // Function code
      4,    // Byte count
      0x00, 0x0A, // register value 10
      0x00, 0x14, // register value 20
      0xDA, 0x3E, // CRC bytes
    ];

    const result = processModbusResponse(responseBuffer, 1);
    expect(result).toEqual([10, 20]);
  });

  it('should throw an error if response length for function 0x03 is incorrect', () => {
    const responseBuffer = [
      1,
      0x03,
      4,
      0x00, 0x0A, // Incomplete
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('Unexpected response length for function 0x03');
  });

  it('should throw an error if CRC check fails for function 0x03', () => {
    const responseBuffer = [
      1,
      0x03,
      4,
      0x00, 0x0A,
      0x00, 0x14,
      0x00, 0x00, // Invalid CRC bytes
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('CRC check failed');
  });

  it('should throw an error if slave ID does not match for function 0x03', () => {
    const responseBuffer = [
      2,    // Incorrect Slave ID
      0x03,
      4,
      0x00, 0x0A,
      0x00, 0x14,
      0xE9, 0x3E,
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('Unexpected slave ID: 2');
  });

  it('should call verifyCRC with correct input (function 0x10)', () => {
    const spy = vi.spyOn(api, 'verifyCRC').mockReturnValue(true);

    const responseBuffer = [
      1,    // Slave ID
      0x10, // Function code
      0x00, 0x10, // Start address high, low (16)
      0x00, 0x05, // Quantity high, low (5)
      0x01, 0xCF // CRC bytes
    ];

    processModbusResponse(responseBuffer, 1);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(responseBuffer);
  });

  it('should process a valid Write Multiple Registers response (function 0x10)', () => {
    const responseBuffer = [
      1,    // Slave ID
      0x10, // Function code
      0x00, 0x10, // Start address high, low (16)
      0x00, 0x05, // Quantity high, low (5)
      0x01, 0xCF // CRC bytes
    ];
    const result = processModbusResponse(responseBuffer, 1);
    expect(result).toEqual({ startAddress: 16, quantity: 5 });
  });

  it('should throw an error if response length for function 0x10 is incorrect', () => {
    const responseBuffer = [
      1,
      0x10,
      0x00, 0x10, // Incomplete
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('Unexpected response length for function 0x10');
  });

  it('should throw an error if CRC check fails for function 0x10', () => {
    const responseBuffer = [
      1,
      0x10,
      0x00, 0x10,
      0x00, 0x05,
      0x00, 0x00 // Invalid CRC bytes
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('CRC check failed');
  });

  it('should throw an error if slave ID does not match for function 0x10', () => {
    const responseBuffer = [
      2,    // Incorrect Slave ID
      0x10,
      0x00, 0x10,
      0x00, 0x05, 
      0x01, 0xFC
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('Unexpected slave ID: 2');
  });

  it('should throw an error for unsupported function code', () => {
    const responseBuffer = [
      1,
      0x99, // Unsupported function code
      0x00,
      0x00,
      0x00
    ];
    expect(() => processModbusResponse(responseBuffer, 1)).toThrow('Unsupported function code: 0x99');
  });
});

describe('API Plugin', () => {
  it('installs and provides $api with expected methods', () => {
    // Mock the app object with a provide method
    const provideMock = vi.fn();
    const app = {
      provide: provideMock,
    };

    // Call the install method
    apiPlugin.install(app);

    // Assert that provide was called once
    expect(provideMock).toHaveBeenCalledOnce();

    // Extract the first call argument
    const [token, apiObject] = provideMock.mock.calls[0];

    // Verify token
    expect(token).toBe('$api');

    // Verify that apiObject contains expected functions
    expect(apiObject.isSupported).toBe(isSupported);
    expect(apiObject.connectToDevice).toBe(connectToDevice);
    expect(apiObject.openPort).toBe(openPort);
    expect(apiObject.createReadHoldingRegistersRequest).toBe(createReadHoldingRegistersRequest);
    expect(apiObject.createWriteHoldingRegistersRequest).toBe(createWriteHoldingRegistersRequest);
    expect(apiObject.processModbusResponse).toBe(processModbusResponse);

    // verify no extra properties
    expect(Object.keys(apiObject).length).toEqual(6);
  });
});