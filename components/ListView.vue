<script lang="ts" setup>
import { useTodos, useTodoForm, Todo } from '@/store/todos'
import { isToday, isPast, isFuture, parseISO } from 'date-fns'

import Draggable from 'vuedraggable'

interface DraggableChangeEvent {
  added?: {
    newIndex: number
    element: Todo
  }
  removed?: {
    oldIndex: number
    element: Todo
  }
  moved?: {
    newIndex: number
    oldIndex: number
    element: Todo
  }
}

const props = defineProps<{
  id?: string
}>()

const { todos, deleteTodo, toggleTodo, moveTodo } = await useTodos(
  true,
  props.id
)
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

const movedTodos = ref<Todo[]>([])
function handleMove(todos: Todo[]) {
  movedTodos.value = todos
}

function handleChange(event: DraggableChangeEvent) {
  const moved = event.moved
  if (!moved) {
    return
  }
  const { element: movedTodo, newIndex } = moved
  const leadingIndex = newIndex - 1
  const leadingTodo = movedTodos.value[leadingIndex]
  const trailingIndex = newIndex + 1
  const trailingTodo = movedTodos.value[trailingIndex]
  moveTodo(movedTodo, leadingTodo, trailingTodo)
  movedTodos.value = []
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
    <draggable
      tag="ul"
      class="mb-8"
      :model-value="todosToday"
      @update:model-value="handleMove"
      @change="handleChange"
      item-key="id"
    >
      <template #item="{ element: todo }">
        <li class="mt-2 first-of-type:mt-0">
          <TodoItem
            :todo="todo"
            @delete="() => handleDelete(todo)"
            @toggle="() => toggleTodo(todo)"
          />
        </li>
      </template>
    </draggable>
    <div v-if="todosFuture.length > 0">
      <h2 class="mb-3">Upcoming</h2>
      <draggable
        tag="ul"
        class="mb-8"
        :model-value="todosFuture"
        @update:model-value="handleMove"
        @change="handleChange"
        item-key="id"
      >
        <template #item="{ element: todo }">
          <li class="mt-2 first-of-type:mt-0">
            <TodoItem
              :todo="todo"
              @delete="() => handleDelete(todo)"
              @toggle="() => toggleTodo(todo)"
            />
          </li>
        </template>
      </draggable>
    </div>
  </div>
</template>
