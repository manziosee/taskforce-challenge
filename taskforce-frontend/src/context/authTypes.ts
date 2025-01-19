export interface AuthContextType {
    user: { id: string; name: string; email: string } | null;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (userData: { name: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>;
  }