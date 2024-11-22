// tests/layout.load.test.ts
import { load } from '../src/routes/+layout.server';
import { vi } from 'vitest';

describe('layout load function', () => {
  it('should return user, session, and supabase from locals', async () => {
    // Mocking the locals object directly
    const mockLocals = {
      user: { id: '123', email: 'test@example.com' },
      session: { user: { id: '123', email: 'test@example.com' } },
      supabase: {
        auth: {
          signIn: vi.fn() // Mocking supabase.auth.signIn method
        }
      }
    };

    // Creating the mock event object, only including the locals property
    const mockEvent = {
      locals: mockLocals
    };

    // Call the load function with the mock event
    const result = await load(mockEvent as any);

    // Validate that the result matches the mocked data
    expect(result).toEqual({
      user: { id: '123', email: 'test@example.com' },
      session: { user: { id: '123', email: 'test@example.com' } },
      supabase: mockLocals.supabase
    });
  });
});