<script setup lang="ts">
import { intlFormatDistance, parseISO, intlFormat } from 'date-fns'
import { Todo, toggleTodo, deleteTodo } from '~~/store/todos.js'

defineProps<{
  todo: Todo
}>()
</script>

<template>
  <div
    class="flex gap-3 items-center shadow-sm"
    :class="
      todo.done ? 'text-slate-300 bg-slate-50' : 'text-slate-700 bg-white'
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
        class="w-8 h-8 flex items-center justify-center border-2 cursor-pointer text-slate-500"
        :class="
          todo.done
            ? ' border-slate-400'
            : 'border-slate-200 text-white hover:text-slate-200'
        "
      >
        <mdicon name="check" size="24" />
      </div>
    </label>
    <div class="flex-grow py-2">
      <div class="">{{ todo.name }}</div>
      <span
        v-if="todo.due_date"
        class="px-2 py-0.5 inline-flex items-center gap-1 bg-slate-100 text-xs rounded-md font-medium"
        :class="todo.done ? 'text-slate-300' : 'text-slate-600'"
      >
        <mdicon
          size="12"
          :name="todo.repeat_frequency ? 'autorenew' : 'calendar'"
        />
        {{
          intlFormatDistance(parseISO(todo.due_date), new Date(), {
            unit: 'day',
          })
        }}
      </span>
    </div>
    <button
      class="flex-shrink-0 px-3 text-slate-400 hover:text-indigo-600"
      @click="() => deleteTodo(todo)"
    >
      <mdicon name="delete" size="20" />
    </button>
  </div>
</template>
