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
import { Todo } from '@/store/todos.js'

defineProps<{
  todo: Todo
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'delete'): void
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
</script>

<template>
  <BaseItem :muted="todo.done">
    <template #pre>
      <label class="flex p-2 sm:p-3">
        <input
          type="checkbox"
          :checked="todo.done"
          class="hidden"
          @change="$emit('toggle')"
        />
        <div
          class="w-8 h-8 flex items-center justify-center border-2 cursor-pointer"
          :class="
            todo.done
              ? 'border-slate-400 text-slate-500 dark:text-slate-100'
              : 'border-slate-200 text-white hover:text-slate-200 dark:border-slate-600 dark:text-slate-800 dark:hover:text-slate-600'
          "
        >
          <mdicon name="check" size="24" />
        </div>
      </label>
    </template>
    <div>{{ todo.name }}</div>
    <div class="flex items-center gap-2 mt-1" v-if="todo.due_date">
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
    <template #post>
      <DeleteButton @click="$emit('delete')" />
      <DragButton />
    </template>
  </BaseItem>
</template>
