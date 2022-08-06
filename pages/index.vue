<script lang="ts" setup>
import { useLists, useListForm, deleteList, List } from '@/store/lists'

const { lists } = await useLists(true)
const { newList, addList } = useListForm()

function handleDelete(list: List) {
  const sure = confirm(
    `Do you really want to delete ${list.name} and all related todos?`
  )
  if (!sure) {
    return
  }
  deleteList(list)
}

useHead({
  title: 'Do',
})
</script>

<template>
  <div>
    <h1 class="mb-4 sm:mb-8">Todo</h1>
    <ul class="mb-8">
      <li>
        <BaseItem to="/inbox" key="inbox">
          <div class="flex items-center gap-2">
            <mdicon name="inbox-full" size="20" class="text-slate-500" />
            Inbox
          </div>
        </BaseItem>
      </li>
    </ul>
    <h2 class="mb-3">Lists</h2>
    <form @submit.prevent="addList" class="mb-6 relative">
      <div>
        <input
          v-model="newList"
          placeholder="Create a new list"
          autocomplete="off"
          class="p-3 pr-12 w-full text-lg bg-white text-slate-800 focus:outline-indigo-500 outline-none dark:bg-slate-800 dark:text-slate-100 dark:focus:outline-teal-400 resize-none"
        />
      </div>
      <AddButton type="submit" />
    </form>
    <ul v-auto-animate class="mb-8">
      <li v-for="list in lists" :key="list.id" class="mt-2">
        <ListItem :list="list" @delete="() => handleDelete(list)" />
      </li>
    </ul>
  </div>
</template>
