<script setup lang="ts">
import { ref, watch } from 'vue';
import { supabase } from '../lib/supabase';
import { type TableStatusStatus } from '../lib/supabase';

interface Props {
  tournamentId: string;
  number: number;
  initialStatus: TableStatusStatus;
}

const props = defineProps<Props>();

const state = ref<TableStatusStatus>(props.initialStatus);
const isUpdating = ref(false);
const isPulsing = ref(false);
const lastLocalUpdate = ref<number>(Date.now());
const pulseTimeout = ref<number | null>(null);
const updateError = ref(false);

async function cycleState() {
  if (!props.tournamentId || isUpdating.value) return;

  const expectedCurrentState = state.value;
  let newState: TableStatusStatus;

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
    // Single atomic operation: updates only if status matches our expected state
    // Returns the updated row or nothing if no update happened
    const { data, error } = await supabase
      .from('table_status')
      .update({ status: newState })
      .eq('tableNumber', props.number)
      .eq('tournamentId', props.tournamentId)
      .eq('status', expectedCurrentState)
      .select('status')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no row was updated (expected if conditions not met)
      throw error;
    }

    // If row was updated successfully, we're done
    if (data) {
      console.log('Update successful');
      return;
    }

    // If we get here, the update failed - check if we already have the desired state
    // or if there was a concurrent update
    const { data: checkData, error: checkError } = await supabase
      .from('table_status')
      .select('status')
      .eq('tableNumber', props.number)
      .eq('tournamentId', props.tournamentId)
      .single();

    if (checkError) throw checkError;

    const currentState = checkData.status as TableStatusStatus;

    // If current state is already our target state, we're good
    if (currentState === newState) {
      console.log('State already matches desired state, no update needed');
      return;
    }

    // Otherwise it's a concurrent update - show error and update local state
    console.warn(`Optimistic locking failed: expected ${expectedCurrentState}, found ${currentState}`);
    updateError.value = true;
    state.value = currentState;

    setTimeout(() => {
      updateError.value = false;
    }, 1000);
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
  // Cancel any existing pulse animation
  if (pulseTimeout.value !== null) {
    clearTimeout(pulseTimeout.value);
    pulseTimeout.value = null;
  }

  // Start new pulse animation
  isPulsing.value = true;

  // Set timeout to end pulse animation
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