import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'

export interface Todo {
  id: number
  name: string
  done: boolean
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
    return data.map((todo) => ({
      id: todo.id,
      name: todo.name,
      done: todo.done,
    }))
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
  const newTodo = ref({ name: '' })

  async function addTodo() {
    const api = useSupabaseClient()
    const user = api.auth.user()
    if (!user) {
      return
    }
    const { error } = await api
      .from<definitions['todo']>('todo')
      .insert([{ ...newTodo.value, user_id: user.id }])
    if (error) {
      console.error(error)
    }
    newTodo.value = { name: '' }
  }

  return { newTodo, addTodo }
}

export async function toggleTodo(todo: Todo) {
  const api = useSupabaseClient()
  const { done } = todo
  const { todos } = await useTodos()
  const index = todos.value.findIndex(({ id }) => id === todo.id)
  todos.value[index].done = !done

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
