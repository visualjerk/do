<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import { useUser, login, logout } from '@/store/auth'

const { user } = await useUser()

useHead({
  title: 'Do',
})

if (process.client) {
  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshNuxtData()
    }
  })
}

function reload() {
  location.reload()
}
</script>

<template>
  <NuxtErrorBoundary>
    <template #error="{ error }">
      <div class="py-3 sm:py-10 px-2 sm:px-4 max-w-screen-md m-auto">
        <h1 class="mb-4">Oh snap ... an error occurred</h1>
        <pre
          class="p-2 text-slate-800 bg-white dark:bg-slate-800 dark:text-slate-200 mb-4"
          >{{ error }}</pre
        >
        <button
          @click="reload"
          class="py-2 px-4 bg-indigo-600 dark:bg-teal-600 text-white"
        >
          Reload Page
        </button>
      </div>
    </template>
    <div class="min-h-screen relative pb-20">
      <header
        class="flex items-center gap-3 p-2 justify-between sticky top-0 z-10 bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700"
      >
        <NuxtLink to="/" class="text-slate-800 dark:text-slate-200">
          <svg
            width="28"
            height="28"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M185.402 118.609L170.021 111.09C174.123 85.3411 186.2 68.5931 206.252 60.8457C212.632 58.5671 219.354 57.4277 226.418 57.4277C246.014 57.4277 263.218 64.8333 278.029 79.6445C292.84 94.2279 300.246 110.634 300.246 128.863C300.474 152.561 295.461 179.905 285.207 210.895C260.598 284.495 217.076 356.044 154.641 425.543L131.057 450.494C122.17 458.469 116.132 462.685 112.941 463.141C103.143 462.913 93.6868 453.456 84.5723 434.771C87.5345 426.34 102.346 378.945 129.006 292.584C155.894 206.223 174.693 148.232 185.402 118.609ZM215.822 95.709C215.822 114.622 212.176 136.041 204.885 159.967C197.821 183.665 192.694 200.641 189.504 210.895C186.542 220.921 177.769 247.353 163.186 290.191C148.83 333.03 138.12 368.463 131.057 396.49C148.602 378.033 165.806 355.93 182.668 330.182C183.579 328.814 184.377 327.675 185.061 326.764C237.014 246.327 262.99 170.79 262.99 100.152C262.99 92.1771 260.826 87.5059 256.496 86.1387C255.129 85.9108 253.762 85.7969 252.395 85.7969C238.039 86.0247 225.848 89.3288 215.822 95.709Z"
              fill="currentColor"
            />
            <path
              d="M363.479 204.059C352.085 205.882 337.388 234.365 319.387 289.508C301.385 344.651 292.385 377.236 292.385 387.262C292.385 397.288 293.296 402.301 295.119 402.301C304.689 402.301 319.615 381.793 339.895 340.777C360.174 299.534 370.314 261.822 370.314 227.643C370.314 212.148 368.036 204.286 363.479 204.059ZM358.01 161.676C364.39 161.676 369.859 163.499 374.416 167.145C382.391 173.98 386.379 187.197 386.379 206.793C386.379 296.344 370.428 363.45 338.527 408.111L333.742 415.289C313.918 444 297.967 458.355 285.891 458.355C271.079 456.76 262.535 445.937 260.256 425.885C260.256 409.251 266.978 375.527 280.422 324.713C294.094 273.899 309.702 229.921 327.248 192.779C337.274 172.271 347.528 161.904 358.01 161.676Z"
              fill="currentColor"
            />
          </svg>
        </NuxtLink>
        <nav class="flex items-center justify-end gap-2">
          <button
            @click="logout"
            v-if="user"
            class="px-2 py-1 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-teal-500"
          >
            <mdicon name="power" />
          </button>
        </nav>
      </header>
      <main class="py-3 sm:py-10 px-2 sm:px-4 max-w-screen-md m-auto">
        <div v-if="!user">
          <h1 class="mb-8">Please login</h1>
          <button
            @click="login"
            v-if="!user"
            class="flex gap-3 items-center py-8 sm:py-12 bg-white text-slate-600 text-lg hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-teal-500 w-full justify-center"
          >
            <mdicon name="github" size="30" />
            Login with GitHub
          </button>
        </div>
        <NuxtPage v-else />
      </main>
      <footer
        class="absolute inset-x-0 bottom-0 p-8 flex justify-center items-center gap-1 text-slate-500 text-xs"
      >
        <a
          href="https://github.com/visualjerk/do"
          target="_blank"
          class="p-1 hover:text-indigo-600 dark:hover:text-teal-500"
          title="Open GitHub Repo"
        >
          <mdicon name="github" size="20" />
        </a>
      </footer>
    </div>
  </NuxtErrorBoundary>
</template>
