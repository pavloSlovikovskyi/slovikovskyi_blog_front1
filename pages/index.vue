<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full text-center bg-white p-10 rounded-xl shadow-lg border border-gray-200">
      <p class="text-xl text-gray-600 mb-10">Оберіть, яку секцію ви хочете переглянути:</p>

      <div class="space-y-6">
        <UButton
            to="/posts/blog-posts"
            size="xl"
            block
            color="green"
            variant="solid"
            class="justify-center px-8 py-4 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          Управління постами
        </UButton>

        <UButton
            to="/posts/blog-posts-ui"
            size="xl"
            block
            color="purple"
            variant="solid"
            class="justify-center px-8 py-4 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          Переглянути Блог Пости (Таблиця Nuxt UI)
        </UButton>

        <UButton
            to="/categories"
            size="xl"
            block
            color="blue"
            variant="solid"
            class="justify-center px-8 py-4 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          Управління категоріями
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


useHead({
  title: 'Головна Сторінка',
  meta: [
    { name: 'description', content: 'Головна сторінка лабораторної роботи' }
  ]
})
</script>