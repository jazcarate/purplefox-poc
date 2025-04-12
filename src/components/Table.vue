<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

interface Props {
  number: number;
  initialStatus?: 'unknown' | 'playing' | 'covered' | 'done';
}

const props = defineProps<Props>();

// States: white (unknown) -> red (Playing) -> yellow (Covered) -> green (Done) -> back to red
type SquareState = 'unknown' | 'playing' | 'covered' | 'done';

// Initialize with the provided status or 'unknown' by default
const state = ref<SquareState>(props.initialStatus || 'unknown');

async function cycleState() {
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

  // Update local state
  state.value = newState;

  // In a production app, you would update the state in Supabase here
  // For example:
  // await supabase
  //   .from('table_status')
  //   .update({ status: newState })
  //   .eq('tableNumber', props.number)
  //   .eq('tournamentId', currentTournamentId);
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
  <div class="flex p-2 rounded cursor-pointer select-none flex-col items-center justify-center text-black h-20"
    :class="getBackgroundColor()" @click="cycleState">
    <span class="text-lg font-medium" :class="state !== 'unknown' ? 'text-white' : 'text-black'">
      {{ number }}
    </span>
  </div>
</template>