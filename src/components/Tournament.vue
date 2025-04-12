<script setup lang="ts">
import { ref } from 'vue';
import Table from './Table.vue';
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-20 flex items-center h-10 px-2 text-white bg-purple">
    <button><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"
        role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"></path>
      </svg></button>
    <div class="flex-1">
      <div class="flex flex-1 px-2 ml-2 select-none">
        <div class="mr-1 cursor-pointer"> (R7) </div>
        <div class="cursor-pointer">50:00</div>
      </div>
      <div class="space-x-2"><button class="text-white"><svg xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em"
            preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M10 4v4h4V4zm6 0v4h4V4zm0 6v4h4v-4zm0 6v4h4v-4zm-2 4v-4h-4v4zm-6 0v-4H4v4zm0-6v-4H4v4zm0-6V4H4v4zm2 6h4v-4h-4zM4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4c-1.08 0-2-.9-2-2V4a2 2 0 0 1 2-2">
            </path>
          </svg></button><button class="text-white"><svg xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em"
            preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5">
            </path>
          </svg></button><button class="text-white"><svg xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em"
            preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z">
            </path>
          </svg></button><button class="text-white"><svg xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em"
            preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2">
            </path>
          </svg></button></div>
    </div>
  </header>

  <div class="z-10 px-2 py-4 mt-10 md:px-3 lg:px-10 isolate">
    <div class="gap-2 grid-cols-[1fr]">
      <Table v-for="number in 50" :key="number" :number="number" />
    </div>
  </div>
</template>