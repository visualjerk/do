<script lang="ts" setup>
import { useTodos, useTodoForm, toggleTodo } from '@/store/todos'

const { todos, getTodos, subscribe } = useTodos()
const { newTodo, addTodo } = useTodoForm()

getTodos()
subscribe()

useHead({
  title: 'Do',
})
</script>

<template>
  <div>
    <h1 class="mb-8">Do</h1>
    <form @submit.prevent="addTodo" class="flex gap-2 mb-6">
      <input
        v-model="newTodo.name"
        placeholder="What needs to be done?"
        autofocus
        class="p-3 flex-grow text-lg"
      />
      <ActionButton type="submit">Add</ActionButton>
    </form>
    <ul class="grid gap-2">
      <li v-for="todo in todos">
        <label class="flex gap-2 p-2 bg-slate-50 shadow-sm">
          <input
            type="checkbox"
            :checked="todo.done"
            class="w-6 h-6"
            @change="() => toggleTodo(todo)"
          />
          {{ todo.name }}
        </label>
      </li>
    </ul>
  </div>
</template>
