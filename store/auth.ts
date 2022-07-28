import { getApi } from '@/store/api'

interface User {
  avatarUrl: string
}

export function useUser() {
  const user = useState<User | null>('USER')

  function getUser() {
    const api = getApi()
    if (!api) {
      return
    }
    const apiUser = api.auth.user()
    if (!apiUser) {
      user.value = null
      return
    }

    const identity = apiUser.identities?.at(0)

    user.value = {
      avatarUrl: (identity?.identity_data.avatar_url as string) || '',
    }
  }

  function subscribe() {
    const api = getApi()
    if (!api) {
      return
    }
    api.auth.onAuthStateChange(getUser)
  }

  return { user, getUser, subscribe }
}

export async function login() {
  const api = getApi()
  if (!api) {
    return
  }
  const appUrl = useRuntimeConfig().app.baseURL
  await api.auth.signIn(
    {
      provider: 'github',
    },
    {
      redirectTo: appUrl,
    }
  )
}

export async function logout() {
  const api = getApi()
  if (!api) {
    return
  }
  await api.auth.signOut()
  await refreshNuxtData()
  useRouter().push('/')
}
