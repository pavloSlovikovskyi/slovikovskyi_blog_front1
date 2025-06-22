<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full">
      <h1 class="text-4xl font-extrabold text-gray-900 text-center mb-10">Створити Категорію</h1>

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

        <UForm :state="state" class="space-y-8" @submit="onSubmit">
          <UFormGroup label="Назва Категорії" name="title" :error="errors.title" class="text-lg font-medium text-gray-700">
            <UInput v-model="state.title" size="lg" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Назва категорії" />
          </UFormGroup>

          <UFormGroup label="Опис (необов'язково)" name="description" :error="errors.description" class="text-lg font-medium text-gray-700">
            <UTextarea v-model="state.description" size="lg" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Короткий опис категорії" />
          </UFormGroup>

          <UFormGroup label="Батьківська Категорія (необов'язково)" name="parent_id" :error="errors.parent_id" class="text-lg font-medium text-gray-700">
            <select
                v-model="state.parent_id"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-base text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option v-for="cat in parentCategories" :key="cat.id" :value="cat.id">{{ cat.title }}</option>
            </select>
            <p v-if="errors.parent_id" class="text-sm text-red-600 mt-1">{{ errors.parent_id }}</p>
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
              {{ submitting ? 'Збереження...' : 'Створити' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { z } from 'zod'
import { navigateTo } from '#app'

const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const showNotification = (message: string, type: 'success' | 'error', duration = 3000) => {
  notification.show = true
  notification.message = message
  notification.type = type
  setTimeout(() => (notification.show = false), duration)
}

const state = reactive({
  title: '',
  description: '',
  parent_id: ''
})

const parentCategories = ref<{ id: number; title: string }[]>([])

const errors = reactive<{ [key: string]: string }>({})

const submitting = ref(false)

const categorySchema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи'),
  description: z.string().nullable().optional(),
  parent_id: z.union([z.number(), z.null()]).optional()
})

const fetchParentCategories = async () => {
  try {
    const res = await $fetch('/api/categories', { baseURL: 'http://localhost' }) as { data: { id: number; title: string }[] } // Змінено порт на 8000
    parentCategories.value = res.data
  } catch (err) {
    showNotification('Не вдалося завантажити категорії', 'error')
  }
}

const onSubmit = async () => {
  errors.title = ''
  errors.description = ''
  errors.parent_id = ''
  notification.show = false

  const validatedData = {
    title: state.title,
    description: state.description === '' ? null : state.description,
    parent_id: state.parent_id === '' ? null : Number(state.parent_id)
  }

  try {
    categorySchema.parse(validatedData)
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      e.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0]] = err.message
        }
      })
    }
    showNotification('Перевірте помилки у формі', 'error')
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/categories', {
      baseURL: 'http://localhost',
      method: 'POST',
      body: validatedData
    })
    showNotification('Категорію успішно створено!', 'success')
    setTimeout(() => navigateTo('/categories'), 1200)
  } catch (err: any) {
    showNotification(err.data?.message || err.message || 'Сталася помилка', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchParentCategories)

useHead({ title: 'Створити категорію' })
</script>