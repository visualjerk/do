<script lang="ts" setup>
import { useTodos, useTodoForm, Todo } from '@/store/todos'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'

const props = defineProps<{
  id?: string
}>()

const { todos, deleteTodo, toggleTodo } = await useTodos(true, props.id)
const { newTodo, todoParts, addTodo } = useTodoForm(props.id)

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

function handleDelete(todo: Todo) {
  const sure = confirm(`Do you really want to delete ${todo.name}?`)
  if (!sure) {
    return
  }
  deleteTodo(todo)
}
</script>

<template>
  <div>
    <form @submit.prevent="addTodo" class="mb-6 relative">
      <div>
        <textarea
          v-model="newTodo"
          placeholder="What needs to be done?"
          autofocus
          autocomplete="off"
          rows="1"
          @keypress.enter.prevent="addTodo"
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
        <TodoItem
          :todo="todo"
          @delete="() => handleDelete(todo)"
          @toggle="() => toggleTodo(todo)"
        />
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
          <TodoItem
            :todo="todo"
            @delete="() => handleDelete(todo)"
            @toggle="() => toggleTodo(todo)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>