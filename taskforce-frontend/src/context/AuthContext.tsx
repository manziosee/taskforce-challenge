import { createContext, useContext, useState, ReactNode } from 'react';
import { login as loginService, register as registerService, logout as logoutService, changePassword as changePasswordService } from '../services/authService';
import { AuthContextType } from './authTypes'; // Import the type

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  changePassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await loginService(credentials);
    setUser(data.user);
    localStorage.setItem('token', data.token);
   };

  const register = async (userData: { name: string; email: string; password: string }) => {
    await registerService(userData);
    
  };

  const logout = async () => {
    await logoutService();
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear user data
    setUser(null);
  };

  const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    await changePasswordService(passwordData);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}