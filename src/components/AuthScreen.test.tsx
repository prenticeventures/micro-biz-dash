import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from './AuthScreen';
import {
  getCurrentUser,
  requestPasswordReset,
  signIn,
  signUp,
} from '../services/authService';

vi.mock('../services/authService', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  getCurrentUser: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockSignIn = vi.mocked(signIn);
const mockSignUp = vi.mocked(signUp);
const mockRequestPasswordReset = vi.mocked(requestPasswordReset);

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(null);
    mockRequestPasswordReset.mockResolvedValue({ error: null });
  });

  it('shows forgot password in login mode', async () => {
    render(<AuthScreen onAuthenticated={vi.fn()} embedded />);
    expect(await screen.findByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('hides forgot password in sign-up mode', async () => {
    render(<AuthScreen onAuthenticated={vi.fn()} embedded />);

    await userEvent.click(screen.getByRole('button', { name: /don't have an account\? sign up/i }));

    expect(screen.queryByRole('button', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('shows a clear error when forgot password is clicked without email', async () => {
    render(<AuthScreen onAuthenticated={vi.fn()} embedded />);

    await userEvent.click(await screen.findByRole('button', { name: /forgot password/i }));

    expect(
      screen.getByText(/enter your email above, then tap forgot password\./i)
    ).toBeInTheDocument();
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it('sends password reset email with trimmed email', async () => {
    render(<AuthScreen onAuthenticated={vi.fn()} embedded />);

    await userEvent.type(screen.getByPlaceholderText(/your@email\.com/i), '  tester@example.com  ');
    await userEvent.click(screen.getByRole('button', { name: /forgot password/i }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('tester@example.com');
    });

    expect(
      screen.getByText(/password reset email sent/i)
    ).toBeInTheDocument();
  });
});
