import { Octokit } from 'octokit'
import { GH_COOKIE } from '@/constants'

let octokit: Octokit | undefined

export async function getApi() {
  if (!process.client) {
    throw null
  }
  if (!octokit) {
    const ghToken = useCookie(GH_COOKIE)
    if (!ghToken) {
      return null
    }
    octokit = new Octokit({ auth: ghToken.value })
  }
  return octokit
}
