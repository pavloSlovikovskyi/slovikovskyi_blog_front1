<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Категорії Блогу</h1>
        <p class="text-sm text-gray-500">{{ categories.length }} записів знайдено</p>
      </div>
      <NuxtLink to="/categories/create" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Додати</NuxtLink>
    </div>

    <div v-if="notification.show" :class="notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="p-3 rounded mb-4">
      {{ notification.message }}
    </div>

    <div v-if="loading" class="text-center py-8">Завантаження...</div>
    <div v-else-if="error" class="text-red-600 py-8">{{ error }}</div>
    <div v-else>
      <UTable
          ref="table"
          :data="categories"
          :columns="columns"
          v-model:pagination="pagination"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
          class="w-full"
      />

      <div class="flex justify-center pt-4">
        <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>

    <UModal v-if="isConfirmDeleteModalOpen" v-model="isConfirmDeleteModalOpen">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">Підтвердження</h3>
        <p>Видалити категорію "{{ categoryToDelete?.title }}"?</p>
        <div class="flex justify-end gap-2 mt-4">
          <UButton @click="isConfirmDeleteModalOpen = false">Скасувати</UButton>
          <UButton color="red" @click="confirmDeleteCategory">Видалити</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { z } from 'zod';
import { getPaginationRowModel } from '@tanstack/vue-table';
import type { TableColumn } from '@nuxt/ui';
import { navigateTo } from '#app';

const CategorySchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  parent_id: z.number().nullable(),
  description: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

const CategoriesSchema = z.array(CategorySchema);

type Category = z.infer<typeof CategorySchema>;

const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const table = ref();
const pagination = ref({ pageIndex: 0, pageSize: 5 });

const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
});

const showNotification = (message: string, type: 'success' | 'error', duration = 3000) => {
  notification.value = { show: true, message, type };
  setTimeout(() => notification.value.show = false, duration);
};

const getCategories = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/categories', {
      baseURL: 'http://localhost'
    }) as { data: unknown };

    const parsed = CategoriesSchema.safeParse(response.data);
    if (!parsed.success) {
      console.error('Zod validation error:', parsed.error.format());
      throw new Error('Формат отриманих даних некоректний');
    }
    categories.value = parsed.data;
  } catch (err: any) {
    error.value = err.message ?? 'Не вдалося завантажити категорії.';
  } finally {
    loading.value = false;
  }
};

onMounted(getCategories);

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'title',
    header: 'Назва категорії',
    cell: ({ row }) => row.getValue('title') ?? '—'
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => row.getValue('slug') ?? '—'
  },
  {
    accessorKey: 'description',
    header: 'Опис',
    cell: ({ row }) => row.getValue('description') ?? '—'
  },
  {
    accessorKey: 'actions',
    header: 'Дії',
    cell: ({ row }) => {
      const id = row.original.id;
      return h('div', { class: 'space-x-2' }, [
        h('button', {
          class: 'text-blue-600 hover:underline',
          onClick: () => navigateTo(`/categories/${id}/edit`)
        }, 'Редагувати'),
        h('button', {
          class: 'text-red-600 hover:underline',
          onClick: () => handleDelete(row.original)
        }, 'Видалити')
      ]);
    }
  }
];

const categoryToDelete = ref<Category | null>(null);
const isConfirmDeleteModalOpen = ref(false);

const handleDelete = (category: Category) => {
  categoryToDelete.value = category;
  isConfirmDeleteModalOpen.value = true;
};

const confirmDeleteCategory = async () => {
  if (!categoryToDelete.value) return;

  try {
    await $fetch(`/api/categories/${categoryToDelete.value.id}`, {
      baseURL: 'http://localhost',
      method: 'DELETE'
    });

    showNotification('Категорію видалено', 'success');
    isConfirmDeleteModalOpen.value = false;
    await getCategories();
  } catch (err: any) {
    showNotification(`Помилка видалення: ${err.message ?? 'Спробуйте ще раз'}`, 'error');
  }
};
</script>
