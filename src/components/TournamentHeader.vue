<script setup lang="ts">
interface Props {
  id: string;
  isConnected: boolean;
}

const props = defineProps<Props>();

</script>

<template>
  <header class="fixed top-0 w-full flex items-center h-12 px-4 bg-green-800 text-white">
    <a href="/" class="mr-2 hover:opacity-80">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"
        width="1.5em" height="1.5em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"></path>
      </svg>
    </a>

    <!-- Left section with timer -->
    <div class="flex-1 flex items-center">
      <div class="flex px-2 select-none">
        <div class="mr-1 cursor-pointer font-medium"> (R7) </div>
        <div class="cursor-pointer font-medium">50:00</div>
      </div>
    </div>

    <!-- Tournament ID centered -->
    <div class="absolute left-1/2 transform -translate-x-1/2 font-bold">
      Tournament: {{ id }}
    </div>

    <!-- Right section with icons -->
    <div class="flex-1 flex justify-end items-center space-x-3">
      <button class="text-white hover:opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"
          width="1.5em" height="1.5em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M10 4v4h4V4zm6 0v4h4V4zm0 6v4h4v-4zm0 6v4h4v-4zm-2 4v-4h-4v4zm-6 0v-4H4v4zm0-6v-4H4v4zm0-6V4H4v4zm2 6h4v-4h-4zM4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4c-1.08 0-2-.9-2-2V4a2 2 0 0 1 2-2">
          </path>
        </svg>
      </button>
      <button class="text-white hover:opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"
          width="1.5em" height="1.5em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5">
          </path>
        </svg>
      </button>
      <button class="text-white hover:opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"
          width="1.5em" height="1.5em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2">
          </path>
        </svg>
      </button>

      <!-- Connection status pill -->
      <div class="flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
        :class="{ 'bg-green-600 hover:bg-green-700': props.isConnected, 'bg-red-600 hover:bg-red-700': !props.isConnected }">
        <div class="relative mr-1.5">
          <div class="h-2 w-2 rounded-full" :class="{ 'bg-white': true }"></div>
          <div v-if="props.isConnected"
            class="absolute top-0 left-0 h-2 w-2 rounded-full bg-white animate-ping opacity-75"></div>
        </div>
        <span>{{ props.isConnected ? 'Connected' : 'Offline' }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>