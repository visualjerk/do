import { Ref } from 'vue'
import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'
import { parseSchedule, parseDate, ParserConfig } from 'date-parrot'
import { Duration } from 'luxon'
import {
  add,
  formatISO,
  isPast,
  setDate,
  setMonth,
  setHours,
  setMinutes,
  setSeconds,
  setDay,
  parseISO,
} from 'date-fns'

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

export async function useTodos(subscribe = false, listId?: string) {
  const api = useSupabaseClient()
  let subscription: RealtimeSubscription | undefined

  if (subscribe && process.client) {
    onUnmounted(() => {
      if (subscription) {
        api.removeSubscription(subscription)
      }
    })
  }

  const dataKey = listId != null ? `todos:${listId}` : 'todos'
  const filter: ['list_id', 'eq' | 'is', string | null] =
    listId != null ? ['list_id', 'eq', listId] : ['list_id', 'is', null]
  const { data: todos, refresh } = await useAsyncData(dataKey, async () => {
    const { data } = await api
      .from<Todo>('todo')
      .select('*')
      .filter(...filter)
      .order('rank')

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

  return {
    todos,
    deleteTodo: (todo: Todo) => deleteTodo(todo, todos),
    toggleTodo: (todo: Todo) => toggleTodo(todo, todos),
    moveTodo: (todo: Todo, leadingTodo?: Todo, trailingTodo?: Todo) =>
      moveTodo(todo, todos, leadingTodo, trailingTodo),
  }
}

export function useTodoForm(listId?: string) {
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

    const { todos } = await useTodos(false, listId)
    const nextRank =
      todos.value?.length > 1 ? todos.value[todos.value.length - 1].rank + 1 : 1

    const todo: Omit<Todo, 'id' | 'done'> = {
      name: newTodo.value,
      user_id: user.id,
      rank: nextRank,
    }

    if (listId != null) {
      todo.list_id = parseInt(listId)
    }
    const schedule = parseSchedule(todo.name, dateParrotConfig)
    const date = parseDate(todo.name, dateParrotConfig)
    if (schedule) {
      todo.due_date = schedule.schedule.startDate
      todo.repeat_frequency = schedule.schedule.repeatFrequency
      todo.by_day = schedule.schedule.byDay
      todo.by_month = schedule.schedule.byMonth
      todo.by_month_day = schedule.schedule.byMonthDay
      todo.by_time = schedule.schedule.byTime
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

    if (!todo.name || todo.name.trim().length === 0) {
      return
    }

    const { error } = await api.from<Todo>('todo').insert([todo])
    if (error) {
      console.error(error)
    }
    newTodo.value = ''
  }

  return { newTodo, todoParts, addTodo }
}

// TODO: test this
function getNextOccurance(todo: Todo): string {
  const {
    repeat_frequency,
    due_date,
    by_day,
    by_month,
    by_month_day,
    by_time,
  } = todo
  if (!repeat_frequency || !due_date) {
    throw new Error('Todo has no repeat_frequency or due_date')
  }

  const dueDate = parseISO(due_date)
  let nextDate = isPast(dueDate) ? new Date() : dueDate

  const duration = parseISODuration(repeat_frequency)
  nextDate = add(nextDate, duration)

  if (by_day != null) {
    nextDate = setDay(nextDate, by_day)
  }

  if (by_month != null) {
    nextDate = setMonth(nextDate, by_month)

    if (by_month_day != null) {
      nextDate = setDate(nextDate, by_month_day)
    }
  }

  if (by_time != null) {
    const [hours, minutes, seconds] = by_time.split(/Z|\+|-/)[0].split(':')
    nextDate = setHours(nextDate, parseInt(hours))
    nextDate = setMinutes(nextDate, parseInt(minutes))
    nextDate = setSeconds(nextDate, parseInt(seconds))
  }

  while (isPast(nextDate)) {
    nextDate = add(nextDate, duration)
  }

  return formatISO(nextDate)
}

async function toggleTodo(todo: Todo, todos: Ref<Todo[]>) {
  const api = useSupabaseClient()
  const { done } = todo
  const index = todos.value.findIndex(({ id }) => id === todo.id)
  todos.value[index].done = !done

  // Just update due date, if it is a recurring task
  if (todo.repeat_frequency && todo.due_date) {
    const nextDate = getNextOccurance(todo)
    const { error } = await api
      .from<Todo>('todo')
      .update({ due_date: nextDate })
      .eq('id', todo.id)
    if (error) {
      console.error(error)
    }
    return
  }

  const { error } = await api
    .from<Todo>('todo')
    .update({ done: !done })
    .eq('id', todo.id)
  if (error) {
    console.error(error)
  }
}

async function deleteTodo(todo: Todo, todos: Ref<Todo[]>) {
  const api = useSupabaseClient()
  const { id: oldId } = todo
  const index = todos.value.findIndex(({ id }) => id === oldId)
  todos.value.splice(index, 1)

  const { error } = await api.from<Todo>('todo').delete().eq('id', oldId)
  if (error) {
    console.error(error)
  }
}

function getTodoIndex(todo: Todo, todos: Todo[]) {
  return todos.findIndex(({ id }) => id === todo.id)
}

async function moveTodo(
  todo: Todo,
  todos: Ref<Todo[]>,
  leadingTodo?: Todo,
  trailingTodo?: Todo
) {
  const api = useSupabaseClient()
  const index = getTodoIndex(todo, todos.value)

  if (!leadingTodo && !trailingTodo) {
    return
  }

  // Remove from current position
  todos.value.splice(index, 1)

  let newRank = 0

  // Add to new position
  if (leadingTodo && trailingTodo) {
    const newIndex = getTodoIndex(trailingTodo, todos.value)
    newRank = (leadingTodo.rank + trailingTodo.rank) / 2
    todos.value.splice(newIndex, 0, todo)
  } else if (leadingTodo) {
    newRank = leadingTodo.rank + 1
    todos.value.push(todo)
  } else if (trailingTodo) {
    newRank = trailingTodo.rank / 2
    todos.value.unshift(todo)
  }

  // Update rank
  const { error } = await api
    .from<Todo>('todo')
    .update({ rank: newRank })
    .eq('id', todo.id)
  if (error) {
    console.error(error)
  }
}
