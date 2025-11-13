import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (email: string) => Promise<void>;
  onSignUp: (name: string, email: string) => Promise<void>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginView) {
        await onLogin(email);
      } else {
        await onSignUp(name, email);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-white">{isLoginView ? 'Giriş Yap' : 'Kayıt Ol'}</h1>
        <p className="text-center text-slate-400">Team Sync Hub'a hoş geldiniz</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginView && (
            <div>
              <label htmlFor="name" className="text-sm font-medium text-slate-300">İsim Soyisim</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ali Veli"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300">E-posta Adresi</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="ali@buteo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {loading ? (isLoginView ? 'Giriş Yapılıyor...' : 'Kayıt Olunuyor...') : (isLoginView ? 'Giriş Yap' : 'Kayıt Ol')}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-slate-400">
          {isLoginView ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}{' '}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-medium text-sky-400 hover:underline">
            {isLoginView ? 'Kayıt Olun' : 'Giriş Yapın'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
