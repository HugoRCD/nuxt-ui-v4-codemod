<template>
  <div>
    <!-- ButtonGroup to FieldGroup -->
    <UFieldGroup>
      <UButton label="Button" />
      <UButton icon="i-lucide-chevron-down" />
    </UFieldGroup>

    <!-- PageMarquee to Marquee -->
    <UMarquee :items="marqueeItems" />

    <!-- PageAccordion to Accordion -->
    <UAccordion :items="faqItems" :unmount-on-hide="false" :ui="{ trigger: 'text-base', body: 'text-base text-muted' }" />

    <!-- Model modifiers -->
    <UInput v-model.nullable="value" />
    <UTextarea v-model="description" :model-modifiers="{ nullable: true }" />
  </div>
</template>

<script setup>
// Import from @nuxt/ui
import type { BannerProps } from '@nuxt/ui'

const marqueeItems = ref([])
const faqItems = ref([])
const value = ref('')
const description = ref('')
</script>
