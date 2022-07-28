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
        <div>
          <label
            class="flex gap-3 p-3 shadow-sm"
            :class="
              todo.done
                ? 'text-slate-300 bg-slate-50'
                : 'text-slate-700 bg-white'
            "
          >
            <input
              type="checkbox"
              :checked="todo.done"
              class="hidden"
              @change="() => toggleTodo(todo)"
            />
            <div
              class="w-6 h-6 flex items-center justify-center border-2 border-slate-300"
              :class="todo.done ? 'bg-slate-300' : ''"
            >
              <mdicon
                v-if="todo.done"
                name="check"
                class="text-white"
                size="20"
              />
            </div>
            {{ todo.name }}
          </label>
        </div>
      </li>
    </ul>
  </div>
</template>
