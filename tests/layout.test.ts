import { render, screen, fireEvent } from '@testing-library/svelte';
import Layout from '../src/routes/+layout.svelte';
import { vi } from 'vitest';

// Mock the SvelteKit `goto` function
vi.mock('$app/navigation', () => ({
    goto: vi.fn(),
}));

const mockSupabase = {
    auth: {
        signOut: vi.fn(() => ({ error: null })), // Mocking signOut to return no error
    },
};

test('renders navigation bar with Home link', () => {
    render(Layout, { data: { session: null, user: null, supabase: mockSupabase } });
    expect(screen.getByText('Home')).toBeTruthy();
});

test('renders profile and logout links if signed in', async () => {
    const { rerender } = render(Layout, { data: { session: { user: { id: '123' } }, user: { id: '123' }, supabase: mockSupabase } });
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('LogOut')).toBeTruthy();

    // Simulate sign-out
    const logoutButton = screen.getByText('LogOut');
    await fireEvent.click(logoutButton);

    // Ensure the mocked signOut function was called
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();

    // Re-render with session null
    await rerender({ data: { session: null, user: null, supabase: mockSupabase } });

    // Confirm Profile link is no longer in the DOM
    expect(screen.queryByText('Profile')).toBeFalsy();
});