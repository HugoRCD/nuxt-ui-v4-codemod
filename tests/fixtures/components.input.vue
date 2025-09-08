<template>
  <div>
    <!-- ButtonGroup to FieldGroup -->
    <UButtonGroup>
      <UButton label="Button" />
      <UButton icon="i-lucide-chevron-down" />
    </UButtonGroup>

    <!-- PageMarquee to Marquee -->
    <UPageMarquee :items="marqueeItems" />

    <!-- PageAccordion to Accordion -->
    <UPageAccordion :items="faqItems" />

    <!-- Model modifiers -->
    <UInput v-model.nullify="value" />
    <UTextarea v-model="description" :model-modifiers="{ nullify: true }" />
  </div>
</template>

<script setup>
// Import from @nuxt/ui-pro
import type { BannerProps } from '@nuxt/ui-pro'

const marqueeItems = ref([])
const faqItems = ref([])
const value = ref('')
const description = ref('')
</script>
