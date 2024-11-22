import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from '../src/routes/+page.svelte';
import { vi } from 'vitest';

// Mock `goto` from `$app/navigation`
vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
}));

// Mock `supabase` client
vi.mock('../src/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(() => Promise.resolve({ data: null, error: null })),
            signUp: vi.fn(() => Promise.resolve({ data: null, error: null })),
        },
    },
}));

test('calls signUpWithEmail on sign up button click', async () => {
    render(Page);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signUpButton = screen.getByText('Sign Up');

    await fireEvent.input(emailInput, { target: { value: 'newuser@example.com' } });
    await fireEvent.input(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(signUpButton);

    const { goto } = await import('$app/navigation');

    // Assert that `goto` was called exactly once
    expect(goto).toHaveBeenCalledTimes(1);

    // Optionally, assert that `goto` was called with the correct argument
    expect(goto).toHaveBeenCalledWith('/protected/profile');
});