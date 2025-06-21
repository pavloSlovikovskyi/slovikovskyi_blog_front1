<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-center">
      <div class="w-full">
        <nav class="bg-gray-100 p-4 rounded-t-lg">
          <a href="/admin/blog/posts/create" class="text-blue-600 hover:underline">Додати новий пост</a>
        </nav>
        <div class="bg-white shadow-md rounded-b-lg p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
              <thead>
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-3 px-6 text-left">#</th>
                <th class="py-3 px-6 text-left">Автор</th>
                <th class="py-3 px-6 text-left">Категорія</th>
                <th class="py-3 px-6 text-left">Заголовок</th>
                <th class="py-3 px-6 text-left">Дата публікації</th>
              </tr>
              </thead>
              <tbody class="text-gray-600 text-sm font-light">
              <tr v-for="post in posts" :key="post.id" class="border-b border-gray-200 hover:bg-gray-100">
                <td class="py-3 px-6 text-left whitespace-nowrap">{{ post.id }}</td>
                <td class="py-3 px-6 text-left">{{ post.user?.name || 'N/A' }}</td>
                <td class="py-3 px-6 text-left">{{ post.category?.title || 'N/A' }}</td>
                <td class="py-3 px-6 text-left">
                  <NuxtLink :to="`/blog/${post.id}`" class="text-blue-500 hover:underline">
                    {{ post.title }}
                  </NuxtLink>
                </td>
                <td class="py-3 px-6 text-left">{{ post.published_at }}</td>
              </tr>
              <tr v-if="!posts.length && !loading">
                <td colspan="5" class="py-4 px-6 text-center text-gray-500">
                  Записи не знайдено. Переконайтесь, що у вас є пости в базі даних та Laravel API працює.
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="5" class="py-4 px-6 text-center text-blue-500">
                  Завантаження постів...
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const posts = ref([]);
const loading = ref(true);
const getPosts = () => {
  loading.value = true;

  fetch('http://localhost/api/blog/posts')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response:', data);
        posts.value = data.data;
      })
      .catch(error => {
        console.error('There was an error fetching the posts:', error);
      })
      .finally(() => {
        loading.value = false;
      });
};


onMounted(() => {
  getPosts();
});
</script>

<style scoped>
 *
.container {
  max-width: 1200px;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #e2e8f0;
}
</style>