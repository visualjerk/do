<script lang="ts" setup>
import { useTodos, useTodoForm } from '@/store/todos'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'

const { params } = useRoute()

const { todos } = await useTodos(true, params.id as string)
const { newTodo, todoParts, addTodo } = useTodoForm(params.id as string)

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
        <textarea
          v-model="newTodo"
          placeholder="What needs to be done?"
          autofocus
          autocomplete="off"
          rows="1"
          class="absolute inset-0 p-3 pr-12 w-full text-lg bg-white text-white caret-slate-800 focus:outline-indigo-500 outline-none dark:bg-slate-800 dark:text-slate-800 dark:caret-slate-200 dark:focus:outline-teal-400 resize-none"
        />
        <div
          class="relative pointer-events-none p-3 pr-12 text-lg whitespace-pre-wrap text-slate-800 dark:text-slate-100"
        >
          <template v-for="part in todoParts">
            <span
              v-if="part.isSchedule || part.isDate"
              class="text-indigo-600 dark:text-teal-400"
            >
              {{ part.value }}
            </span>
            <span v-else> {{ part.value }} </span> </template
          >&nbsp;
        </div>
      </div>
      <AddButton type="submit" />
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
