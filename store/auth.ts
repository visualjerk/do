interface User {
  avatarUrl: string
}

export function useUser() {
  const supabaseUser = useSupabaseUser()
  const user = computed<User | null>(() => {
    if (!supabaseUser.value) {
      return null
    }

    const identity = supabaseUser.value.identities?.at(0)

    return {
      avatarUrl: (identity?.identity_data.avatar_url as string) || '',
    }
  })

  return { user }
}

export async function login() {
  const api = useSupabaseClient()
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
  const api = useSupabaseClient()
  await api.auth.signOut()
  await refreshNuxtData()
  useRouter().push('/')
}
