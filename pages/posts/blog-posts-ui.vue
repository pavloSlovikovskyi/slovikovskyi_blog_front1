<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <h1 class="text-2xl font-semibold text-gray-900">Блог пости</h1>
          <p class="mt-1 text-sm text-gray-500">{{ posts.length }} записів знайдено</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span class="ml-3 text-gray-600">Завантаження...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">{{ error }}</div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <UTable
            ref="table"
            v-model:pagination="pagination"
            :data="posts"
            :columns="columns"
            :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
          }"
            :ui="{
            wrapper: 'relative overflow-x-auto',
            base: 'min-w-full table-fixed',
            divide: 'divide-y divide-gray-200',
            thead: 'bg-gray-50',
            tbody: 'bg-white divide-y divide-gray-200',
            tr: {
              base: 'hover:bg-gray-50',
              selected: 'bg-gray-50',
              active: 'hover:bg-gray-50'
            },
            th: {
              base: 'text-left rtl:text-right',
              padding: 'px-6 py-3',
              color: 'text-gray-900',
              font: 'font-medium text-sm',
              size: 'text-sm'
            },
            td: {
              base: 'whitespace-nowrap',
              padding: 'px-6 py-4',
              color: 'text-gray-900',
              font: 'text-sm',
              size: 'text-sm'
            }
          }"
        />

        <!-- Pagination -->
        <div class="bg-white px-6 py-3 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Показано
              <span class="font-medium">{{ ((table?.tableApi?.getState().pagination.pageIndex || 0) * (table?.tableApi?.getState().pagination.pageSize || 10)) + 1 }}</span>
              -
              <span class="font-medium">{{ Math.min(((table?.tableApi?.getState().pagination.pageIndex || 0) + 1) * (table?.tableApi?.getState().pagination.pageSize || 10), posts.length) }}</span>
              з
              <span class="font-medium">{{ posts.length }}</span>
              записів
            </div>

            <UPagination
                :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
                :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: 'first:rounded-l-md last:rounded-r-md',
                default: {
                  size: 'sm',
                  activeButton: {
                    color: 'primary'
                  },
                  inactiveButton: {
                    color: 'white'
                  }
                }
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const table = useTemplateRef('table')

type Post = {
  id: string
  name: string
  category: string
  title: string
  date: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const getPosts = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/blog/posts', {
      baseURL: 'http://localhost',
      query: {
        per_page: 50,
        page: 1
      }
    })

    posts.value = response.data.map((post: any) => ({
      id: String(post.id),
      name: post.user?.name || '—',
      category: post.category?.title || '—',
      title: post.title,
      date: post.published_at
    })) as Post[]

  } catch (err: any) {
    console.error('Помилка:', err)
    error.value = 'Не вдалося завантажити дані'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getPosts()
})

const columns: TableColumn<Post>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => h('span', { class: 'font-mono text-gray-500' }, `#${row.getValue('id')}`),
    meta: {
      style: 'width: 80px'
    }
  },
  {
    accessorKey: 'title',
    header: 'Заголовок',
    cell: ({ row }) => h('div', {
      class: 'font-medium text-gray-900 max-w-md truncate',
      title: row.getValue('title')
    }, row.getValue('title')),
    meta: {
      style: 'min-width: 300px'
    }
  },
  {
    accessorKey: 'name',
    header: 'Автор',
    cell: ({ row }) => h('span', { class: 'text-gray-600' }, row.getValue('name')),
    meta: {
      style: 'width: 150px'
    }
  },
  {
    accessorKey: 'category',
    header: 'Категорія',
    cell: ({ row }) => h('span', {
      class: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    }, row.getValue('category')),
    meta: {
      style: 'width: 120px'
    }
  },
  {
    accessorKey: 'date',
    header: 'Дата',
    cell: ({ row }) => {
      const date = row.getValue('date')
      return h('time', {
        class: 'text-gray-500 font-mono text-xs',
        datetime: date
      }, date ? new Date(date).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : '—')
    },
    meta: {
      style: 'width: 100px'
    }
  }
]

const pagination = ref({
  pageIndex: 0,
  pageSize: 15
})


useHead({
  title: 'Блог пости',
  meta: [
    { name: 'description', content: 'Перегляд блог постів' }
  ]
})
</script>

<style scoped>

.table-fixed {
  table-layout: fixed;
}
</style>