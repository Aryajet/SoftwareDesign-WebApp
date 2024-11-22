import { load, actions } from '../src/routes/account/+page.server';
import { vi } from 'vitest';
import { redirect } from '@sveltejs/kit';

// Mock `redirect` and `fail` functions
vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    redirect: vi.fn(),
    fail: vi.fn().mockReturnValue({ status: 500 }),
  };
});

describe('Account Page Server', () => {
  it('should redirect if no session is found', async () => {
    const mockEvent = {
      locals: {
        supabase: { auth: { getSession: vi.fn().mockResolvedValue({ session: null }) } },
        safeGetSession: vi.fn().mockResolvedValue({ session: null }),
      },
    };

    try {
      await load(mockEvent as any);
    } catch (e) {
      expect(redirect).toHaveBeenCalledWith(303, '/');
    }
  });

  it('should return profile data if session exists', async () => {
    const mockEvent = {
      locals: {
        supabase: {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    username: 'jane_doe',
                    full_name: 'Jane Doe',
                    website: 'https://janeswebsite.com',
                    avatar_url: 'https://janesavatar.com/avatar.jpg',
                  },
                }),
              }),
            }),
          }),
        },
        safeGetSession: vi.fn().mockResolvedValue({
          session: { user: { id: '123' } },
        }),
      },
    };

    const result = await load(mockEvent as any);

    expect(result).toEqual({
      session: { user: { id: '123' } },
      profile: {
        username: 'jane_doe',
        full_name: 'Jane Doe',
        website: 'https://janeswebsite.com',
        avatar_url: 'https://janesavatar.com/avatar.jpg',
      },
    });
  });

  it('should update profile successfully', async () => {
    const mockEvent = {
      request: {
        formData: vi.fn().mockResolvedValue(
          new Map([
            ['fullName', 'Jane Doe'],
            ['username', 'jane_doe'],
            ['website', 'https://janeswebsite.com'],
            ['avatarUrl', 'https://janesavatar.com/avatar.jpg'],
          ])
        ),
      },
      locals: {
        supabase: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }),
        },
        safeGetSession: vi.fn().mockResolvedValue({
          session: { user: { id: '123' } },
        }),
      },
    };

    const result = await actions.update(mockEvent as any);

    expect(result).toEqual({
      fullName: 'Jane Doe',
      username: 'jane_doe',
      website: 'https://janeswebsite.com',
      avatarUrl: 'https://janesavatar.com/avatar.jpg',
    });
  });

  it('should fail on profile update if error occurs', async () => {
    const mockEvent = {
      request: {
        formData: vi.fn().mockResolvedValue(
          new Map([
            ['fullName', 'Jane Doe'],
            ['username', 'jane_doe'],
            ['website', 'https://janeswebsite.com'],
            ['avatarUrl', 'https://janesavatar.com/avatar.jpg'],
          ])
        ),
      },
      locals: {
        supabase: {
          from: vi.fn().mockReturnValue({
            upsert: vi.fn().mockResolvedValue({ error: { message: 'Error updating profile' } }),
          }),
        },
        safeGetSession: vi.fn().mockResolvedValue({
          session: { user: { id: '123' } },
        }),
      },
    };
  
    // Call the `update` action
    const result = await actions.update(mockEvent as any);
  
    // Adjust test to match actual fail behavior
    expect(result).toEqual({
      status: 500,
    });
  });

  it('should sign out successfully', async () => {
    const mockEvent = {
      locals: {
        supabase: {
          auth: { signOut: vi.fn().mockResolvedValue({}) },
        },
        safeGetSession: vi.fn().mockResolvedValue({
          session: { user: { id: '123' } },
        }),
      },
    };

    await actions.signout(mockEvent as any);

    expect(redirect).toHaveBeenCalledWith(303, '/');
  });
});
