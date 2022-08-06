import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'

export type List = definitions['list']

export async function useList(id: string, subscribe = false) {
  const api = useSupabaseClient()
  let subscription: RealtimeSubscription | undefined

  if (subscribe && process.client) {
    onUnmounted(() => {
      if (subscription) {
        api.removeSubscription(subscription)
      }
    })
  }

  const { data: list, refresh } = await useAsyncData(`list:${id}`, async () => {
    const { data } = await api
      .from<List>('list')
      .select('*')
      .filter('id', 'eq', id)
      .order('id')

    if (!data?.length) {
      return null
    }
    return data[0]
  })

  if (subscribe && process.client) {
    subscription = api
      .from(`list:id=eq.${id}`)
      .on('*', () => {
        refresh()
      })
      .subscribe()
  }

  return { list }
}

export async function useLists(subscribe = false) {
  const api = useSupabaseClient()
  let subscription: RealtimeSubscription | undefined

  if (subscribe && process.client) {
    onUnmounted(() => {
      if (subscription) {
        api.removeSubscription(subscription)
      }
    })
  }

  const { data: lists, refresh } = await useAsyncData('lists', async () => {
    const { data } = await api
      .from<definitions['list']>('list')
      .select('*')
      .order('id')

    if (!data) {
      return []
    }
    return data
  })

  if (subscribe && process.client) {
    subscription = api
      .from('list')
      .on('*', () => {
        refresh()
      })
      .subscribe()
  }

  return { lists }
}

export function useListForm() {
  const newList = ref('')

  async function addList() {
    const api = useSupabaseClient()
    const user = api.auth.user()
    if (!user) {
      return
    }

    const list: Omit<List, 'id'> = {
      name: newList.value,
      user_id: user.id,
    }

    if (!list.name || list.name.trim().length === 0) {
      return
    }

    const { error } = await api.from<List>('list').insert([list])
    if (error) {
      console.error(error)
    }
    newList.value = ''
  }

  return { newList, addList }
}

export async function deleteList(list: List) {
  const api = useSupabaseClient()
  const { id: oldId } = list
  const { lists } = await useLists()
  const index = lists.value.findIndex(({ id }) => id === oldId)
  lists.value.splice(index, 1)

  const { error: errorTodos } = await api
    .from<definitions['todo']>('todo')
    .delete()
    .eq('list_id', oldId)

  if (errorTodos) {
    console.error(errorTodos)
  }

  const { error } = await api.from<List>('list').delete().eq('id', oldId)
  if (error) {
    console.error(error)
  }
}
