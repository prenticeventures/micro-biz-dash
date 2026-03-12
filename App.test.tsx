import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import {
  getSessionUser,
  getUserProfileById,
  isAuthServiceReachable,
} from './src/services/authService';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from './src/types/database';
import {
  completeGameSession,
  loadGameState,
  saveGameState,
  startNewGame
} from './src/services/gameStateService';
import {
  getLeaderboard,
  subscribeToLeaderboard,
  updateUserStats
} from './src/services/statsService';

vi.mock('./components/GameCanvas', () => ({
  default: ({
    status,
    level,
    setStatus,
    touchLeftPressed = false,
    touchRightPressed = false,
    touchJumpPressed = false
  }: {
    status: string;
    level: number;
    setStatus: (status: string) => void;
    touchLeftPressed?: boolean;
    touchRightPressed?: boolean;
    touchJumpPressed?: boolean;
  }) => (
    <div>
      <div data-testid="game-canvas-state">
        {JSON.stringify({ status, level, touchLeftPressed, touchRightPressed, touchJumpPressed })}
      </div>
      <button onClick={() => setStatus('LEVEL_COMPLETE')}>Mock Complete Level</button>
    </div>
  ),
}));

vi.mock('./components/VictoryCelebration', () => ({
  default: () => <div>Victory</div>,
}));

vi.mock('./src/components/AuthScreen', () => ({
  AuthScreen: ({ onAuthenticated }: { onAuthenticated: (user: { id: string; game_name: string }) => void }) => (
    <button onClick={() => onAuthenticated({ id: 'user-1', game_name: 'Tester' })}>
      Mock Login
    </button>
  ),
}));

vi.mock('./src/services/authService', () => ({
  buildProfileFromSessionUser: (user: User) => ({
    id: user.id,
    email: user.email ?? '',
    game_name: user.user_metadata?.game_name ?? 'Player',
    created_at: user.created_at ?? new Date(0).toISOString(),
    updated_at: user.updated_at ?? user.created_at ?? new Date(0).toISOString(),
  }),
  getSessionUser: vi.fn(),
  getUserProfileById: vi.fn(),
  isAuthServiceReachable: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('./src/services/gameStateService', () => ({
  saveGameState: vi.fn(),
  loadGameState: vi.fn(),
  startNewGame: vi.fn(),
  completeGameSession: vi.fn(),
}));

vi.mock('./src/services/statsService', () => ({
  updateUserStats: vi.fn(),
  getLeaderboard: vi.fn(),
  subscribeToLeaderboard: vi.fn(),
}));

vi.mock('./src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  hasPersistedSupabaseSession: vi.fn(() => false),
}));

vi.mock('./utils/retroAudio', () => ({
  RetroAudio: class {
    init() {}
    stopBGM() {}
    startBGM() {}
    playWin() {}
    playDamage() {}
    playJump() {}
    playCollect() {}
    toggleMute() {}
  },
}));

const mockGetSessionUser = vi.mocked(getSessionUser);
const mockGetUserProfileById = vi.mocked(getUserProfileById);
const mockIsAuthServiceReachable = vi.mocked(isAuthServiceReachable);
const mockLoadGameState = vi.mocked(loadGameState);
const mockSaveGameState = vi.mocked(saveGameState);
const mockStartNewGame = vi.mocked(startNewGame);
const mockCompleteGameSession = vi.mocked(completeGameSession);
const mockUpdateUserStats = vi.mocked(updateUserStats);
const mockGetLeaderboard = vi.mocked(getLeaderboard);
const mockSubscribeToLeaderboard = vi.mocked(subscribeToLeaderboard);

describe('App guest auth continuation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSessionUser.mockResolvedValue(null);
    mockGetUserProfileById.mockResolvedValue(null);
    mockIsAuthServiceReachable.mockResolvedValue(true);
    mockLoadGameState.mockResolvedValue(null);
    mockSaveGameState.mockResolvedValue({ data: null, error: null } as any);
    mockStartNewGame.mockResolvedValue({ data: null, error: null } as any);
    mockCompleteGameSession.mockResolvedValue({ error: null });
    mockUpdateUserStats.mockResolvedValue({ data: null, error: null } as any);
    mockGetLeaderboard.mockResolvedValue([]);
    mockSubscribeToLeaderboard.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps touch controls active after guest login advances into level 2', async () => {
    const user = userEvent.setup();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'
    });
    Object.defineProperty(navigator, 'vendor', { configurable: true, value: 'Apple Computer, Inc.' });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /play level 1 free/i }));
    await user.click(screen.getByRole('button', { name: /mock complete level/i }));
    await user.click(await screen.findByRole('button', { name: /next level/i }));
    await user.click(await screen.findByRole('button', { name: /mock login/i }));

    await waitFor(() => {
      expect(screen.getByText(/lvl 2/i)).toBeInTheDocument();
      expect(screen.getByTestId('game-canvas-state')).toHaveTextContent('"status":"PLAYING"');
    });

    fireEvent.pointerDown(screen.getByRole('button', { name: /move right/i }), { pointerId: 1 });

    await waitFor(() => {
      expect(screen.getByTestId('game-canvas-state')).toHaveTextContent('"touchRightPressed":true');
    });
  });

  it('keeps the menu interactive while auth bootstrap stalls', async () => {
    vi.useFakeTimers();
    mockGetSessionUser.mockImplementation(
      () => new Promise<User | null>(() => undefined)
    );

    render(<App />);

    expect(screen.getByRole('button', { name: /play level 1 free/i })).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(4500);
      await Promise.resolve();
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play level 1 free/i })).toBeInTheDocument();
    });

    expect(
      screen.getByText(/online services took too long to respond/i)
    ).toBeInTheDocument();
  });

  it('continues to level 2 without login when the sign-in service is unavailable', async () => {
    const user = userEvent.setup();
    mockIsAuthServiceReachable.mockResolvedValue(false);

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /play level 1 free/i }));
    await user.click(screen.getByRole('button', { name: /mock complete level/i }));
    await user.click(await screen.findByRole('button', { name: /next level/i }));

    await waitFor(() => {
      expect(screen.getByText(/lvl 2/i)).toBeInTheDocument();
      expect(screen.getByTestId('game-canvas-state')).toHaveTextContent('"status":"PLAYING"');
    });

    expect(screen.queryByRole('button', { name: /mock login/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/sign-in is temporarily unavailable\. continuing without account save\./i)
    ).toBeInTheDocument();
  });
});
