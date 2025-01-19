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
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    const data = await registerService(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await logoutService();
    localStorage.removeItem('token');
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