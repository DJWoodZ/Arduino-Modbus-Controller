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
          <v-card title="Legal Information">
            <v-card-text>
              <p>&copy; {{ (new Date()).getFullYear() }} DJ WoodZ</p>
            </v-card-text>

            <v-card-text>
              <p>The source code for this Modbus controller and the associated Arduino firmware are made available under the terms of the <a
                class="text-decoration-none font-weight-bold on-surface"
                href="https://opensource.org/license/mit/"
                rel="noopener noreferrer"
                target="_blank"
              >
                MIT License
              </a>.</p>
            </v-card-text>

            <v-card-actions>
              <v-spacer />

              <v-btn
                text="Close"
                @click="isActive.value = false"
              />
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>


      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">DJ WoodZ</span>
      —
      <a
        class="text-decoration-none on-surface"
        href="https://opensource.org/license/mit/"
        rel="noopener noreferrer"
        target="_blank"
      >
        MIT License
      </a>
    </div>
  </v-footer>
</template>

<script setup>
  const items = [
    {
      title: 'GitHub',
      icon: '$github',
      href: 'https://github.com/DJWoodZ/Arduino-Modbus-Controller',
      size: 24,
    },
  ]
</script>

<style scoped lang="sass">
  :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgb(var(--v-theme-primary))
</style>
