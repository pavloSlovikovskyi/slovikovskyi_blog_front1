<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full">
      <h1 class="text-4xl font-extrabold text-gray-900 text-center mb-10">Редагувати Пост</h1>

      <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div v-if="notification.show" :class="[
            'rounded-md p-4 mb-6 border',
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

        <div v-if="loading" class="flex justify-center items-center h-48">
          <p class="text-gray-600 text-lg">Завантаження даних посту...</p>
        </div>

        <UForm v-else :state="state" class="space-y-8" @submit="onSubmit">
          <UFormGroup label="Заголовок" name="title" class="text-lg font-medium text-gray-700">
            <UInput v-model="state.title" size="lg" class="mt-1 block w-full" placeholder="Заголовок посту" />
          </UFormGroup>

          <UFormGroup label="Slug (необов'язково)" name="slug" class="text-lg font-medium text-gray-700">
            <UInput v-model="state.slug" size="lg" class="mt-1 block w-full" placeholder="slug-postu (залишіть порожнім для автогенерації)" />
          </UFormGroup>

          <UFormGroup label="Опис (Excerpt)" name="excerpt" class="text-lg font-medium text-gray-700">
            <UTextarea v-model="state.excerpt" size="lg" class="mt-1 block w-full" placeholder="Короткий опис або анонс посту" />
          </UFormGroup>

          <UFormGroup label="Вміст посту" name="content_raw" class="text-lg font-medium text-gray-700">
            <UTextarea v-model="state.content_raw" size="lg" class="mt-1 block w-full" placeholder="Повний текст посту" :rows="10" />
          </UFormGroup>

          <UFormGroup label="Категорія" name="category_id" class="text-lg font-medium text-gray-700">
            <select
                v-model="state.category_id"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-base text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option :value="null">Не вибрано (без категорії)</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
            </select>
          </UFormGroup>

          <UFormGroup label="Автор" name="user_id" class="text-lg font-medium text-gray-700">
            <select
                v-model="state.user_id"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-base text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option :value="null">Виберіть автора</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </UFormGroup>

          <UFormGroup label="Статус публікації" name="is_published" class="text-lg font-medium text-gray-700">
            <select
                v-model="state.is_published"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-base text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option :value="false">Ні (Чернетка)</option>
              <option :value="true">Так (Опубліковано)</option>
            </select>
          </UFormGroup>

          <div class="flex justify-end space-x-4 pt-6">
            <UButton
                color="white"
                variant="solid"
                to="/posts/blog-posts"
                class="px-6 py-3 text-lg font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Відмінити
            </UButton>
            <UButton
                type="submit"
                :loading="submitting"
                class="px-6 py-3 text-lg font-semibold rounded-md shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              {{ submitting ? 'Оновлення...' : 'Оновити Пост' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { z } from 'zod';
import { useRoute, navigateTo } from '#app';

const route = useRoute();
const postId = ref<number | null>(null);

const postSchema = z.object({
  title: z.string().min(3, 'Заголовок має бути не менше 3 символів.').max(255, 'Заголовок має бути не більше 255 символів.'),
  slug: z.string().nullable().optional(),
  category_id: z.union([z.number().int().positive(), z.null()]).optional(),
  excerpt: z.string().nullable().optional(),
  content_raw: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  published_at: z.string().nullable().optional(), // published_at все ще є, але його значення буде встановлювати бекенд
  user_id: z.union([z.number().int().positive(), z.null()]).refine(val => val !== null, {
    message: 'Необхідно вибрати автора.',
  }),
});

type PostFormData = z.infer<typeof postSchema>;

const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

const showNotification = (message: string, type: 'success' | 'error', duration = 3000) => {
  notification.show = true;
  notification.message = message;
  notification.type = type;
  setTimeout(() => (notification.show = false), duration);
};

const state = reactive<PostFormData>({
  title: '',
  slug: null,
  category_id: null,
  excerpt: null,
  content_raw: null,
  is_published: false,
  published_at: null,
  user_id: null,
});

const categories = ref<{ id: number; title: string }[]>([]);
const users = ref<{ id: number; name: string }[]>([]);

const errors = reactive<{ [key: string]: string | undefined }>({});
const submitting = ref(false);
const loading = ref(true);

const fetchPostData = async () => {
  loading.value = true;
  try {
    postId.value = Number(route.params.id);
    if (isNaN(postId.value)) {
      showNotification('Недійсний ID посту.', 'error');
      navigateTo('/posts/blog-posts');
      return;
    }

    const postRes = await $fetch(`/api/posts/${postId.value}`, { baseURL: 'http://localhost' }) as { data: PostFormData };
    const postData = postRes.data;


    Object.assign(state, {
      title: postData.title || '',
      slug: postData.slug || null,
      category_id: postData.category_id || null,
      excerpt: postData.excerpt || null,
      content_raw: postData.content_raw || null,
      is_published: postData.is_published || false,
      published_at: postData.published_at || null,
      user_id: postData.user_id || null,
    });

  } catch (err: any) {
    console.error('Error fetching post data:', err);
    showNotification(`Не вдалося завантажити пост: ${err.message || 'Спробуйте ще раз.'}`, 'error');
    navigateTo('/posts/blog-posts');
  } finally {
    loading.value = false;
  }
};


const fetchCategoriesAndUsers = async () => {
  try {
    const categoriesRes = await $fetch('/api/categories', { baseURL: 'http://localhost' }) as { data: { id: number; title: string }[] };
    categories.value = categoriesRes.data;

    const usersRes = await $fetch('/api/users', { baseURL: 'http://localhost' }) as { data: { id: number; name: string }[] };
    users.value = usersRes.data;

  } catch (err: any) {
    console.error('Error fetching categories or users:', err);
    showNotification('Не вдалося завантажити категорії або авторів. Перевірте API та мережу.', 'error');
  }
};

const onSubmit = async () => {

  Object.keys(errors).forEach(key => (errors[key] = undefined));
  notification.show = false;

  const dataToSend = {
    ...state,
    slug: state.slug === '' ? null : state.slug,
    excerpt: state.excerpt === '' ? null : state.excerpt,
    content_raw: state.content_raw === '' ? null : state.content_raw,
    // published_at відправляємо як є, його логіку контролює бекенд
    published_at: state.published_at,
    category_id: state.category_id === '' ? null : Number(state.category_id),
    is_published: state.is_published,
    user_id: state.user_id === '' ? null : Number(state.user_id),
  };

  submitting.value = true;
  try {
    console.log(`📦 Sending dataToSend for update (ID: ${postId.value}):`, dataToSend);

    await $fetch(`/api/posts/${postId.value}`, {
      baseURL: 'http://localhost',
      method: 'PUT',
      body: dataToSend,
    });
    showNotification('Пост успішно оновлено!', 'success');
    setTimeout(() => navigateTo('/posts/blog-posts'), 1500);
  } catch (err: any) {
    console.error('Error updating post:', err);
    if (err.statusCode === 422 && err.data?.errors) {
      for (const key in err.data.errors) {
        if (Object.prototype.hasOwnProperty.call(err.data.errors, key)) {
          errors[key] = err.data.errors[key][0];
        }
      }
      showNotification(`Помилка валідації (від API): ${err.data.message || 'Перевірте введені дані.'}`, 'error');
    } else {
      showNotification(`Помилка оновлення: ${err.message || 'Спробуйте ще раз.'}`, 'error');
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchCategoriesAndUsers();
  await fetchPostData();
});

useHead({
  title: 'Редагувати Пост',
  meta: [
    { name: 'description', content: 'Сторінка для редагування існуючого блог посту.' }
  ]
});
</script>