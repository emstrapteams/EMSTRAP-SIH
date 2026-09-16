import React, { useState } from 'react';
import { useDisaster } from '../../context/DisasterContext';

export const Login: React.FC = () => {
  const { login, authLoading, authError } = useDisaster();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!identifier || !password) {
      setLocalError('Team Code and Password are required.');
      return;
    }
    await login(identifier.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-2">Rescue Team Login</h2>
        <p className="text-sm text-slate-600 mb-4">Enter your Team Code and Password to access the Rescue dashboard.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Team Code</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full border border-slate-200 rounded px-3 py-2 text-sm"
              placeholder="e.g. RESCUE-001"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-slate-200 rounded px-3 py-2 text-sm"
              placeholder="Your password"
            />
          </div>

          {(localError || authError) && (
            <div className="text-sm text-red-600">{localError || authError}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold disabled:opacity-50"
              disabled={authLoading}
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
