import React, { useState, useEffect } from 'react';

interface LoginProps {
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, password: string) => Promise<any>;
  onEmailSignUp: (email: string, password: string) => Promise<any>;
  navigate: (path: string) => void;
  initialView: 'login' | 'signup';
}

const Login: React.FC<LoginProps> = ({ onGoogleLogin, onEmailLogin, onEmailSignUp, navigate, initialView }) => {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLoginView(initialView === 'login');
    setError(null); // Clear errors when switching views
  }, [initialView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLoginView) {
        await onEmailLogin(email, password);
      } else {
        await onEmailSignUp(email, password);
      }
      // On success, the App component will handle redirection
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-4xl mx-4 bg-white dark:bg-gray-900/50 rounded-xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Panel: Branding */}
        <div className="p-8 md:p-12 bg-gray-800 text-white hidden md:flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-brand-600 mb-4">Synapse</h1>
          <p className="text-lg text-gray-300 mb-6">Your Personal YouTube Soundscape</p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="material-symbols-outlined text-brand-500 mr-3">podcasts</span>
              <span>Audio-only streaming</span>
            </li>
            <li className="flex items-center">
              <span className="material-symbols-outlined text-brand-500 mr-3">queue_music</span>
              <span>Create custom playlists</span>
            </li>
            <li className="flex items-center">
              <span className="material-symbols-outlined text-brand-500 mr-3">link</span>
              <span>Optionally connect YouTube</span>
            </li>
          </ul>
        </div>

        {/* Right Panel: Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-brand-600">
              {isLoginView ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isLoginView ? 'Sign in to continue' : 'Get started with Synapse'}
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:​border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:​text-gray-200 bg-transparent focus:​outline-none focus:​ring-2 focus:​ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 disabled:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => navigate(isLoginView ? '/auth/signup' : '/auth/login')}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <button
            onClick={onGoogleLogin}
            className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <svg className="w-5 h-5" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" ></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" ></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" ></path><path fill="none" d="M1 1h22v22H1z"></path>
            </svg>
            <span className="ml-3 font-semibold">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;