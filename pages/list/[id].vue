<script lang="ts" setup>
import { useList, List } from '@/store/lists.js'

const { params } = useRoute()

const { list } = await useList(params.id as string)
const id = computed(() => params.id as string)
</script>

<template>
  <div>
    <template v-if="list == null">
      <h1 class="mb-4 sm:mb-8">List not found</h1>
    </template>
    <template v-else>
      <h1 class="mb-4 sm:mb-8">{{ (list as List).name }}</h1>
      <ListView :id="id" />
    </template>
  </div>
</template>
