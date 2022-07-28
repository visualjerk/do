import { router as trpcRouter } from '@trpc/server'
import type { GithubUser, Context } from '../context'

export const users = trpcRouter<Context>().query('get', {
  resolve({ ctx }): GithubUser | null {
    return ctx.authUser
  },
})
