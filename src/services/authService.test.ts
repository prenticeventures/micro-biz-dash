import {
  getCurrentUser,
  getSessionUser,
  isAuthServiceReachable,
  requestPasswordReset,
  signIn,
  signUp,
} from './authService';
import { supabase } from '../lib/supabase';

let onlineServicesEnabled = true;

vi.mock('../lib/supabase', () => ({
  get areOnlineServicesEnabled() {
    return onlineServicesEnabled;
  },
  isSupabaseConfigured: true,
  onlineServicesDisabledMessage:
    'Online accounts are currently disabled. The full game is available without signing in.',
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'sb_publishable_test_key_1234567890',
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
  TABLES: {
    USERS: 'users',
    GAME_SESSIONS: 'game_sessions',
    USER_STATS: 'user_stats',
    LEADERBOARD: 'leaderboard_entries',
  },
}));

const mockedSupabase = supabase as any;

describe('authService error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineServicesEnabled = true;
  });

  it('normalizes load failed during sign-in into user-friendly network message', async () => {
    mockedSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Load failed' },
    });

    const result = await signIn('user@example.com', 'password123');
    expect(result.error).toBe(
      'Network error contacting the sign-in service. Please check your connection and try again.'
    );
  });

  it('normalizes invalid credential message during sign-in', async () => {
    mockedSupabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const result = await signIn('user@example.com', 'bad-password');
    expect(result.error).toBe('Invalid email or password. Please try again.');
  });

  it('normalizes network failures during sign-up', async () => {
    mockedSupabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch' },
    });

    const result = await signUp('new@example.com', 'password123', 'Player');
    expect(result.error).toBe(
      'Network error contacting the sign-in service. Please check your connection and try again.'
    );
  });
});

describe('session-backed auth bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineServicesEnabled = true;
  });

  it('reads the cached session user without calling getUser', async () => {
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'player@example.com',
            created_at: '2026-03-12T00:00:00.000Z',
            updated_at: '2026-03-12T00:00:00.000Z',
            user_metadata: { game_name: 'Player One' },
          },
        },
      },
      error: null,
    });

    const sessionUser = await getSessionUser();

    expect(sessionUser?.id).toBe('user-1');
    expect(mockedSupabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('hydrates the current user from the cached session and profile table', async () => {
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-2',
            email: 'runner@example.com',
            created_at: '2026-03-12T00:00:00.000Z',
            updated_at: '2026-03-12T00:00:00.000Z',
            user_metadata: { game_name: 'Runner' },
          },
        },
      },
      error: null,
    });

    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'user-2',
        email: 'runner@example.com',
        game_name: 'Runner',
        created_at: '2026-03-12T00:00:00.000Z',
        updated_at: '2026-03-12T00:00:00.000Z',
      },
      error: null,
    });

    mockedSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single,
        }),
      }),
    });

    const currentUser = await getCurrentUser();

    expect(currentUser?.id).toBe('user-2');
    expect(mockedSupabase.auth.getUser).not.toHaveBeenCalled();
  });
});

describe('isAuthServiceReachable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineServicesEnabled = true;
  });

  it('returns true when auth settings and anon leaderboard access succeed', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true });

    vi.stubGlobal('fetch', fetchMock);

    const reachable = await isAuthServiceReachable(1000);

    expect(reachable).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });
});

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineServicesEnabled = true;
  });

  it('rejects empty email', async () => {
    const result = await requestPasswordReset('   ');
    expect(result.error).toBe('Please enter your email first.');
    expect(mockedSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('trims email before sending reset request', async () => {
    mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordReset('  reset@example.com  ');

    expect(result.error).toBeNull();
    expect(mockedSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('reset@example.com');
  });

  it('normalizes network failures', async () => {
    mockedSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: { message: 'Network request failed' },
    });

    const result = await requestPasswordReset('reset@example.com');

    expect(result.error).toBe(
      'Network error contacting the sign-in service. Please check your connection and try again.'
    );
  });
});

describe('feature flag disabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onlineServicesEnabled = false;
  });

  it('short-circuits sign-in without touching Supabase', async () => {
    const result = await signIn('user@example.com', 'password123');

    expect(result.error).toBe(
      'Online accounts are currently disabled. The full game is available without signing in.'
    );
    expect(mockedSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('short-circuits sign-up without touching Supabase', async () => {
    const result = await signUp('new@example.com', 'password123', 'Player');

    expect(result.error).toBe(
      'Online accounts are currently disabled. The full game is available without signing in.'
    );
    expect(mockedSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('returns null for cached session user when services are disabled', async () => {
    const sessionUser = await getSessionUser();

    expect(sessionUser).toBeNull();
    expect(mockedSupabase.auth.getSession).not.toHaveBeenCalled();
  });

  it('returns false for auth reachability when services are disabled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const reachable = await isAuthServiceReachable(1000);

    expect(reachable).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
