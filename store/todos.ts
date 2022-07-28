import { getApi } from '@/store/api'
import { definitions } from '@/types/supabase'

interface Todo {
  id: number
  name: string
  done: boolean
}

export function useTodos() {
  const todos = useState<Todo[]>('TODOS', () => [])

  async function getTodos() {
    const api = getApi()
    if (!api) {
      return
    }
    const apiTodos = await api
      .from<definitions['todo']>('todo')
      .select('*')
      .order('id')
    if (!apiTodos.data) {
      todos.value = []
      return
    }

    todos.value = apiTodos.data.map((todo) => ({
      id: todo.id,
      name: todo.name,
      done: todo.done,
    }))
  }

  function subscribe() {
    const api = getApi()
    if (!api) {
      return
    }
    api
      .from('todo')
      .on('*', () => {
        getTodos()
      })
      .subscribe()
  }

  return { todos, getTodos, subscribe }
}

export function useTodoForm() {
  const newTodo = ref({ name: '' })

  async function addTodo() {
    const api = getApi()
    if (!api) {
      return
    }
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
  const api = getApi()
  if (!api) {
    return
  }
  const { done } = todo
  const { todos } = useTodos()
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
