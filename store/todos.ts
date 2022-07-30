import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'
import { parseSchedule } from 'date-parrot'
import { Duration } from 'luxon'
import { add, parseISO, formatISO } from 'date-fns'

function parseISODuration(isoDurationString: string) {
  return Duration.fromISO(isoDurationString).toObject()
}

export type Todo = definitions['todo']

interface InputPart {
  value: string
  isSchedule?: boolean
}

export async function useTodos(subscribe = false) {
  const api = useSupabaseClient()
  let subscription: RealtimeSubscription | undefined

  if (subscribe && process.client) {
    onUnmounted(() => {
      if (subscription) {
        api.removeSubscription(subscription)
      }
    })
  }

  const { data: todos, refresh } = await useAsyncData('todos', async () => {
    const { data } = await api
      .from<definitions['todo']>('todo')
      .select('*')
      .order('id')

    if (!data) {
      return []
    }
    return data
  })

  if (subscribe && process.client) {
    subscription = api
      .from('todo')
      .on('*', () => {
        refresh()
      })
      .subscribe()
  }

  return { todos }
}

export function useTodoForm() {
  const newTodo = ref('')

  const todoParts = computed(() => {
    const value = newTodo.value
    const schedule = parseSchedule(value)
    if (!schedule) {
      return [
        {
          value: newTodo.value,
        },
      ]
    }
    const parts: InputPart[] = [
      {
        isSchedule: true,
        value: schedule.match.text,
      },
    ]
    if (schedule.match.index > 0) {
      parts.unshift({
        value: value.slice(0, schedule.match.index),
      })
    }
    const endIndex = schedule.match.index + schedule.match.text.length
    if (value.length > endIndex) {
      parts.push({
        value: value.slice(endIndex),
      })
    }
    return parts
  })

  async function addTodo() {
    const api = useSupabaseClient()
    const user = api.auth.user()
    if (!user) {
      return
    }

    const todo: Omit<definitions['todo'], 'id' | 'done'> = {
      name: newTodo.value,
      user_id: user.id,
    }
    const schedule = parseSchedule(todo.name)
    if (schedule) {
      todo.due_date = schedule.schedule.startDate
      todo.repeat_frequency = schedule.schedule.repeatFrequency
      todo.by_day = schedule.schedule.byDay
      todo.name = todoParts.value
        .filter((part) => !part.isSchedule)
        .map((part) => part.value)
        .join('')
    }

    const { error } = await api.from<definitions['todo']>('todo').insert([todo])
    if (error) {
      console.error(error)
    }
    newTodo.value = ''
  }

  return { newTodo, todoParts, addTodo }
}

export async function toggleTodo(todo: Todo) {
  const api = useSupabaseClient()
  const { done } = todo
  const { todos } = await useTodos()
  const index = todos.value.findIndex(({ id }) => id === todo.id)
  todos.value[index].done = !done

  // Just update due date, if it is a recurring task
  if (todo.repeat_frequency && todo.due_date) {
    const duration = parseISODuration(todo.repeat_frequency)
    const nextDate = formatISO(add(parseISO(todo.due_date), duration))
    const { error } = await api
      .from<definitions['todo']>('todo')
      .update({ due_date: nextDate })
      .eq('id', todo.id)
    if (error) {
      console.error(error)
    }
    return
  }

  const { error } = await api
    .from<definitions['todo']>('todo')
    .update({ done: !done })
    .eq('id', todo.id)
  if (error) {
    console.error(error)
  }
}

export async function deleteTodo(todo: Todo) {
  const api = useSupabaseClient()
  const { id: oldId } = todo
  const { todos } = await useTodos()
  const index = todos.value.findIndex(({ id }) => id === oldId)
  todos.value.splice(index, 1)

  const { error } = await api
    .from<definitions['todo']>('todo')
    .delete()
    .eq('id', oldId)
  if (error) {
    console.error(error)
  }
}
