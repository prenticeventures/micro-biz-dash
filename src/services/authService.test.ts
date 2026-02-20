import { requestPasswordReset, signIn, signUp } from './authService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
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

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
