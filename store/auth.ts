import { getApi } from '@/store/api'
import { USER_STATE } from '@/constants'

export async function getUser() {
  const api = await getApi()

  if (!api) {
    return
  }
  const { data, status } = await api.rest.users.getAuthenticated()

  if (status >= 400) {
    return
  }

  const user = useState(USER_STATE)
  user.value = {
    avatarUrl: data.avatar_url,
  }
}

export function login() {
  if (!process.client) {
    return
  }
  window.location.pathname = '/api/auth/login'
}

export async function logout() {
  await $fetch('/api/auth/logout')
  await refreshNuxtData()
  useRouter().push('/')
}
