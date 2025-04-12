<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  number: number;
}

const props = defineProps<Props>();

// States: white (unknown) -> red (Playing) -> yellow (Covered) -> green (Done) -> back to red
type SquareState = 'unknown' | 'playing' | 'covered' | 'done';

const state = ref<SquareState>('unknown');

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
  return props.isSelected ? 'bg-orange-400' : 'bg-white';
}
</script>

<template>
  <div class="flex p-2 rounded cursor-pointer select-none flex-col items-center justify-center bg-white text-black"
    :class="getBackgroundColor()" @click="cycleState">
    <span class="text-lg font-medium">
      {{ number }}
    </span>
  </div>
</template>