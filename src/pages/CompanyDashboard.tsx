
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionCard from '../components/SubmissionCard';
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';

// Mock data for company dashboard
const dashboardStats = {
  pendingReviews: 8,
  completedToday: 12,
  totalActive: 25,
  erpReady: 89
};

// Mock submissions data
const mockSubmissions = [
  {
    id: 'SUB-001',
    vendor: 'ABC Manufacturing',
    formula: 'Material Cost Analysis',
    status: 'pending' as const,
    submittedAt: '2024-01-20 09:30',
    description: 'Quarterly material cost calculation for Project Alpha including raw materials, labor, and overhead costs.',
    values: { Block1: 15000, Block2: 8500, Block3: 2200 },
    result: 25700,
    erpReady: false
  },
  {
    id: 'SUB-002',
    vendor: 'XYZ Corp',
    formula: 'Project Budget Estimation',
    status: 'l1_reviewed' as const,
    submittedAt: '2024-01-20 08:15',
    description: 'Annual project budget estimation for infrastructure development with markup calculations.',
    values: { Block1: 85000, Block2: 12500, Block3: 3200 },
    result: 100700,
    erpReady: false
  },
  {
    id: 'SUB-003',
    vendor: 'TechSolutions Ltd',
    formula: 'Revenue Projection',
    status: 'l2_reviewed' as const,
    submittedAt: '2024-01-19 16:45',
    description: 'Q1 revenue projection based on growth factors and market analysis.',
    values: { Block1: 45000, Block2: 1.15, Block3: 5500 },
    result: 57250,
    erpReady: false
  },
  {
    id: 'SUB-004',
    vendor: 'Global Industries',
    formula: 'Material Cost Analysis',
    status: 'approved' as const,
    submittedAt: '2024-01-19 11:20',
    description: 'Monthly material cost analysis for production line optimization.',
    values: { Block1: 32000, Block2: 15600, Block3: 4200 },
    result: 51800,
    erpReady: true
  }
];

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const { toast } = useToast();

  // Get current user role from auth context (mock for now)
  const userRole = 'level1' as 'level1' | 'level2' | 'level3'; // This would come from authentication

  const handleStatusChange = (submissionId: string, newStatus: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: newStatus as any, erpReady: newStatus === 'approved' }
          : sub
      )
    );
  };

  const getFilteredSubmissions = (filter: string) => {
    switch (filter) {
      case 'pending':
        return submissions.filter(sub => sub.status === 'pending');
      case 'reviewing':
        return submissions.filter(sub => ['l1_reviewed', 'l2_reviewed'].includes(sub.status));
      case 'approved':
        return submissions.filter(sub => sub.status === 'approved');
      case 'all':
      default:
        return submissions;
    }
  };

  return (
    <Layout title="Company Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Dashboard</h2>
          <p className="text-gray-600">Multi-level verification system for vendor calculations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Active</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ERP Ready</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.erpReady}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({getFilteredSubmissions('pending').length})</TabsTrigger>
            <TabsTrigger value="reviewing">In Review ({getFilteredSubmissions('reviewing').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({getFilteredSubmissions('approved').length})</TabsTrigger>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {getFilteredSubmissions('pending').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Submissions</h3>
                  <p className="text-gray-600">All submissions have been reviewed or are in progress.</p>
                </CardContent>
              </Card>
            ) : (
              getFilteredSubmissions('pending').map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  userRole={userRole}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </TabsContent>

          {/* In Review Tab */}
          <TabsContent value="reviewing" className="space-y-4">
            {getFilteredSubmissions('reviewing').map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4">
            {getFilteredSubmissions('approved').map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                userRole={userRole}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>

          {/* All Submissions Tab */}
          <TabsContent value="all" className="space-y-4">
            {getFilteredSubmissions('all').map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
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
