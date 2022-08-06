<script setup lang="ts">
import { List, deleteList } from '@/store/lists'

defineProps<{
  list: List
}>()

function handleDelete(list: List) {
  const sure = confirm(
    `Do you really want to delete ${list.name} and all related todos?`
  )
  if (!sure) {
    return
  }
  deleteList(list)
}
</script>

<template>
  <BaseItem :to="`/list/${list.id}`">
    {{ list.name }}
    <template #post>
      <DeleteButton @click="() => handleDelete(list)">
        <mdicon name="delete" size="20" />
      </DeleteButton>
    </template>
  </BaseItem>
</template>
