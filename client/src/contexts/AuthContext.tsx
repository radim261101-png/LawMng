import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Users hardcoded in frontend
const USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    role: 'user' as const,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    // Find user in hardcoded list
    const foundUser = USERS.find(
      u => u.username === username && u.password === password
    );

    if (!foundUser) {
      throw new Error('بيانات الدخول غير صحيحة');
    }

    const userData: User = {
      id: foundUser.id,
      username: foundUser.username,
      role: foundUser.role,
    };

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
