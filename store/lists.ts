import { definitions } from '@/types/supabase'
import type { RealtimeSubscription } from '@supabase/supabase-js'

export type List = definitions['list']

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

    const list: Omit<definitions['list'], 'id'> = {
      name: newList.value,
      user_id: user.id,
    }

    if (!list.name || list.name.trim().length === 0) {
      return
    }

    const { error } = await api.from<definitions['list']>('list').insert([list])
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

  const { error } = await api
    .from<definitions['list']>('list')
    .delete()
    .eq('id', oldId)
  if (error) {
    console.error(error)
  }
}
