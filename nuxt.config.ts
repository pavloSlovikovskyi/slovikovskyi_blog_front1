export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@nuxtjs/tailwindcss'],
  components: true,
  ui: {
    global: true,
    icons: ['heroicons']
  }
})