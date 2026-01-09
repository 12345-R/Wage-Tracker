
import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables without crashing the app if process.env is missing
const getEnvVar = (name: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (err) {
    // Silently fail if process.env is inaccessible
  }
  return '';
};

const url = getEnvVar('VITE_SUPABASE_URL');
const key = getEnvVar('VITE_SUPABASE_ANON_KEY');

// We provide valid-format placeholder strings if variables are missing.
// This prevents the Supabase SDK from throwing a fatal "supabaseUrl is required" error during the initialization phase.
const placeholderUrl = 'https://your-project-id.supabase.co';
const placeholderKey = 'your-anon-key';

export const supabase = createClient(
  url || placeholderUrl,
  key || placeholderKey
);

export const isConfigMissing = !url || !key;

if (isConfigMissing) {
  console.warn('Supabase configuration missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.');
}
