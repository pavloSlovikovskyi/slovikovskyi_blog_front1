<template>
  <div class="container mx-auto p-8 text-center">
    <h1 class="text-4xl font-bold mb-8">Лабораторна Робота Nuxt.js + Laravel</h1>
    <p class="text-lg mb-6">Оберіть, яку таблицю ви хочете переглянути:</p>

    <div class="space-y-4">
      <NuxtLink to="/blog-posts" class="block w-64 mx-auto py-3 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
        Переглянути Блог Пости (Базова таблиця)
      </NuxtLink>
      <NuxtLink to="/blog-posts-ui" class="block w-64 mx-auto py-3 px-6 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition duration-300">
        Переглянути Блог Пости (Таблиця Nuxt UI)
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Головна Сторінка - Лабораторна',
  meta: [
    { name: 'description', content: 'Головна сторінка лабораторної роботи з Nuxt.js та Laravel.' }
  ]
})
</script>

<style scoped>

</style>