<script lang="ts" setup>
import {
  useTodos,
  useTodoForm,
  toggleTodo,
  deleteTodo,
  Todo,
} from '@/store/todos'

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

// Parse input date with https://github.com/wanasit/chrono
</script>

<template>
  <div>
    <h1 class="mb-8">Todos</h1>
    <form @submit.prevent="addTodo" class="mb-6 relative">
      <input
        v-model="newTodo.name"
        placeholder="What needs to be done?"
        autofocus
        class="p-3 pr-10 w-full text-lg focus:outline-indigo-500"
      />
      <button
        type="submit"
        class="absolute inset-y-0 right-0 px-3 text-indigo-600"
      >
        <mdicon name="plus" />
      </button>
    </form>
    <ul v-auto-animate>
      <li v-for="todo in todos" :key="todo.id" class="mt-2 first-of-type:mt-0">
        <div class="flex gap-3">
          <label
            class="flex flex-grow gap-3 p-3 shadow-sm"
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
          <button @click="() => handleDelete(todo)" class="flex-shrink-0">
            <mdicon
              name="delete"
              class="text-slate-400 hover:text-red-600"
              size="20"
            />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
