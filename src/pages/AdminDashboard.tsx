
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Activity,
  Building,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

// Mock data for admin dashboard
const systemStats = {
  totalUsers: 25,
  activeCalculations: 12,
  completedCalculations: 143,
  erpReadyItems: 89
};

const mockUsers = [
  { id: '1', name: 'John Vendor', email: 'vendor@company.com', role: 'vendor', status: 'active', lastLogin: '2024-01-20' },
  { id: '2', name: 'Alice Reviewer', email: 'level1@company.com', role: 'level1', status: 'active', lastLogin: '2024-01-20' },
  { id: '3', name: 'Bob Validator', email: 'level2@company.com', role: 'level2', status: 'active', lastLogin: '2024-01-19' },
  { id: '4', name: 'Carol Approver', email: 'level3@company.com', role: 'level3', status: 'active', lastLogin: '2024-01-20' },
];

const mockFormulas = [
  { id: '1', name: 'Material Cost Analysis', formula: 'Material Cost + Labor + Overhead', usage: 45, status: 'active' },
  { id: '2', name: 'Project Budget Estimation', formula: '(Direct Costs × Markup) + Fixed Costs', usage: 32, status: 'active' },
  { id: '3', name: 'Revenue Projection', formula: 'Base Revenue × Growth Factor + Additional', usage: 28, status: 'active' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getRoleBadge = (role: string) => {
    const roleMap = {
      vendor: { label: 'Vendor', className: 'bg-green-100 text-green-800' },
      level1: { label: 'Level 1', className: 'bg-blue-100 text-blue-800' },
      level2: { label: 'Level 2', className: 'bg-purple-100 text-purple-800' },
      level3: { label: 'Level 3', className: 'bg-orange-100 text-orange-800' },
      admin: { label: 'Admin', className: 'bg-red-100 text-red-800' }
    };
    
    const config = roleMap[role as keyof typeof roleMap];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Administration</h2>
          <p className="text-gray-600">Manage users, formulas, and system settings</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Calculations</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.activeCalculations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.completedCalculations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ERP Ready</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.erpReadyItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="formulas">Formula Management</TabsTrigger>
            <TabsTrigger value="erp">ERP Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Response Time</span>
                    <span className="text-sm font-medium">< 200ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Sessions</span>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ERP Integration</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Staged</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Recent Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <div className="text-sm font-medium text-yellow-800">
                        ERP Connection Pending
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        89 calculations are flagged for ERP sync
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="text-sm font-medium text-blue-800">
                        New Formula Request
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        Vendor ABC requested custom formula approval
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                      <div className="text-sm font-medium text-green-800">
                        System Backup Complete
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Daily backup completed successfully at 2:00 AM
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage system users and their roles</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">Last login: {user.lastLogin}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getRoleBadge(user.role)}
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formula Management Tab */}
          <TabsContent value="formulas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Formula Management</CardTitle>
                    <CardDescription>Configure and manage calculation formulas</CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Formula
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFormulas.map((formula) => (
                    <div key={formula.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{formula.name}</div>
                        <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded mt-2">
                          {formula.formula}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Used in {formula.usage} calculations
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={formula.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {formula.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ERP Settings Tab */}
          <TabsContent value="erp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>ERP Integration Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure ERP system integration (Currently in staging mode)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ERP Integration Status:</strong> System is ERP-ready with {systemStats.erpReadyItems} items flagged for synchronization. 
                    All ERP functionality is currently staged and inactive.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="erp-endpoint">ERP API Endpoint</Label>
                      <Input 
                        id="erp-endpoint" 
                        placeholder="https://your-erp-system.com/api"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="erp-key">API Key</Label>
                      <Input 
                        id="erp-key" 
                        type="password"
                        placeholder="Enter ERP API key"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                      <Input 
                        id="sync-interval" 
                        type="number"
                        defaultValue="15"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ERP-Ready Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Approved Calculations:</span>
                          <span className="text-sm font-medium">{systemStats.erpReadyItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending Sync:</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Sync Attempt:</span>
                          <span className="text-sm font-medium">Never</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Future Integration Features</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Automatic data synchronization</li>
                        <li>• Real-time status updates</li>
                        <li>• Bidirectional data flow</li>
                        <li>• Custom field mapping</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button disabled className="opacity-50">
                    <Database className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button disabled className="opacity-50">
                    <Building className="h-4 w-4 mr-2" />
                    Enable ERP Sync
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View ERP Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
