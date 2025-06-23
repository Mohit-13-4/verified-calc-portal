import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractCard from '../components/ContractCard';
import { contractAPI } from '../services/contractAPI';
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  Package
} from 'lucide-react';

interface Contract {
  id: string;
  vendor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  projectName: string;
  totalAmount: number;
  startDate: string;
  description: string;
  status: 'draft' | 'submitted' | 'l1_review' | 'l2_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    deliveredQuantity: number;
    unitPrice: number;
  }>;
  submissions: Array<{
    statusNotes?: string;
    approvalHistory: Array<{
      approverLevel: 1 | 2 | 3;
      action: string;
      notes?: string;
      actionDate: string;
      changedFields?: Record<string, { before: any; after: any }>;
    }>;
  }>;
}

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user role from auth context (mock for now)
  const userRole = 'level1' as 'level1' | 'level2' | 'level3';

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractAPI.getContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load contracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (contractId: string, newStatus: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: newStatus as any }
          : contract
      )
    );
    // Reload contracts to get updated data
    loadContracts();
  };

  const getFilteredContracts = (filter: string) => {
    switch (filter) {
      case 'pending':
        return contracts.filter(contract => contract.status === 'submitted');
      case 'reviewing':
        return contracts.filter(contract => ['l1_review', 'l2_review'].includes(contract.status));
      case 'approved':
        return contracts.filter(contract => contract.status === 'approved');
      case 'all':
      default:
        return contracts;
    }
  };

  const getDashboardStats = () => {
    const pending = contracts.filter(c => c.status === 'submitted').length;
    const completed = contracts.filter(c => c.status === 'approved').length;
    const totalActive = contracts.filter(c => !['approved', 'rejected'].includes(c.status)).length;
    const totalValue = contracts
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.totalAmount, 0);

    return { pending, completed, totalActive, totalValue };
  };

  const stats = getDashboardStats();

  if (loading) {
    return (
      <Layout title="Contract Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
            <p className="mt-2 text-gray-600">Loading contracts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Contract Management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Management Dashboard</h2>
          <p className="text-gray-600">Multi-level approval system for vendor contracts and deliveries</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({getFilteredContracts('pending').length})</TabsTrigger>
            <TabsTrigger value="reviewing">In Review ({getFilteredContracts('reviewing').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({getFilteredContracts('approved').length})</TabsTrigger>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {getFilteredContracts('pending').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Contracts</h3>
                  <p className="text-gray-600">All contracts have been reviewed or are in progress.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredContracts('pending').map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  userRole={userRole}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </TabsContent>

          {/* In Review Tab */}
          <TabsContent value="reviewing" className="space-y-4">
            {getFilteredContracts('reviewing').map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4">
            {getFilteredContracts('approved').map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>

          {/* All Contracts Tab */}
          <TabsContent value="all" className="space-y-4">
            {getFilteredContracts('all').map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
