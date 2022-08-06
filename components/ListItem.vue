<script setup lang="ts">
import { List } from '@/store/lists'

defineProps<{
  list: List
}>()

defineEmits<{
  (e: 'delete'): void
}>()
</script>

<template>
  <BaseItem :to="`/list/${list.id}`">
    <div class="flex items-center gap-2">
      <mdicon name="format-list-checks" size="20" class="text-slate-500" />
      {{ list.name }}
    </div>
    <template #post>
      <DeleteButton @click="$emit('delete')">
        <mdicon name="delete" size="20" />
      </DeleteButton>
    </template>
  </BaseItem>
</template>
