import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle } from 'lucide-react';

// صفحة تسجيل الدخول - محسّنة للإتاحة
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('اليوزر أو الباسورد غلط');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="bg-ios-surface backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-ios-border">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-ios-primary/10 rounded-3xl">
            <Lock className="text-ios-primary" size={48} aria-hidden="true" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-ios-dark">أهلاً بيك</h1>
        <p className="text-ios-secondary text-center mb-8">ادخل عشان تتابع فلوسك</p>
        
        {error && (
          <div 
            className="bg-ios-error/10 text-ios-error p-4 rounded-2xl mb-6 text-sm text-center border border-ios-error/20 flex items-center gap-2 justify-center"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-ios-dark mb-2">
              اليوزر
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark placeholder-ios-secondary/50 transition-all"
              required
              autoComplete="username"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ios-dark mb-2">
              الباسورد
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark placeholder-ios-secondary/50 transition-all"
              required
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-ios-primary/20"
            aria-label="دخول التطبيق"
          >
            ادخل
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
