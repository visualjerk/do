import { router as trpcRouter } from '@trpc/server'
import type { Context } from './context'
export { createContext } from './context'
import { users } from './routes/users'

export const router = trpcRouter<Context>().merge('users.', users)
