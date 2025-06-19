<template>
  <div>
    <h1 class="text-3xl font-bold text-center my-8">Список Блог Постів з Laravel API</h1>
    <PostsTableComponent />
  </div>
</template>

<script setup lang="ts">

import PostsTableComponent from '~/components/PostsTableComponent.vue';

useHead({
  title: 'Блог Пости',
  meta: [
    { name: 'description', content: 'Список блог постів, отриманих з Laravel API.' }
  ]
});
</script>