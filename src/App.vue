<template>
  <v-app>
    <v-theme-provider theme="dark">
      <v-app-bar
        class="px-3"
        color="grey-darken-4"
        density="compact"
        flat
      >
        <v-app-bar-title><router-link class="text-decoration-none user-select-none" style="color: inherit;" to="/">Arduino Modbus Controller</router-link></v-app-bar-title>

        <template #prepend>
          <router-link class="text-decoration-none" style="color: inherit;" to="/">
            <v-icon>mdi-led-on</v-icon>
          </router-link>
        </template>

        <template #append>
          <v-btn
            :aria-label="darkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            :color="darkTheme ? 'yellow' : 'grey-lighten-2'"
            :icon="darkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            size="small"
            :title="darkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            @click="toggleTheme"
          />
        </template>

      </v-app-bar>
    </v-theme-provider>

    <router-view />

    <v-snackbar-queue
      v-model="messages.queue"
      closable
      close-on-content-click
      timeout="4000"
    />
  </v-app>
</template>

<script setup>
  import { useTheme } from 'vuetify';
  import { useMessagesStore } from '@/stores/messages';

  const messages = useMessagesStore();

  const theme = useTheme();
  const darkTheme = ref(theme.global.name.value === 'dark');

  function toggleTheme () {
    darkTheme.value = !darkTheme.value;

    theme.global.name.value = darkTheme.value ? 'dark' : 'light';
  }
</script>
