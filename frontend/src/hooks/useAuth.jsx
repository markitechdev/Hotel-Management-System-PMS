import { createContext, useContext, useState } from 'react';

// Credentials required by the assignment brief. They are checked in the browser only;
// the room data itself lives in the Laravel API and its database.
const ADMIN_USERNAME = 'pms_admin';
const ADMIN_PASSWORD = 'hotelpms2026';

// Only the signed-in flag is kept in sessionStorage, so a page refresh keeps you signed in
// and closing the browser signs you out. Room records are never stored in the browser.
const SESSION_KEY = 'pms.signedInAs';

const AuthContext = createContext(null);

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  function signIn(username, password) {
    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return false;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, ADMIN_USERNAME);
    } catch {
      // Storage can be blocked (private mode); the session then lasts until refresh.
    }
    setUser(ADMIN_USERNAME);
    return true;
  }

  function signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing stored, nothing to remove.
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
