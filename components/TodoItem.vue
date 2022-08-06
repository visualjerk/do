<script setup lang="ts">
import {
  intlFormatDistance,
  intlFormat,
  parseISO,
  format,
  isAfter,
  addDays,
  isBefore,
} from 'date-fns'
import { Todo, toggleTodo, deleteTodo } from '@/store/todos.js'

defineProps<{
  todo: Todo
}>()

function formatDate(dateISO: string) {
  const date = parseISO(dateISO)
  const now = new Date()
  const pastDate = addDays(now, -7)
  const futureDate = addDays(now, 7)
  if (isAfter(date, pastDate) && isBefore(date, futureDate)) {
    return intlFormatDistance(date, now, {
      unit: 'day',
    })
  }
  return intlFormat(date)
}

function handleDelete(todo: Todo) {
  const sure = confirm(`Do you really want to delete ${todo.name}?`)
  if (!sure) {
    return
  }
  deleteTodo(todo)
}
</script>

<template>
  <div
    class="flex gap-3 items-center shadow-sm dark:shadow-slate-200/20"
    :class="
      todo.done
        ? 'text-slate-300 bg-slate-50 dark:text-slate-500 dark:bg-slate-800'
        : 'text-slate-700 bg-white dark:text-slate-200 dark:bg-slate-800'
    "
  >
    <label class="flex gap-3 p-3">
      <input
        type="checkbox"
        :checked="todo.done"
        class="hidden"
        @change="() => toggleTodo(todo)"
      />
      <div
        class="w-8 h-8 flex items-center justify-center border-2 cursor-pointer"
        :class="
          todo.done
            ? 'border-slate-400 text-slate-500 dark:text-slate-300'
            : 'border-slate-200 text-white hover:text-slate-200 dark:border-slate-600 dark:text-slate-800 dark:hover:text-slate-600'
        "
      >
        <mdicon name="check" size="24" />
      </div>
    </label>
    <div class="flex-grow py-2">
      <div class="">{{ todo.name }}</div>
      <div class="flex items-center gap-2" v-if="todo.due_date">
        <BaseTag :muted="todo.done">
          <mdicon
            size="12"
            :name="todo.repeat_frequency ? 'autorenew' : 'calendar'"
          />
          {{ formatDate(todo.due_date) }}
        </BaseTag>
        <BaseTag v-if="todo.by_time" :muted="todo.done">
          {{ format(parseISO(todo.due_date), 'HH:mm') }}
        </BaseTag>
      </div>
    </div>
    <button
      class="flex-shrink-0 px-3 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-teal-500"
      @click="() => handleDelete(todo)"
    >
      <mdicon name="delete" size="20" />
    </button>
  </div>
</template>
