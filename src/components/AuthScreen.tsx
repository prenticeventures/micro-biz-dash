/**
 * Authentication Screen Component
 * 
 * Handles user login and registration before they can play the game.
 */

import { useState, useEffect } from 'react';
import { signIn, signUp, getCurrentUser } from '../services/authService';
import type { UserProfile } from '../types/database';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        onAuthenticated(user);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else if (result.user) {
          onAuthenticated(result.user);
        }
      } else {
        // Sign up
        if (!gameName.trim()) {
          setError('Please enter a game name');
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, gameName.trim());
        if (result.error) {
          setError(result.error);
        } else if ((result as { needsEmailConfirmation?: boolean }).needsEmailConfirmation) {
          setError('');
          setLoading(false);
          setSuccess('Nice! Confirmation email sent (may take a few minutes). Check your inbox and spam, click the link, then log back in to play!');
          return;
        } else if (result.user) {
          onAuthenticated(result.user);
        }
      }
      } catch (err: any) {
        // Make error messages more user-friendly
        let errorMessage = err.message || 'An error occurred';
        
        if (errorMessage.includes('rate limit')) {
          errorMessage = 'Too many signup attempts. Please wait a minute and try again, or use a different email address.';
        } else if (errorMessage.includes('already registered')) {
          errorMessage = 'This email is already registered. Try logging in instead.';
        } else if (errorMessage.includes('invalid')) {
          errorMessage = 'Invalid email or password. Please check your input.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 sm:p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl sm:text-3xl text-yellow-400 mb-6 text-center font-['Press_Start_2P']">
          {isLogin ? 'LOGIN' : 'SIGN UP'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Game Name
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Your display name"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                required={!isLogin}
                maxLength={20}
              />
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {success && (
            <div className="bg-green-900/50 border border-green-600 text-green-200 px-4 py-2 rounded text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded border-b-4 border-yellow-700 active:border-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
