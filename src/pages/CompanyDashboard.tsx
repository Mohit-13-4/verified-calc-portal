import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Building
} from 'lucide-react';
import SubmissionDetailsDialog from '../components/SubmissionDetailsDialog';
import { formatINR } from '../utils/currency';

interface Submission {
  id: string;
  trackingNumber: string;
  vendorName: string;
  projectName: string;
  submissionDate: string;
  status: 'submitted' | 'reviewed' | 'validated' | 'approved' | 'rejected';
  totalAmount: number;
  completionPercentage: number;
  description: string;
}

const mockSubmissions: Submission[] = [
  {
    id: '1',
    trackingNumber: 'CALC-001',
    vendorName: 'ABC Construction Ltd',
    projectName: 'Highway Construction Phase 1',
    submissionDate: '2025-01-05',
    status: 'approved',
    totalAmount: 2500000,
    completionPercentage: 100,
    description: 'Complete material cost analysis for Q4 construction work'
  },
  {
    id: '2',
    trackingNumber: 'CALC-002',
    vendorName: 'XYZ Builders',
    projectName: 'Bridge Foundation Work',
    submissionDate: '2025-01-04',
    status: 'validated',
    totalAmount: 1800000,
    completionPercentage: 85,
    description: 'Foundation concrete and steel reinforcement calculations'
  },
  {
    id: '3',
    trackingNumber: 'CALC-003',
    vendorName: 'PQR Infra',
    projectName: 'Residential Complex - Block A',
    submissionDate: '2025-01-03',
    status: 'reviewed',
    totalAmount: 3200000,
    completionPercentage: 60,
    description: 'Residential building construction cost estimation'
  },
  {
    id: '4',
    trackingNumber: 'CALC-004',
    vendorName: 'LMN Projects',
    projectName: 'Water Treatment Plant',
    submissionDate: '2025-01-02',
    status: 'submitted',
    totalAmount: 4500000,
    completionPercentage: 40,
    description: 'Water treatment facility construction and equipment installation'
  },
  {
    id: '5',
    trackingNumber: 'CALC-005',
    vendorName: 'RST Enterprises',
    projectName: 'Commercial Complex - Tower B',
    submissionDate: '2025-01-01',
    status: 'submitted',
    totalAmount: 5800000,
    completionPercentage: 25,
    description: 'Commercial building structural design and cost analysis'
  }
];

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedTab, setSelectedTab] = useState('pending');

  const submissions = mockSubmissions;

  const pendingSubmissions = submissions.filter(s => s.status !== 'approved' && s.status !== 'rejected');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-500', text: 'Submitted' },
      reviewed: { color: 'bg-yellow-500', text: 'Reviewed' },
      validated: { color: 'bg-purple-500', text: 'Validated' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80`}>
        {config.text}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'submitted': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleTitle = (role: string) => {
    const roleMap = {
      level1: 'Level 1 Reviewer',
      level2: 'Level 2 Validator',
      level3: 'Level 3 Approver'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const totalValue = submissions.reduce((sum, s) => sum + s.totalAmount, 0);
  const approvedValue = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingValue = submissions.filter(s => s.status !== 'approved' && s.status !== 'rejected').reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <Layout title={`${getRoleTitle(user?.role || '')} Dashboard`}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingSubmissions.length} pending review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                All submissions combined
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Value</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatINR(approvedValue)}</div>
              <p className="text-xs text-muted-foreground">
                {submissions.filter(s => s.status === 'approved').length} submissions approved
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatINR(pendingValue)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting {user?.role === 'level1' ? 'review' : user?.role === 'level2' ? 'validation' : 'approval'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
                <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Tracking #</th>
                        <th className="text-left p-4">Vendor</th>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Submitted</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSubmissions.map((submission) => (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(submission.status)}
                              <span className="font-medium">{submission.trackingNumber}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span>{submission.vendorName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{submission.projectName}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {submission.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{formatINR(submission.totalAmount)}</td>
                          <td className="p-4">{getStatusBadge(submission.status)}</td>
                          <td className="p-4 text-sm text-gray-500">{submission.submissionDate}</td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Review</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="approved" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Tracking #</th>
                        <th className="text-left p-4">Vendor</th>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Completion</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedSubmissions.map((submission) => (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(submission.status)}
                              <span className="font-medium">{submission.trackingNumber}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span>{submission.vendorName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{submission.projectName}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {submission.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{formatINR(submission.totalAmount)}</td>
                          <td className="p-4">{getStatusBadge(submission.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${submission.completionPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{submission.completionPercentage}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Tracking #</th>
                        <th className="text-left p-4">Vendor</th>
                        <th className="text-left p-4">Project</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Submitted</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(submission.status)}
                              <span className="font-medium">{submission.trackingNumber}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span>{submission.vendorName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{submission.projectName}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {submission.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{formatINR(submission.totalAmount)}</td>
                          <td className="p-4">{getStatusBadge(submission.status)}</td>
                          <td className="p-4 text-sm text-gray-500">{submission.submissionDate}</td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Submission Details Dialog */}
      {selectedSubmission && (
        <SubmissionDetailsDialog
          submission={selectedSubmission}
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </Layout>
  );
};

export default CompanyDashboard;
