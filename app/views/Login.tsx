import React, { useState } from 'react';

interface LoginProps {
  onLoginWithGoogle: () => void;
  onSignInWithEmail: (email: string, password: string) => Promise<any>;
  onSignUpWithEmail: (email: string, password: string) => Promise<any>;
}

const Login: React.FC<LoginProps> = ({ onLoginWithGoogle, onSignInWithEmail, onSignUpWithEmail }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await onSignUpWithEmail(email, password);
      } else {
        await onSignInWithEmail(email, password);
      }
      // onAuthStateChanged in App.tsx will handle the rest
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-900/50 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-500">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isRegistering ? 'Join the ultimate music experience.' : 'Sign in to continue.'}
          </p>
        </div>

        {error && <p className="text-sm text-center text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-200 bg-transparent focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div>
          <button
            onClick={onLoginWithGoogle}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            <svg className="w-5 h-5" aria-hidden="true" focusable="false" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.1-64.4-42.3-104.5-42.3-84.3 0-152.3 68.2-152.3 152.5s68 152.5 152.3 152.5c97.7 0 134.5-67.5 140.8-103.9H248v-95.2h239.1c1.3 12.8 2.2 26.2 2.9 40.2z"></path>
            </svg>
            <span className="ml-3">Sign in with Google</span>
          </button>
        </div>

        <div className="text-sm text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;