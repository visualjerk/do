<script setup lang="ts">
defineProps<{
  muted?: boolean
}>()
</script>

<template>
  <span
    class="px-2 py-0.5 inline-flex items-center gap-1 bg-slate-100 text-xs rounded-md font-medium dark:bg-slate-700"
    :class="
      muted
        ? 'text-slate-300 dark:text-slate-500'
        : 'text-slate-600 dark:text-slate-200'
    "
  >
    <slot />
  </span>
</template>
