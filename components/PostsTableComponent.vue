<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Список Блог Постів</h2>
      <UButton
          to="/posts/create"
          color="blue"
          variant="solid"
          icon="i-heroicons-plus"
          class="px-5 py-2.5 text-lg font-semibold rounded-md shadow-sm hover:shadow-md"
      >
        Додати новий пост
      </UButton>
    </div>

    <div v-if="notification.show" :class="[
        'rounded-md p-4 mb-4 border',
        notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
      ]">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.857a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94l-1.72-1.72z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-4 flex-1 md:flex md:justify-between">
          <p class="text-base font-medium">{{ notification.message }}</p>
        </div>
      </div>
    </div>


    <div v-if="loading" class="text-center py-8">Завантаження постів...</div>
    <div v-else-if="error" class="text-red-600 py-8 text-center">{{ error }}</div>
    <div v-else>
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автор</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заголовок</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата публікації</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="post in posts" :key="post.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ post.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ post.user?.name || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ post.category?.title || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <NuxtLink :to="`/blog/${post.id}`" class="text-blue-600 hover:text-blue-900">
                  {{ post.title }}
                </NuxtLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(post.published_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <UButton
                    :to="`/posts/${post.id}/edit`"
                    color="sky"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    size="sm"
                >
                  Редагувати
                </UButton>
                <UButton
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="sm"
                    @click="handleDelete(post)"
                >
                  Видалити
                </UButton>
              </td>
            </tr>
            <tr v-if="!posts.length">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                Записи не знайдено. Переконайтесь, що у вас є пости в базі даних та Laravel API працює.
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <UModal v-if="isConfirmDeleteModalOpen" v-model="isConfirmDeleteModalOpen">
      <div class="p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-900">Підтвердження видалення</h3>
        <p class="text-gray-700">Ви впевнені, що хочете видалити пост "{{ categoryToDelete?.title || postToDelete?.title }}"?</p>
        <div class="flex justify-end gap-3 mt-6">
          <UButton
              color="gray"
              variant="ghost"
              class="px-4 py-2 text-base font-semibold"
              @click="isConfirmDeleteModalOpen = false"
          >
            Скасувати
          </UButton>
          <UButton
              color="red"
              variant="solid"
              class="px-4 py-2 text-base font-semibold"
              :loading="deleting"
              @click="confirmDeletePost"
          >
            Видалити
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { z } from 'zod';

// Схема для валідації одного посту
const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string().nullable(),
  category_id: z.number().nullable(),
  excerpt: z.string().nullable(),
  content_raw: z.string().nullable(),
  is_published: z.number().transform(val => Boolean(val)),
  published_at: z.string().nullable(),
  user_id: z.number(),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  category: z.object({
    id: z.number(),
    title: z.string(),
  }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Схема для валідації масиву постів
const PostsSchema = z.array(PostSchema);

type Post = z.infer<typeof PostSchema>;

const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

const showNotification = (message: string, type: 'success' | 'error', duration = 3000) => {
  notification.show = true;
  notification.message = message;
  notification.type = type;
  setTimeout(() => notification.show = false, duration);
};

const getPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await $fetch('/api/posts', {
      baseURL: 'http://localhost'
    }) as { data: unknown };

    // ✅ Перевірка з Zod
    const parsed = PostsSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error('Zod validation error:', parsed.error.format());
      throw new Error('Формат отриманих даних некоректний. Перевірте API.');
    }

    posts.value = parsed.data;
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    error.value = err.message ?? 'Не вдалося завантажити пости. Перевірте підключення до API.';
  } finally {
    loading.value = false;
  }
};

onMounted(getPosts);

const postToDelete = ref<Post | null>(null);
const isConfirmDeleteModalOpen = ref(false);
const deleting = ref(false);

const handleDelete = (post: Post) => {
  postToDelete.value = post;
  isConfirmDeleteModalOpen.value = true;
};

const confirmDeletePost = async () => {
  if (!postToDelete.value) return;

  deleting.value = true;
  try {
    await $fetch(`/api/posts/${postToDelete.value.id}`, {
      baseURL: 'http://localhost',
      method: 'DELETE'
    });

    showNotification('Пост успішно видалено!', 'success');
    isConfirmDeleteModalOpen.value = false;
    postToDelete.value = null;
    await getPosts();
  } catch (err: any) {
    console.error('Error deleting post:', err);
    showNotification(`Помилка видалення: ${err.message ?? 'Спробуйте ще раз.'}`, 'error');
  } finally {
    deleting.value = false;
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};
</script>