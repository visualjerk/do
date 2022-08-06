<script lang="ts" setup>
import { useTodos, useTodoForm } from '@/store/todos'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'

const { todos } = await useTodos(true)
const { newTodo, todoParts, addTodo } = useTodoForm()

useHead({
  title: 'Do',
})

const todosToday = computed(() =>
  todos.value.filter(({ due_date }) => {
    if (!due_date) {
      return true
    }
    const date = parseISO(due_date)
    return isToday(date) || isPast(date)
  })
)
const todosFuture = computed(() =>
  todos.value.filter(({ due_date }) => {
    if (!due_date) {
      return false
    }
    const date = parseISO(due_date)
    return !isToday(date) && isFuture(date)
  })
)
</script>

<template>
  <div>
    <h1 class="mb-4 sm:mb-8">Todos</h1>
    <form @submit.prevent="addTodo" class="mb-6 relative">
      <div>
        <input
          v-model="newTodo"
          placeholder="What needs to be done?"
          autofocus
          class="p-3 pr-10 w-full text-lg bg-white text-white caret-slate-800 focus:outline-indigo-500 outline-none dark:bg-slate-800 dark:text-slate-800 dark:caret-slate-200 dark:focus:outline-teal-400"
        />
        <div
          class="absolute inset-0 pointer-events-none p-3 pr-10 text-lg whitespace-pre text-slate-800 dark:text-slate-200"
        >
          <template v-for="part in todoParts">
            <span
              v-if="part.isSchedule || part.isDate"
              class="text-indigo-600 dark:text-teal-500"
            >
              {{ part.value }}
            </span>
            <span v-else>
              {{ part.value }}
            </span>
          </template>
        </div>
      </div>
      <button
        type="submit"
        class="absolute inset-y-0 right-0 px-3 text-indigo-500 hover:text-indigo-600 dark:text-teal-400 dark:hover:text-teal-500"
      >
        <mdicon name="plus" />
      </button>
    </form>
    <h2 class="mb-3">Today</h2>
    <ul v-auto-animate class="mb-8">
      <li
        v-for="todo in todosToday"
        :key="todo.id"
        class="mt-2 first-of-type:mt-0"
      >
        <TodoItem :todo="todo" />
      </li>
    </ul>
    <div v-if="todosFuture.length > 0">
      <h2 class="mb-3">Upcoming</h2>
      <ul v-auto-animate>
        <li
          v-for="todo in todosFuture"
          :key="todo.id"
          class="mt-2 first-of-type:mt-0"
        >
          <TodoItem :todo="todo" />
        </li>
      </ul>
    </div>
  </div>
</template>
