<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col
          cols="12"
          xl="2"
        >
          <v-card
            class="padded-paragraphs pa-3"
            rounded="lg"
            title="Welcome"
            variant="tonal"
          >
            <v-card-text>

              <p>This web-based interface enables you to control the 12x8 LED matrix on an <a
                href="https://store.arduino.cc/pages/uno-r4"
                rel="noopener noreferrer"
                target="_blank"
              >Arduino UNO R4 WiFi</a> using the Modbus RTU protocol. This controller leverages the <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API"
                rel="noopener noreferrer"
                target="_blank"
              >Web Serial API</a>.</p>


              <v-dialog max-width="400" min-height="140" scrollable>
                <template #activator="{ props: activatorProps }">
                  <v-row dense justify="center">
                    <v-col cols="auto"><v-img
                      v-bind="activatorProps"
                      alt="Arduino UNO R4 WiFi"
                      src="/images/uno-r4-wifi.svg"
                      style="cursor: pointer;"
                      width="150"
                    /></v-col>
                  </v-row>
                </template>

                <template #default="{ isActive }">
                  <v-card title="Arduino UNO R4 WiFi">
                    <v-card-text class="text-center text-caption">
                      <v-img v-bind="activatorProps" alt="Arduino UNO R4 WiFi" max-height="400px" src="/images/uno-r4-wifi.svg" />
                      <p><a
                        href="https://docs.arduino.cc/hardware/uno-r4-wifi/"
                        rel="noopener noreferrer"
                        target="_blank"
                      >Arduino UNO R4 WiFi</a> by <a
                        href="https://arduino.cc/"
                        rel="noopener noreferrer"
                        target="_blank"
                      >Arduino</a> is licensed under <a
                        href="hhttps://creativecommons.org/licenses/by-sa/3.0/legalcode"
                        rel="noopener noreferrer"
                        target="_blank"
                      >CC-BY-SA 3.0</a>.</p>
                    </v-card-text>

                    <template #actions>
                      <v-btn
                        class="ml-auto"
                        text="Close"
                        @click="isActive.value = false"
                      />
                    </template>
                  </v-card>
                </template>
              </v-dialog>


              <p class="text-center text-caption"><a
                href="https://docs.arduino.cc/hardware/uno-r4-wifi/"
                rel="noopener noreferrer"
                target="_blank"
              >Arduino UNO R4 WiFi</a> by <a
                href="https://arduino.cc/"
                rel="noopener noreferrer"
                target="_blank"
              >Arduino</a> is licensed under <a
                href="https://creativecommons.org/licenses/by-sa/3.0/legalcode"
                rel="noopener noreferrer"
                target="_blank"
              >CC-BY-SA 3.0</a>.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          xl="8"
        >
          <v-sheet
            rounded="lg"
          >
            <router-view />
          </v-sheet>
        </v-col>

        <v-col
          cols="12"
          xl="2"
        >
          <v-card
            class="padded-paragraphs pa-3 mb-2"
            rounded="lg"
            title="Firmware"
            variant="tonal"
          >

            <v-card-text>
              <p>The source code of the Arduino UNO R4 WiFi firmware is available below:</p>

              <p class="text-center"><v-btn
                aria-label="Download source code for Arduino UNO R4 WiFi"
                color="primary"
                download
                href="/downloads/modbus_led_matrix.ino"
                prepend-icon="mdi-download"
                title="Download source code for Arduino UNO R4 WiFi"
              >
                Download Source
              </v-btn></p>
            </v-card-text>


          </v-card>

          <v-card
            class="padded-paragraphs pa-3"
            rounded="lg"
            title="Connection"
            variant="tonal"
          >
            <v-card-text>
              <p>You can connect to the Arduino UNO R4 WiFi through its USB port.</p>

              <p>Alternatively, you may use the onboard UART (pins D0 and D1), for example, with a TTL to RS-485 converter* and a USB RS-485 device.</p>

              <p>Uncheck 'Arduino Devices Only' to see all serial ports.</p>

              <p class="text-caption">* If your TTL converter utilises Driver Enable (DE) and Receiver Enable (RE) pins, you can configure them via the <a
                href="https://github.com/CMB27/ModbusRTUSlave?tab=readme-ov-file#methods"
                rel="noopener noreferrer"
                target="_blank"
              >ModbusRTUSlave()</a> constructor.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <AppFooter />
</template>

<script setup>

</script>

<style scoped lang="scss">
.padded-paragraphs p:not(:last-child) {
  padding-bottom: 16px;
}
</style>
