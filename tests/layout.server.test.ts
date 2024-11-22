// tests/layout.server.test.ts
import { load } from '../src/routes/+layout.server';

describe('+layout.server.ts', () => {
  it('returns user, supabase, and session from locals', async () => {
    const mockContext = {
      locals: {
        user: { id: '123', email: 'test@example.com' },
        supabase: { someClient: true },
        session: { token: 'mockToken', expires: 'mockDate' },
      },
    };

    const result = await load(mockContext as any);
    expect(result).toEqual({
      user: mockContext.locals.user,
      supabase: mockContext.locals.supabase,
      session: mockContext.locals.session,
    });
  });

  it('handles missing locals gracefully', async () => {
    const mockContext = { locals: {} };

    const result = await load(mockContext as any);
    expect(result).toEqual({
      user: undefined,
      supabase: undefined,
      session: undefined,
    });
  });
});