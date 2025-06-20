
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'vendor' | 'level1' | 'level2' | 'level3' | 'admin';
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User & { password: string }> = {
  'vendor@company.com': {
    id: '1',
    name: 'John Vendor',
    email: 'vendor@company.com',
    password: 'vendor123',
    role: 'vendor',
    company: 'ABC Suppliers'
  },
  'level1@company.com': {
    id: '2',
    name: 'Alice Reviewer',
    email: 'level1@company.com',
    password: 'level1123',
    role: 'level1'
  },
  'level2@company.com': {
    id: '3',
    name: 'Bob Validator',
    email: 'level2@company.com',
    password: 'level2123',
    role: 'level2'
  },
  'level3@company.com': {
    id: '4',
    name: 'Carol Approver',
    email: 'level3@company.com',
    password: 'level3123',
    role: 'level3'
  },
  'admin@company.com': {
    id: '5',
    name: 'David Admin',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
