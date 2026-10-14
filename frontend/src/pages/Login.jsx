import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Sign in');
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/rooms" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError('Enter both your username and password.');
      return;
    }

    if (signIn(username, password)) {
      navigate('/rooms', { replace: true });
      return;
    }

    setError('That username and password combination is not recognised. Check both and try again.');
    setPassword('');
    passwordRef.current?.focus();
  }

  return (
    <div className="login">
      <section className="login__desk" aria-hidden="true">
        <p className="login__product">Front Desk PMS</p>
        <div className="login__rack">
          <span className="login__peg" />
          <span className="room-tag room-tag--display">
            <span className="room-tag__hole" />
            <span className="room-tag__number">Office</span>
          </span>
        </div>
        <p className="login__caption">Room inventory for the front office team.</p>
      </section>

      <section className="login__panel">
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <h1 className="login__title">Staff sign-in</h1>
          <p className="login__intro">Sign in with the administrator account to manage the room inventory.</p>

          <div className="field">
            <label htmlFor="username" className="field__label">
              Username
            </label>
            <input
              id="username"
              className="field__input"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field__label">
              Password
            </label>
            <input
              id="password"
              ref={passwordRef}
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div className="login__error-slot" aria-live="assertive">
            {error && (
              <p id="login-error" className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <button type="submit" className="button button--primary button--block">
            Sign in
          </button>
        </form>
      </section>
    </div>
  );
}
