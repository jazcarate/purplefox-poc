<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

interface Props {
  number: number;
  initialStatus?: 'unknown' | 'playing' | 'covered' | 'done';
  tournamentId?: string;
}

const props = defineProps<Props>();

// States: white (unknown) -> red (Playing) -> yellow (Covered) -> green (Done) -> back to red
type SquareState = 'unknown' | 'playing' | 'covered' | 'done';

// Initialize with the provided status or 'unknown' by default
const state = ref<SquareState>(props.initialStatus || 'unknown');
const isUpdating = ref(false);

async function cycleState() {
  if (!props.tournamentId || isUpdating.value) return;

  let newState: SquareState;

  switch (state.value) {
    case 'unknown':
      newState = 'playing';
      break;
    case 'playing':
      newState = 'covered';
      break;
    case 'covered':
      newState = 'done';
      break;
    case 'done':
      newState = 'playing';
      break;
  }

  // Update local state immediately for responsive UI
  state.value = newState;

  // Set updating flag to prevent rapid clicks
  isUpdating.value = true;

  try {
    // Update the state in Supabase
    const { error } = await supabase
      .from('table_status')
      .upsert({
        tableNumber: props.number,
        tournamentId: props.tournamentId,
        status: newState
      });

    if (error) {
      console.error('Error updating table status:', error);
      // Revert to previous state if there was an error
      state.value = props.initialStatus || 'unknown';
    }
  } catch (err) {
    console.error('Error updating table status:', err);
    // Revert to previous state if there was an error
    state.value = props.initialStatus || 'unknown';
  } finally {
    isUpdating.value = false;
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
  return 'bg-white';
}

// Set initial state based on props
onMounted(() => {
  if (props.initialStatus) {
    state.value = props.initialStatus;
  }
});
</script>

<template>
  <div class="flex p-2 rounded cursor-pointer select-none flex-col items-center justify-center text-black h-20 relative"
    :class="[getBackgroundColor(), isUpdating ? 'opacity-70' : '']" @click="cycleState">
    <span class="text-lg font-medium" :class="state !== 'unknown' ? 'text-white' : 'text-black'">
      {{ number }}
    </span>

    <!-- Loading indicator -->
    <div v-if="isUpdating" class="absolute inset-0 flex items-center justify-center">
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>
  </div>
</template>