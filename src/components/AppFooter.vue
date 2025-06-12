<template>
  <v-footer
    app
    height="40"
  >
    <a
      v-for="item in items"
      :key="item.title"
      class="d-inline-block mx-2 social-link"
      :href="item.href"
      rel="noopener noreferrer"
      target="_blank"
      :title="item.title"
    >
      <v-icon
        :icon="item.icon"
        :size="item.size"
      />
    </a>

    <span
      class="text-caption text-disabled user-select-none"
      :class="{ 'absolute-center-text': mdAndUp }"
    >Build: <a
      :href="`https://github.com/DJWoodZ/Arduino-Modbus-Controller/commit/${build}`"
      rel="noopener noreferrer"
      target="_blank"
    >{{ build }}</a></span>

    <div
      class="text-caption text-disabled user-select-none"
      style="position: absolute; right: 16px;"
    >
      <v-dialog max-width="500">
        <template #activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            aria-label="Legal Information"
            icon="mdi-script-outline"
            size="x-small"
            title="Legal Information"
            variant="text"
          />
        </template>

        <template #default="{ isActive }">
          <v-card
            prepend-icon="mdi-script-outline"
            title="Legal Information"
          >
            <v-card-text>
              <p>&copy; {{ (new Date()).getFullYear() }} DJ WoodZ</p>
            </v-card-text>

            <v-card-text>
              <p>The source code for this Modbus controller and the associated Arduino firmware are made available under the terms of the <a
                href="https://github.com/DJWoodZ/Arduino-Modbus-Controller/blob/main/LICENSE"
                rel="noopener noreferrer"
                target="_blank"
              >MIT License</a>.</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer />

              <v-btn
                variant="text"
                @click="isActive.value = false"
              >Close</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>


      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">DJ WoodZ</span>
      —
      <a
        href="https://github.com/DJWoodZ/Arduino-Modbus-Controller/blob/main/LICENSE"
        rel="noopener noreferrer"
        target="_blank"
      >
        MIT License
      </a>
    </div>
  </v-footer>
</template>

<script setup>
  import { useDisplay } from 'vuetify';

  const { mdAndUp } = useDisplay()

  const items = [
    {
      title: 'GitHub',
      icon: '$github',
      href: 'https://github.com/DJWoodZ/Arduino-Modbus-Controller',
      size: 24,
    },
  ]

  const build = __COMMIT_HASH__ ;
</script>

<style scoped lang="scss">
.v-footer :deep(.v-icon), .v-footer a  {
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  text-decoration: none;
  transition: .2s ease-in-out;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}

.absolute-center-text {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
