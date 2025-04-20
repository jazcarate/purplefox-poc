<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { supabase } from '../lib/supabase';
import { type TableStatusStatus } from '../lib/supabase';

interface Props {
  tournamentId: string;
  number: number;
  initialStatus: TableStatusStatus;
}

const props = defineProps<Props>();

// The starting state is our best knowledge of what's in the database
const startingState = ref<TableStatusStatus>(props.initialStatus);

// The UI state is what we're showing (optimistic updates)
const uiState = ref<TableStatusStatus>(props.initialStatus);

// Tracking state
const isUpdating = ref(false);
const isPulsing = ref(false);
const lastLocalUpdate = ref<number>(Date.now());
const pulseTimeout = ref<number | null>(null);
const hasError = ref(false);

// Computed state for display
const displayState = computed(() => {
  return hasError.value ? startingState.value : uiState.value;
});

// Get next state in the cycle
function getNextState(currentState: TableStatusStatus): TableStatusStatus {
  switch (currentState) {
    case 'unknown': return 'playing';
    case 'playing': return 'covered';
    case 'covered': return 'done';
    case 'done': return 'playing';
  }
}

// Handle user clicking the table
function cycleState() {
  // Calculate the next state based on current UI state
  const nextState = getNextState(uiState.value);

  // Update UI immediately (optimistic)
  uiState.value = nextState;
  lastLocalUpdate.value = Date.now();

  // Show loading state
  isUpdating.value = true;

  // Schedule the actual update with debounce
  debouncedUpdate();
}

// The actual update operation, debounced to prevent too many calls
const debouncedUpdate = useDebounceFn(async () => {
  console.log('updating table', props.number, 'from', startingState.value, 'to', uiState.value);
  const originalState = startingState.value;
  try {
    startingState.value = uiState.value; // Very optimistic
    hasError.value = false;

    // Try to update from starting state to UI state with optimistic locking
    const { data, error } = await supabase
      .from('table_status')
      .update({ status: uiState.value })
      .eq('tableNumber', props.number)
      .eq('tournamentId', props.tournamentId)
      .eq('status', originalState)
      .select();

    if (error) throw error;

    // Check if update succeeded (matched our expected state)
    if (data && data.length > 0) {
      console.log('update succeeded');
      return;
    }

    // If update failed, check the current state
    const { data: currentData, error: checkError } = await supabase
      .from('table_status')
      .select('status')
      .eq('tableNumber', props.number)
      .eq('tournamentId', props.tournamentId)
      .single();

    if (checkError) throw checkError;

    const actualState = currentData.status as TableStatusStatus;

    // Update our knowledge of the starting state
    startingState.value = actualState;

    // If the current state already matches our desired state, that's fine
    if (actualState === uiState.value) {
      console.log('State already updated to the desired state');
      return;
    }

    // Otherwise, show error and revert UI after a delay
    console.warn(`Optimistic locking failed: expected ${originalState}, got ${actualState}`);
    hasError.value = true;
    uiState.value = actualState;

    setTimeout(() => {
      hasError.value = false;
    }, 3000);

  } catch (err) {
    console.error('Error updating table status:', err);
    hasError.value = true;

    // Revert UI to match confirmed state
    uiState.value = originalState;
    setTimeout(() => {
      hasError.value = false;
    }, 3000);
  } finally {
    isUpdating.value = false;
  }
}, 500);

// Get the appropriate background color based on state
function getBackgroundColor(): string {
  switch (displayState.value) {
    case 'playing': return 'bg-red-500';
    case 'covered': return 'bg-yellow-500';
    case 'done': return 'bg-green-500';
    default: return 'bg-white';
  }
}

// Handle websocket updates
watch(
  () => props.initialStatus,
  (newStatus, oldStatus) => {
    // Only process remote updates (not our local changes)
    if (newStatus && newStatus !== oldStatus && Date.now() - lastLocalUpdate.value > 1000) {
      // Update both states to match the server
      startingState.value = newStatus;
      uiState.value = newStatus;
      hasError.value = false;
      triggerPulse();
    }
  }
);

// Trigger the pulse animation
function triggerPulse() {
  // Cancel any existing animation
  if (pulseTimeout.value !== null) {
    clearTimeout(pulseTimeout.value);
    pulseTimeout.value = null;
  }

  // Start new animation
  isPulsing.value = true;

  // Set timeout to end animation
  pulseTimeout.value = window.setTimeout(() => {
    isPulsing.value = false;
    pulseTimeout.value = null;
  }, 500);
}
</script>

<template>
  <div class="flex p-2 rounded cursor-pointer select-none flex-col items-center justify-center text-black h-20 relative"
    :class="[
      getBackgroundColor(),
      isPulsing ? 'pulse-highlight' : ''
    ]" @click="cycleState">
    <span class="text-lg font-medium" :class="displayState !== 'unknown' ? 'text-white' : 'text-black'">
      {{ props.number }}
    </span>

    <!-- Loading indicator -->
    <div v-if="isUpdating && !hasError" class="absolute top-1 right-1">
      <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div>

    <!-- Error indicator -->
    <div v-if="hasError" class="absolute top-1 right-1">
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