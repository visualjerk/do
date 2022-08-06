<script setup lang="ts">
const props = defineProps<{
  muted?: boolean
  to?: string
}>()

const component = computed(() =>
  props.to != null ? resolveComponent('NuxtLink') : 'div'
)
</script>

<template>
  <div
    class="flex gap-2 items-center shadow-sm dark:shadow-slate-200/20"
    :class="
      muted
        ? 'text-slate-300 bg-slate-50 dark:text-slate-500 dark:bg-slate-800'
        : 'text-slate-700 bg-white dark:text-slate-100 dark:bg-slate-800'
    "
  >
    <slot name="pre" />
    <component
      :is="component"
      :to="to"
      class="flex-grow py-2"
      :class="[
        !$slots.pre && 'pl-2',
        !$slots.post && 'pr-2',
        to && 'hover:text-indigo-600 dark:hover:text-teal-500',
      ]"
    >
      <slot />
    </component>
    <slot name="post" />
  </div>
</template>
