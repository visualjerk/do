<script lang="ts" setup>
import {
  useTodos,
  useTodoForm,
  toggleTodo,
  deleteTodo,
  Todo,
} from '@/store/todos'
import { parse } from '@visualjerk/morgen'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'

const { todos } = await useTodos(true)
const { newTodo, addTodo } = useTodoForm()

useHead({
  title: 'Do',
})

function handleDelete(todo: Todo) {
  const sure = confirm(`Do you really want to delete ${todo.name}?`)
  if (!sure) {
    return
  }
  deleteTodo(todo)
}

const parsed = computed(() => parse(newTodo.value))
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

// Parse input date with https://github.com/wanasit/chrono
</script>

<template>
  <div>
    <h1 class="mb-8">Todos</h1>
    <form @submit.prevent="addTodo" class="mb-6 relative">
      <input
        v-model="newTodo"
        placeholder="What needs to be done?"
        autofocus
        class="p-3 pr-10 w-full text-lg focus:outline-indigo-500"
      />
      <button
        type="submit"
        class="absolute inset-y-0 right-0 px-3 text-indigo-600 hover:text-indigo-800"
      >
        <mdicon name="plus" />
      </button>
    </form>
    <div class="mb-6">
      <pre>{{ parsed }}</pre>
    </div>
    <h2 class="mb-3">Today</h2>
    <ul v-auto-animate class="mb-8">
      <li
        v-for="todo in todosToday"
        :key="todo.id"
        class="mt-2 first-of-type:mt-0"
      >
        <div
          class="flex gap-3 items-center shadow-sm"
          :class="
            todo.done ? 'text-slate-300 bg-slate-50' : 'text-slate-700 bg-white'
          "
        >
          <label class="flex flex-grow gap-3 p-3">
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
          <mdicon
            name="refresh"
            size="20"
            v-if="todo.repeat_frequency"
            class="text-slate-400"
          />
          <button
            class="flex-shrink-0 px-3 text-slate-400 hover:text-indigo-600"
            @click="() => handleDelete(todo)"
          >
            <mdicon name="delete" size="20" />
          </button>
        </div>
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
          <div
            class="flex gap-3 items-center shadow-sm"
            :class="
              todo.done
                ? 'text-slate-300 bg-slate-50'
                : 'text-slate-700 bg-white'
            "
          >
            <label class="flex flex-grow gap-3 p-3">
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
            <mdicon
              name="refresh"
              size="20"
              v-if="todo.repeat_frequency"
              class="text-slate-400"
            />
            <button
              class="flex-shrink-0 px-3 text-slate-400 hover:text-indigo-600"
              @click="() => handleDelete(todo)"
            >
              <mdicon name="delete" size="20" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
