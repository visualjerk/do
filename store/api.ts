import { Octokit } from 'octokit'
import { GH_COOKIE } from '@/constants'

let octokit: Octokit | undefined

export function getApi() {
  if (!process.client) {
    return null
  }
  if (!octokit) {
    const ghToken = useCookie(GH_COOKIE)
    console.log(ghToken.value)
    if (!ghToken.value) {
      return null
    }
    octokit = new Octokit({ auth: ghToken.value })
  }
  return octokit
}
