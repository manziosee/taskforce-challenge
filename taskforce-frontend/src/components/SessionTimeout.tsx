import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function SessionTimeout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let inactivityTimer: number; // Use `number` instead of `NodeJS.Timeout`

    const resetTimer = () => {
      clearTimeout(inactivityTimer); // Clear the previous timer
      inactivityTimer = window.setTimeout(() => { // Use `window.setTimeout` for browser environment
        logout();
        navigate('/login');
      }, SESSION_TIMEOUT);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [logout, navigate]);

  return null; // This component doesn't render anything
}