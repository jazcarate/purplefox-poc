<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
const isPulsing = ref(false);
const lastLocalUpdate = ref<number>(Date.now());
const updateError = ref(false);

async function cycleState() {
  if (!props.tournamentId || isUpdating.value) return;

  const expectedCurrentState = state.value;
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
  lastLocalUpdate.value = Date.now();

  // Set updating flag to prevent rapid clicks
  isUpdating.value = true;
  updateError.value = false;

  try {
    // Attempt conditional update - assuming the row exists
    const { data, error } = await supabase
      .from('table_status')
      .update({ status: newState })
      .eq('tableNumber', props.number)
      .eq('tournamentId', props.tournamentId)
      .eq('status', expectedCurrentState) // Only update if status matches what we expect
      .select();

    if (error) throw error;

    // If no rows were updated, the status has changed
    if (!data || data.length === 0) {
      console.warn('Optimistic locking failed: concurrent update detected');
      updateError.value = true;

      // Get the current state from the server
      const { data: currentData, error: fetchError } = await supabase
        .from('table_status')
        .select('status')
        .eq('tableNumber', props.number)
        .eq('tournamentId', props.tournamentId)
        .single();

      if (!fetchError && currentData) {
        // Update our local state to match the server
        state.value = currentData.status as SquareState;
      } else {
        // Revert to the expected state
        state.value = expectedCurrentState;
      }

      setTimeout(() => {
        updateError.value = false;
      }, 1000);
    }
  } catch (err) {
    console.error('Error updating table status:', err);
    // Revert to previous state if there was an error
    state.value = expectedCurrentState;
    updateError.value = true;

    setTimeout(() => {
      updateError.value = false;
    }, 1000);
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

// Watch for changes to state that might come from websockets
watch(
  () => props.initialStatus,
  (newStatus, oldStatus) => {
    // Only trigger pulse effect if:
    // 1. The status actually changed
    // 2. It's not a local update (check time difference > 1s)
    if (newStatus && newStatus !== oldStatus && Date.now() - lastLocalUpdate.value > 1000) {
      state.value = newStatus;
      triggerPulse();
    }
  }
);

function triggerPulse() {
  isPulsing.value = true;
  setTimeout(() => {
    isPulsing.value = false;
  }, 500);
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
    :class="[
      getBackgroundColor(),
      isUpdating ? 'opacity-70' : '',
      isPulsing ? 'pulse-highlight' : ''
    ]" @click="cycleState">
    <span class="text-lg font-medium" :class="state !== 'unknown' ? 'text-white' : 'text-black'">
      {{ number }}
    </span>

    <!-- Loading indicator -->
    <div v-if="isUpdating && !updateError" class="absolute top-1 right-1">
      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <!-- Error indicator -->
    <div v-if="updateError" class="absolute top-1 right-1">
      <svg class="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0;
  }

  70% {
    box-shadow: 0 0 0 3px;
  }

  100% {
    box-shadow: 0 0 0 0;
  }
}

.pulse-highlight {
  animation: pulse-border 0.5s;
}
</style>