import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'
import { parseSchedule, parseDate, ParserConfig } from 'date-parrot'
import { Duration } from 'luxon'
import { add, parseISO, formatISO, isPast, setDate } from 'date-fns'

const dateParrotConfig: ParserConfig = {
  locales: ['en', 'de'],
}

function parseISODuration(isoDurationString: string) {
  return Duration.fromISO(isoDurationString).toObject()
}

export type Todo = definitions['todo']

interface InputPart {
  value: string
  isSchedule?: boolean
  isDate?: boolean
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
    const schedule = parseSchedule(value, dateParrotConfig)
    const date = parseDate(value, dateParrotConfig)
    const match = schedule ? schedule.match : date?.match
    if (!match) {
      return [
        {
          value: newTodo.value,
        },
      ]
    }

    const parts: InputPart[] = [
      {
        isSchedule: !!schedule,
        isDate: !schedule && !!date,
        value: match.text,
      },
    ]
    if (match.index > 0) {
      parts.unshift({
        value: value.slice(0, match.index),
      })
    }
    const endIndex = match.index + match.text.length
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
    const schedule = parseSchedule(todo.name, dateParrotConfig)
    const date = parseDate(todo.name, dateParrotConfig)
    if (schedule) {
      todo.due_date = schedule.schedule.startDate
      todo.repeat_frequency = schedule.schedule.repeatFrequency
      todo.by_day = schedule.schedule.byDay
      todo.name = todoParts.value
        .filter((part) => !part.isSchedule)
        .map((part) => part.value)
        .join('')
    } else if (date) {
      todo.due_date = date.date
      todo.name = todoParts.value
        .filter((part) => !part.isDate)
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

function getNextOccurance(todo: Todo): string {
  const { repeat_frequency, due_date, by_day } = todo
  if (!repeat_frequency || !due_date) {
    throw new Error('Todo has no repeat_frequency or due_date')
  }
  const duration = parseISODuration(repeat_frequency)
  let nextDate = add(parseISO(due_date), duration)

  if (by_day != null) {
    nextDate = setDate(nextDate, by_day)
  }

  if (isPast(nextDate)) {
    return getNextOccurance({
      ...todo,
      due_date: formatISO(nextDate),
    })
  }

  return formatISO(nextDate)
}

export async function toggleTodo(todo: Todo) {
  const api = useSupabaseClient()
  const { done } = todo
  const { todos } = await useTodos()
  const index = todos.value.findIndex(({ id }) => id === todo.id)
  todos.value[index].done = !done

  // Just update due date, if it is a recurring task
  if (todo.repeat_frequency && todo.due_date) {
    const nextDate = getNextOccurance(todo)
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
  const sure = confirm(`Do you really want to delete ${todo.name}?`)
  if (!sure) {
    return
  }
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
