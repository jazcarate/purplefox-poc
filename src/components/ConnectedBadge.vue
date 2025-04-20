<script setup lang="ts">
import { computed } from 'vue';
import { useTimeAgo, useIntervalFn } from '@vueuse/core';

interface Props {
    lastUpdateTimestamp: number;
    isConnected: boolean;
}

const props = defineProps<Props>();

// Compute human-readable time since last update
const timeAgo = computed(() => {
    return useTimeAgo(props.lastUpdateTimestamp).value;
});

// Refresh the time display every 10 seconds
useIntervalFn(() => {
    // This is just to force a re-render of the component
}, 10000);

// Color scheme based on connection and update time
const statusColor = computed(() => {
    if (!props.isConnected) return 'bg-red-500';

    // Check elapsed time since last update
    const elapsedMs = Date.now() - props.lastUpdateTimestamp;

    if (elapsedMs < 30000) return 'bg-green-500'; // Less than 30s: green
    if (elapsedMs < 300000) return 'bg-yellow-500'; // 30s to 5min: yellow
    return 'bg-orange-500'; // More than 5min: orange
});

// Status text
const statusText = computed(() => {
    if (!props.isConnected) return 'Disconnected';
    return `Last update: ${timeAgo.value}`;
});
</script>

<template>
    <div class="flex items-center space-x-2 text-xs text-white rounded-full px-3 py-1" :class="statusColor">
        <div class="flex-shrink-0 w-2 h-2 rounded-full"
            :class="props.isConnected ? 'bg-white animate-pulse' : 'bg-gray-300'"></div>
        <span>{{ statusText }}</span>
    </div>
</template>