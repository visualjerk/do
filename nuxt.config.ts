import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    },
  },
  css: ['@/assets/css/main.css'],
  build: {
    postcss: {
      postcssOptions: require('./postcss.config.cjs'),
    },
    transpile: ['mdi-vue'],
  },
  typescript: {
    strict: true,
  },
})
