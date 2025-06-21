<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div v-if="loading" class="text-center text-lg text-gray-600">
      <p>Завантаження посту...</p>
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 inline-block mt-3"></div>
    </div>

    <div v-else-if="error" class="text-center text-red-500 text-lg">
      <p>Помилка завантаження: {{ error }}</p>
      <p class="text-gray-500 text-sm mt-1">Перевірте підключення до API.</p>
    </div>

    <div v-else-if="post">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>

      <div class="text-sm text-gray-600 mb-6 space-y-1">
        <p><span class="font-medium">Автор:</span> {{ post.user?.name }}</p>
        <p><span class="font-medium">Категорія:</span> {{ post.category?.title }}</p>
        <p><span class="font-medium">Опубліковано:</span> {{ post.published_at ? new Date(post.published_at).toLocaleDateString('uk-UA') : 'N/A' }}</p>
      </div>

      <div class="prose text-gray-800 leading-relaxed text-base mb-8">
        <p v-html="post.content"></p>
      </div>

      <div class="border-t border-gray-200 pt-6">
        <NuxtLink to="/blog-posts" class="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          До всіх постів
        </NuxtLink>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 text-lg">
      <p>Пост не знайдено.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const post = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Функція для отримання окремого посту
const getPost = async () => {
  loading.value = true;
  error.value = null;

  // Отримуємо ID посту з параметрів маршруту
  const postId = route.params.id;
  console.log('Fetching post with ID:', postId);

  if (!postId) {
    error.value = 'ID посту не вказано в URL.';
    loading.value = false;
    return;
  }

  try {
    const apiUrl = `http://localhost/api/blog/posts/${postId}`;
    console.log('Fetching from API:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Невідома помилка'}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    post.value = data.data;

  } catch (err: any) {
    console.error('There was an error fetching the post:', err);
    error.value = err.message || 'Невідома помилка при завантаженні посту.';
    post.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getPost();
});

useHead(() => ({
  title: post.value ? post.value.title : 'Деталі Посту',
  meta: [
    { name: 'description', content: post.value ? post.value.content?.substring(0, 150) : 'Деталі блог посту.' }
  ]
}));
</script>