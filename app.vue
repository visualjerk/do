<script lang="ts" setup>
import { useUser, login, logout } from '@/store/auth'

const { user, getUser, subscribe } = await useUser()

getUser()
subscribe()

useHead({
  title: 'Do',
})
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header
      class="flex items-center gap-3 p-2 justify-between sticky top-0 z-10 bg-slate-50 border-b border-slate-200"
    >
      <NuxtLink to="/" class="text-slate-800">Do</NuxtLink>
      <nav class="flex items-center justify-end gap-2">
        <ClientOnly>
          <ActionButton @click="logout" v-if="user">
            <img
              :src="user.avatarUrl"
              class="rounded-full h-5 w-5 mr-2 border"
            />
            Logout
          </ActionButton>
        </ClientOnly>
        <a
          href="https://github.com/visualjerk/do"
          class="flex px-2 py-1 text-slate-600 hover:text-slate-800"
          title="Open GitHub Repo"
          target="_blank"
        >
          <mdicon name="github" />
        </a>
      </nav>
    </header>

    <main class="py-6 sm:py-10 px-4 max-w-screen-md m-auto">
      <ClientOnly>
        <div v-if="!user">
          <h1 class="mb-8">Please login</h1>
          <ActionButton @click="login" v-if="!user">
            Login with GitHub
          </ActionButton>
        </div>
        <NuxtPage v-else />
      </ClientOnly>
    </main>
    <footer class="p-8 flex justify-center items-center gap-1 text-slate-500">
      Built by
      <a
        href="https://twitter.com/visual_jerk"
        target="_blank"
        class="inline-flex items-center"
      >
        <mdicon name="twitter" size="20" /> visualjerk
      </a>
    </footer>
  </div>
</template>