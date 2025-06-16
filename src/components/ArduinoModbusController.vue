<template>
  <v-container>
    <v-row v-if="!supported" dense justify="center">
      <v-alert
        density="compact"
        type="error"
        variant="outlined"
      >Sorry, your browser does not support the Web Serial API. Please use a
        <a
          class="text-error"
          href="https://caniuse.com/web-serial"
          rel="noopener noreferrer"
          target="_blank"
        >compatible browser</a>.</v-alert>
    </v-row>

    <v-row dense justify="center">
      <v-col
        class="pa-2"
        cols="12"
        style="max-width: 600px;"
        xl="6"
      >
        <v-row v-for="rowIndex in leds.length" :key="'row-' + rowIndex" dense justify="center">
          <v-col
            v-for="colIndex in leds[rowIndex -1].length"
            :key="'col-' + colIndex + '-row-' + rowIndex"
            cols="auto"
          >
            <v-btn
              :color="leds[rowIndex -1][colIndex -1] ? 'primary' : null"
              density="compact"
              :disabled="!supported || !connected"
              :icon="leds[rowIndex -1][colIndex -1] ? 'mdi-led-on' : 'mdi-led-outline'"
              @click="onButtonClick(rowIndex - 1, colIndex -1)"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row dense justify="center">
      <!-- Left col -->
      <v-col
        class="pa-2"
        cols="12"
        style="max-width: 600px;"
        xl="6"
      >

        <v-row dense justify="end">
          <v-col class="text-end" cols="auto">
            <v-switch
              v-model="arduinoDevicesOnly"
              aria-label="List Arduino Devices Only"
              color="success"
              density="compact"
              :disabled="!supported || connected"
              hide-details
              label="Arduino Devices Only"
              title="List Arduino Devices Only"
            />
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Connect to device"
              :color="supported && !connected ? 'success' : 'grey-darken-1'"
              :disabled="!supported || connected"
              prepend-icon="mdi-power-plug-outline"
              title="Connect to device"
              @click="connectToDevice"
            >
              Connect
            </v-btn>
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Disconnect from device"
              :color="supported && connected ? 'error' : 'grey-darken-1'"
              :disabled="!supported || !connected"
              prepend-icon="mdi-power-plug-off-outline"
              title="Disconnect from device"
              @click="disconnectFromDevice"
            >
              Disconnect
            </v-btn>
          </v-col>
        </v-row>

        <v-row dense justify="end">
          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Turn all LEDs on"
              :color="supported && connected ? 'primary' : 'grey-darken-1'"
              :disabled="!supported || !connected"
              prepend-icon="mdi-led-on"
              title="Turn all LEDs on"
              @click="() => setAllLEDs (true, true)"
            >
              All On
            </v-btn>
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Turn all LEDs off"
              color="grey-darken-1"
              :disabled="!supported || !connected"
              prepend-icon="mdi-led-outline"
              title="Turn all LEDs off"
              @click="() => setAllLEDs (false, true)"
            >
              All Off
            </v-btn>
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Invert all LEDs"
              color="grey-darken-1"
              :disabled="!supported || !connected"
              prepend-icon="mdi-invert-colors"
              title="Invert all LEDs"
              @click="() => invertAllLEDs (true)"
            >
              Invert All
            </v-btn>
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Randomise all LEDs"
              color="grey-darken-1"
              :disabled="!supported || !connected"
              prepend-icon="mdi-dice-3"
              title="Randomise all LEDs"
              @click="() => randomiseAllLEDs (true)"
            >
              Random
            </v-btn>
          </v-col>
        </v-row>

        <v-row dense justify="end">
          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Read current state"
              color="grey-darken-1"
              :disabled="!supported || !connected"
              prepend-icon="mdi-download"
              title="Read current state"
              @click="requestState"
            >
              Read state
            </v-btn>
          </v-col>

          <v-col class="text-end" cols="auto">
            <v-btn
              aria-label="Write current state"
              color="grey-darken-1"
              :disabled="!supported || !connected"
              prepend-icon="mdi-upload"
              title="Write current state"
              @click="writeLEDValues"
            >
              Write state
            </v-btn>
          </v-col>
        </v-row>
      </v-col>

      <!-- right col -->
      <v-col
        class="pa-2"
        cols="12"
        style="max-width: 600px;"
        xl="6"
      >

        <v-row dense>
          <v-col>
            <v-btn
              aria-label="Clear the logs"
              class="mb-2"
              :color="logs.length === 0 ? 'grey-darken-1' : 'error'"
              :disabled="logs.length === 0"
              prepend-icon="mdi-delete-empty"
              title="Clear the logs"
              @click="() => logs.splice(0)"
            >
              Clear logs
            </v-btn>

            <v-alert
              v-if="logs.length > 0"
              class="log-text"
              :color="isDark ? 'light-green-accent-4' : 'light-green-darken-4'"
              density="compact"
              variant="tonal"
            >
              <p v-for="(log, index) in logs" :key="index" class="mb-0">{{ log }}</p>
            </v-alert>
            <v-alert v-else density="compact">
              <v-skeleton-loader
                boilerplate
                class="pt-0"
                color="transparent"
                type="paragraph"
              />
            </v-alert>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { inject, ref } from 'vue';
  import { useMessagesStore } from '@/stores/messages';
  import { useTheme } from 'vuetify';

  const theme = useTheme();
  const isDark = computed(() => theme.global.name.value === 'dark')

  const messages = useMessagesStore();

  const $api = inject('$api');

  let port;
  let reader;
  let writer;
  let keepReading = false;

  const arduinoDevicesOnly = ref(true);
  const connected = ref(false);
  const supported = ref($api.isSupported());

  const leds = ref([
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false],
  ]);
  const logs = ref([]);

  function disconnectFromDevice () {
    // User clicked a button to close the serial port.
    keepReading = false;
    // Force reader.read() to resolve immediately and subsequently
    // call reader.releaseLock() in the loop example above.
    reader.cancel();
  }

  const arrayToBooleans = arr => {
    const result = [];

    arr.forEach(num => {
      // Convert number to 16-bit binary string
      const binaryStr = num.toString(2).padStart(16, '0');

      // Split into high and low 8 bits
      const high8 = binaryStr.slice(0, 8);
      const low8 = binaryStr.slice(8, 16);

      // Convert each 8-bit segment to booleans and push to result
      result.push(Array.from(high8).map(bit => bit === '1'));
      result.push(Array.from(low8).map(bit => bit === '1'));
    });

    return result;
  };

  const booleansToArray = arr => {
    // Ensure the array length is even
    if (arr.length % 2 !== 0) {
      throw new Error('Array length must be even to combine into 16-bit integers.');
    }

    const ledGrid = arr.map(row => {
      const result = [];
      for (let i = 0; i < row.length; i += 8) {
        let byte = 0;
        // Process up to 8 bits
        for (let j = 0; j < 8 && (i + j) < row.length; j++) {
          byte = (byte << 1) | (row[i + j] ? 1 : 0);
        }
        result.push(byte);
      }
      return result;
    });

    const halfSize = ledGrid.length / 2;
    const result = [];
    for (let i = 0; i < halfSize; i++) {
      const highByte = ledGrid[2 * i];
      const lowByte = ledGrid[2 * i + 1];
      result[i] = (highByte << 8) | lowByte;
    }

    return result;
  };

  function addToLog (text) {
    logs.value.unshift(text);
    // trim to 10
    logs.value.splice(10);
  }

  function invertAllLEDs (sendRequest) {
    for (let i = 0; i < leds.value.length; i++) {
      for (let j = 0; j < leds.value[i].length; j++) {
        leds.value[i][j] = !leds.value[i][j];
      }
    }

    if (connected.value && sendRequest) {
      writeLEDValues();
    }
  }

  function randomiseAllLEDs (sendRequest) {
    for (let i = 0; i < leds.value.length; i++) {
      for (let j = 0; j < leds.value[i].length; j++) {
        leds.value[i][j] = Math.random() < 0.5;
      }
    }

    if (connected.value && sendRequest) {
      writeLEDValues();
    }
  }

  function setAllLEDs (value, sendRequest) {
    for (let i = 0; i < leds.value.length; i++) {
      for (let j = 0; j < leds.value[i].length; j++) {
        leds.value[i][j] = value;
      }
    }

    if (connected.value && sendRequest) {
      writeLEDValues();
    }
  }

  function writeLEDValues () {
    const values = booleansToArray(leds.value);

    const payload = $api.createWriteHoldingRegistersRequest (1, 0, values);

    addToLog(`Request: ${Array.from(payload)
      .map(byte => `${byte.toString(16).padStart(2, '0')}`)
      .join(' ')}`
    );

    writer.write(payload);
  }

  function handleModbusResponse (value) {
    try {
      const resp = $api.processModbusResponse(value, 1);
      if (Array.isArray(resp)) {
        leds.value = arrayToBooleans(resp);
      }

      addToLog(`Response: ${Array.from(value)
        .map(byte => `${byte.toString(16).padStart(2, '0')}`)
        .join(' ')}`
      );

      return true;
    } catch {
      return false;
    }
  }

  async function requestState () {
    const payload = $api.createReadHoldingRegistersRequest(1, 0, 6);
    addToLog(`Request: ${Array.from(payload)
      .map(byte => `${byte.toString(16).padStart(2, '0')}`)
      .join(' ')}`
    );
    await writer.write(payload);
  }

  async function connectToDevice () {
    try {
      port = await $api.connectToDevice(arduinoDevicesOnly.value);

      port.addEventListener('disconnect', () => {
        keepReading = false;
      });

      await $api.openPort(port);

      connected.value = port.connected;

      writer = port.writable.getWriter();

      // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/close#description
      keepReading = true;
      while (port.readable && keepReading) {
        reader = port.readable.getReader();

        // get initial state
        await requestState();

        try {
          let buffer = new Uint8Array(0);
          let lastMessageTimeMs = 0;
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break;
            }

            const gap = Date.now() - lastMessageTimeMs;

            if (gap > 500) {
              buffer = new Uint8Array(0);
            }

            // Concatenate the current chunk with the existing buffer
            buffer = new Uint8Array([...buffer, ...value]);

            try {
              const handled = handleModbusResponse(buffer);

              // If the response was handled
              if (handled) {
                // Reset the buffer
                buffer = new Uint8Array(0);
              }
              lastMessageTimeMs = Date.now();

            } catch {
              // Reset buffer on error if needed
              buffer = new Uint8Array(0);
              lastMessageTimeMs = 0;
            }
          }
        } catch (error) {
          messages.add(error.message, { color: 'error' });
        } finally {
          // Allow the serial port to be closed later.
          reader.releaseLock();
          writer.releaseLock();
        }
      }

      await port.close();

      connected.value = false;

      setAllLEDs(false);
    } catch (error) {
      messages.add(error.message, { color: 'error' });
    }
  }

  function onButtonClick (rowIndex, colIndex) {
    leds.value[rowIndex][colIndex] = !leds.value[rowIndex][colIndex];

    writeLEDValues();
  }

  onBeforeMount(async () => {
    if (connected.value) {
      disconnectFromDevice();
    }
  });
</script>

<style style="scss" scoped>
.v-switch {
  height: 36px;
}

.log-text {
  font-size: 0.75rem; /* smaller font size */
  font-family: monospace;
}
</style>
