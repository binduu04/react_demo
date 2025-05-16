import { useState } from 'react';
import { useAuth } from './AuthContext';

export function LoginForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }

      if (result.success) {
        setEmail('');
        setPassword('');
        if (onClose) onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button 
          className="btn btn-large"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      
      <p className="auth-toggle">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          className="text-button"
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLoading}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export function UserMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setShowMenu(false);
  };

  return (
    <div className="user-auth">
      {user ? (
        <div className="user-profile">
          <button 
            className="profile-button" 
            onClick={() => setShowMenu(!showMenu)}
          >
            {user.email?.charAt(0).toUpperCase() || '👤'}
          </button>
          
          {showMenu && (
            <div className="dropdown-menu">
              <p className="user-email">{user.email}</p>
              <button 
                className="dropdown-item" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button 
            className="btn btn-large btn-open"
            onClick={() => setShowAuthForm(true)}
          >
            Login
          </button>
          
          {showAuthForm && (
            <div className="modal">
              <div className="modal-content">
                <button 
                  className="close-button"
                  onClick={() => setShowAuthForm(false)}
                >
                  &times;
                </button>
                <LoginForm onClose={() => setShowAuthForm(false)} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}