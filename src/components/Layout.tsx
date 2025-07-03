
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, Building } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      vendor: { label: 'Vendor', color: 'bg-green-100 text-green-800' },
      level1: { label: 'Level 1 Reviewer', color: 'bg-blue-100 text-blue-800' },
      level2: { label: 'Level 2 Validator', color: 'bg-purple-100 text-purple-800' },
      level3: { label: 'Level 3 Approver', color: 'bg-orange-100 text-orange-800' },
      admin: { label: 'Administrator', color: 'bg-red-100 text-red-800' }
    };
    return roleMap[role as keyof typeof roleMap] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  const roleInfo = getRoleDisplay(user?.role || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                ERP Ready
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>
                <Badge className={roleInfo.color}>
                  {roleInfo.label}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ERP Integration Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="opacity-50"
              >
                <Building className="h-4 w-4 mr-2" />
                ERP Connect
              </Button>
              <span className="text-xs text-gray-500">
                ERP integration ready - Contact admin to enable
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              System v1.0 | ERP-Ready Architecture
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};
