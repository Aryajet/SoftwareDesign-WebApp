import { test, expect } from 'vitest';
import { supabase } from '../src/lib/supabaseClient';

test('Supabase client is initialized', () => {
    expect(supabase).toBeDefined();
});