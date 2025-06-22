<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full">
      <h1 class="text-4xl font-extrabold text-gray-900 text-center mb-10">Редагувати Категорію</h1>

      <div v-if="loadingCategory" class="flex items-center justify-center py-12 bg-white rounded-lg shadow-sm">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span class="ml-3 text-gray-600">Завантаження даних категорії...</span>
      </div>

      <div v-else-if="fetchError" class="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
        <div class="text-sm font-medium text-red-800">{{ fetchError }}</div>
        <div class="mt-2 text-sm text-red-700">
          <button @click="navigateTo('/categories')" class="font-medium text-red-700 hover:text-red-900 underline">
            Повернутися до списку категорій
          </button>
        </div>
      </div>

      <div v-else class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
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

        <UForm :state="state" class="space-y-8" @submit="onSubmit">
          <UFormGroup label="Назва Категорії" name="title" :error="errors.title" class="text-lg font-medium text-gray-700">
            <UInput v-model="state.title" size="lg" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </UFormGroup>

          <UFormGroup label="Опис" name="description" :error="errors.description" class="text-lg font-medium text-gray-700">
            <UTextarea v-model="state.description" size="lg" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </UFormGroup>

          <UFormGroup label="Батьківська Категорія" name="parent_id" :error="errors.parent_id" class="text-lg font-medium text-gray-700">
            <select
                v-model="state.parent_id"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-base text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option
                  v-for="option in parentCategoryOptions"
                  :key="option.id === null ? 'null-option' : option.id"
                  :value="option.id"
              >
                {{ option.title }}
              </option>
            </select>
          </UFormGroup>

          <div class="flex justify-end space-x-4 pt-6">
            <UButton
                color="white"
                variant="solid"
                to="/categories"
                class="px-6 py-3 text-lg font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Відмінити
            </UButton>
            <UButton
                type="submit"
                :loading="submitting"
                class="px-6 py-3 text-lg font-semibold rounded-md shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              Зберегти зміни
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
import { useRoute, navigateTo } from '#app/composables/router';

type Category = {
  id: number;
  title: string;
  description: string | null;
  parent_id: number | null;
  slug: string;
  created_at: string;
  updated_at: string;
};

// Схема валідації для категорії
const categorySchema = z.object({
  title: z.string().min(3, 'Назва має бути не менше 3 символів.').max(255, 'Назва має бути не більше 255 символів.'),
  description: z.string().nullable().optional(),
  parent_id: z.number().int().positive().nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const route = useRoute();
const categoryId = ref<number | null>(null);

const loadingCategory = ref(true);
const fetchError = ref<string | null>(null);

const state = reactive<CategoryFormData>({
  title: '',
  description: null,
  parent_id: null,
});

const errors = reactive<{ [key: string]: string | undefined }>({});
const submitting = ref(false);
const parentCategoryOptions = ref<{ id: number | null; title: string }[]>([
  { id: null, title: 'Без батьківської категорії (Коренева)' }
]);

const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

const showNotification = (message: string, type: 'success' | 'error', duration: number = 3000) => {
  notification.show = true;
  notification.message = message;
  notification.type = type;

  setTimeout(() => {
    notification.show = false;
    notification.message = '';
  }, duration);
};

const fetchParentCategories = async (currentCategoryId: number | null = null) => {
  try {
    const response = await $fetch('/api/categories', {
      baseURL: 'http://localhost',
    }) as { data: Category[] };

    let filteredCategories = response.data;
    if (currentCategoryId !== null) {

      filteredCategories = response.data.filter(cat => cat.id !== currentCategoryId);
    }

    parentCategoryOptions.value = [
      ...filteredCategories.map(cat => ({
        id: cat.id,
        title: cat.title
      }))
    ];
    console.log('Завантажені батьківські категорії:', parentCategoryOptions.value);
  } catch (err: any) {
    console.error('Помилка завантаження батьківських категорій:', err);
    showNotification('Не вдалося завантажити список категорій для батьківського вибору.', 'error');
  }
};

// Функція для завантаження поточної категорії
const fetchCategoryData = async () => {
  loadingCategory.value = true;
  fetchError.value = null;

  if (!categoryId.value) {
    fetchError.value = 'Ідентифікатор категорії не вказано.';
    loadingCategory.value = false;
    return;
  }

  try {
    const response = await $fetch(`/api/categories/${categoryId.value}`, {
      baseURL: 'http://localhost',
    }) as { data: Category };

    state.title = response.data.title;
    state.description = response.data.description;
    state.parent_id = response.data.parent_id !== null ? Number(response.data.parent_id) : null;

    console.log('Дані поточної категорії завантажені:', response.data);
    console.log('Початкове значення state.parent_id:', state.parent_id);

    await fetchParentCategories(categoryId.value);
  } catch (err: any) {
    console.error(`Помилка завантаження категорії ID ${categoryId.value}:`, err);
    fetchError.value = err.message || 'Не вдалося завантажити дані категорії.';
  } finally {
    loadingCategory.value = false;
  }
};

const onSubmit = async () => {
  errors.title = undefined;
  errors.description = undefined;
  errors.parent_id = undefined;
  notification.show = false;

  try {
    categorySchema.parse(state);
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      e.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as keyof CategoryFormData] = err.message;
        }
      });
      showNotification('Помилка валідації: Перевірте введені дані.', 'error');
    }
    return;
  }

  submitting.value = true;
  try {
    await $fetch(`/api/categories/${categoryId.value}`, {
      baseURL: 'http://localhost', // *** Переконайтеся, що порт вірний! ***
      method: 'PUT',
      body: state,
    });
    showNotification('Категорію успішно оновлено!', 'success');
    setTimeout(() => {
      navigateTo('/categories');
    }, 1500);
  } catch (err: any) {
    console.error('Помилка оновлення категорії:', err);
    if (err.statusCode === 422 && err.data?.errors) {
      for (const key in err.data.errors) {
        if (Object.prototype.hasOwnProperty.call(err.data.errors, key)) {
          errors[key] = err.data.errors[key][0];
        }
      }
      showNotification(`Помилка валідації: ${err.data.message || 'Перевірте введені дані.'}`, 'error');
    } else {
      showNotification(`Помилка оновлення: ${err.message || 'Спробуйте ще раз.'}`, 'error');
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  const idParam = route.params.id;
  if (idParam && typeof idParam === 'string') {
    categoryId.value = parseInt(idParam);
    fetchCategoryData();
  } else {
    fetchError.value = "Недійсний ідентифікатор категорії в URL.";
    loadingCategory.value = false;
  }
});

useHead({
  title: 'Редагувати Категорію',
  meta: [
    { name: 'description', content: 'Сторінка для редагування існуючої категорії блогу.' }
  ]
});
</script>