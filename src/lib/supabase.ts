import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be provided in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// States: white (unknown) -> red (Playing) -> yellow (Covered) -> green (Done) -> back to red
export type TableStatusStatus = 'unknown' | 'playing' | 'covered' | 'done';

export interface TableStatus {
    tableNumber: number;
    tournamentId: string;
    status: TableStatusStatus;
} 