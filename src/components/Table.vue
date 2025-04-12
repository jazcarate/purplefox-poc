<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  number: number;
}

const props = defineProps<Props>();

type TableState = 'unknown' | 'playing' | 'covered' | 'done';

const state = ref<TableState>('unknown');

function cycleState() {
  switch (state.value) {
    case 'unknown':
      state.value = 'playing';
      break;
    case 'playing':
      state.value = 'covered';
      break;
    case 'covered':
      state.value = 'done';
      break;
    case 'done':
      state.value = 'playing';
      break;
  }
  console.log(props.number, state.value);
}

function getBackgroundColor(): string {
  if (state.value !== 'unknown') {
    switch (state.value) {
      case 'playing':
        return 'bg-red-500';
      case 'covered':
        return 'bg-yellow-500';
      case 'done':
        return 'bg-green-500';
    }
  }
  return 'bg-white';
}
</script>

<template>
  <div class="flex p-2 rounded cursor-pointer select-none flex-col items-center justify-center text-black"
    :class="getBackgroundColor()" @click="cycleState">
    <span class="text-lg font-medium">
      {{ props.number }}
    </span>
  </div>
</template>