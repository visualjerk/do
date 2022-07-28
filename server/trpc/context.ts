import { Octokit } from '@octokit/rest'
import { getCache } from '@/server/cache'
import { GH_COOKIE } from '@/constants'
import type { inferAsyncReturnType } from '@trpc/server'
import type { CompatibilityEvent } from 'h3'

export interface GithubUser {
  avatarUrl: string
}

async function getUserFromHeader(
  event: CompatibilityEvent
): Promise<GithubUser | null> {
  const ghToken = useCookies(event)[GH_COOKIE]

  if (!ghToken) {
    return null
  }

  // Try to get GitHub user from cache
  const cache = getCache()
  const cachedUser = cache.get(ghToken)
  if (cachedUser) {
    return cachedUser as GithubUser
  }

  // Get user from GitHub
  const octokit = new Octokit({ auth: ghToken })
  const { data, status } = await octokit.rest.users.getAuthenticated()

  // Github user not valid
  if (status >= 400) {
    return null
  }

  const githubUser: GithubUser = {
    avatarUrl: data.avatar_url,
  }

  // Add user to cache
  cache.set(ghToken, githubUser)
  return githubUser
}

// The app's context - is generated for each incoming request
export async function createContext(event: CompatibilityEvent) {
  const authUser = await getUserFromHeader(event)

  return {
    authUser,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
