import { actions } from '../src/routes/+page.server';
import { describe, test, expect, vi } from 'vitest';

describe('+page.server.ts', () => {
    const mockSupabase = {
        auth: {
            signInWithOtp: vi.fn(),
        },
    };

    const mockEvent = (email: string) => {
        return {
            request: {
                formData: async () => new Map([['email', email]]),
            },
            locals: { supabase: mockSupabase },
        } as any;
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    test('returns error for invalid email', async () => {
        const event = mockEvent('invalid-email');
        const result = await actions.default(event);

        // Expecting ActionFailure object
        expect(result).toMatchObject({
            status: 400,
            data: {
                email: 'invalid-email',
                errors: { email: 'Please enter a valid email address' },
            },
        });
    });

    test('calls supabase.auth.signInWithOtp for valid email', async () => {
        mockSupabase.auth.signInWithOtp.mockResolvedValueOnce({ error: null });
        const event = mockEvent('test@example.com');

        const result = await actions.default(event);

        expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(result).toMatchObject({
            success: true,
            message: 'Please check your email for a magic link to log into the website.',
        });
    });

    test('returns error for supabase failure', async () => {
        mockSupabase.auth.signInWithOtp.mockResolvedValueOnce({ error: { message: 'Supabase error' } });
        const event = mockEvent('test@example.com');

        const result = await actions.default(event);

        // Expecting ActionFailure object
        expect(result).toMatchObject({
            status: 400,
            data: {
                email: 'test@example.com',
                success: false,
                message: 'There was an issue, Please contact support.',
            },
        });
    });
});