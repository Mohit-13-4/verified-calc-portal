
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign,
  Building
} from 'lucide-react';
import SubmissionDropdown from '../components/SubmissionDropdown';
import { formatINR } from '../utils/currency';
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  trackingNumber: string;
  vendor: string;
  vendorName: string;
  projectName: string;
  submissionDate: string;
  submittedAt: string;
  status: 'pending' | 'l1_reviewed' | 'l2_reviewed' | 'approved' | 'rejected';
  totalAmount: number;
  completionPercentage: number;
  description: string;
  formula: string;
  values: Record<string, number>;
  originalValues?: Record<string, number>;
  l1EditedValues?: Record<string, number>;
  l2EditedValues?: Record<string, number>;
  result: number;
  erpReady: boolean;
  l1Comment?: string;
  l2Comment?: string;
  rejectionComment?: string;
}

const mockSubmissions: Submission[] = [
  {
    id: '1',
    trackingNumber: 'CALC-001',
    vendor: 'ABC Construction Ltd',
    vendorName: 'ABC Construction Ltd',
    projectName: 'Highway Construction Phase 1',
    submissionDate: '2025-01-05',
    submittedAt: '2025-01-05',
    status: 'approved',
    totalAmount: 2500000,
    completionPercentage: 100,
    description: 'Complete material cost analysis for Q4 construction work',
    formula: 'Material Cost + Labor + Overhead',
    values: { Block1: 10.5, Block2: 8.2, Block3: 6.0 },
    originalValues: { Block1: 10.0, Block2: 8.0, Block3: 6.0 },
    l1EditedValues: { Block1: 10.2, Block2: 8.1, Block3: 6.0 },
    l2EditedValues: { Block1: 10.5, Block2: 8.2, Block3: 6.0 },
    result: 2500000,
    erpReady: true,
    l1Comment: 'Adjusted Block1 and Block2 values based on site verification',
    l2Comment: 'Further refined values after quality assessment'
  },
  {
    id: '2',
    trackingNumber: 'CALC-002',
    vendor: 'XYZ Builders',
    vendorName: 'XYZ Builders',
    projectName: 'Bridge Foundation Work',
    submissionDate: '2025-01-04',
    submittedAt: '2025-01-04',
    status: 'l2_reviewed',
    totalAmount: 1800000,
    completionPercentage: 85,
    description: 'Foundation concrete and steel reinforcement calculations',
    formula: 'Concrete Volume × Rate + Steel Weight × Rate',
    values: { ConcreteVolume: 450, SteelWeight: 12.5 },
    originalValues: { ConcreteVolume: 420, SteelWeight: 12.0 },
    l1EditedValues: { ConcreteVolume: 435, SteelWeight: 12.2 },
    l2EditedValues: { ConcreteVolume: 450, SteelWeight: 12.5 },
    result: 1800000,
    erpReady: false,
    l1Comment: 'Updated quantities based on latest measurements',
    l2Comment: 'Final validation completed, ready for L3 approval'
  },
  {
    id: '3',
    trackingNumber: 'CALC-003',
    vendor: 'PQR Infra',
    vendorName: 'PQR Infra',
    projectName: 'Residential Complex - Block A',
    submissionDate: '2025-01-03',
    submittedAt: '2025-01-03',
    status: 'l1_reviewed',
    totalAmount: 3200000,
    completionPercentage: 60,
    description: 'Residential building construction cost estimation',
    formula: 'Built-up Area × Rate per sq.ft',
    values: { BuiltUpArea: 8000, RatePerSqFt: 400 },
    originalValues: { BuiltUpArea: 7800, RatePerSqFt: 380 },
    l1EditedValues: { BuiltUpArea: 8000, RatePerSqFt: 400 },
    result: 3200000,
    erpReady: false,
    l1Comment: 'Corrected area calculation and updated rate as per latest schedule'
  },
  {
    id: '4',
    trackingNumber: 'CALC-004',
    vendor: 'LMN Projects',
    vendorName: 'LMN Projects',
    projectName: 'Water Treatment Plant',
    submissionDate: '2025-01-02',
    submittedAt: '2025-01-02',
    status: 'pending',
    totalAmount: 4500000,
    completionPercentage: 40,
    description: 'Water treatment facility construction and equipment installation',
    formula: 'Equipment Cost + Installation + Civil Work',
    values: { Equipment: 2800000, Installation: 900000, CivilWork: 800000 },
    result: 4500000,
    erpReady: false
  }
];

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  const pendingSubmissions = submissions.filter(s => s.status !== 'approved' && s.status !== 'rejected');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');

  const handleToggleSubmission = (submissionId: string) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
  };

  const handleEditValues = (submissionId: string, updatedValues: Record<string, number>, comment: string) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        const updated = { ...submission };
        
        // Store original values if not already stored
        if (!updated.originalValues) {
          updated.originalValues = { ...submission.values };
        }
        
        // Update values based on user role
        if (user?.role === 'level1') {
          updated.l1EditedValues = updatedValues;
          updated.l1Comment = comment;
          updated.values = updatedValues;
          updated.status = 'l1_reviewed';
        } else if (user?.role === 'level2') {
          updated.l2EditedValues = updatedValues;
          updated.l2Comment = comment;
          updated.values = updatedValues;
          updated.status = 'l2_reviewed';
        } else if (user?.role === 'level3') {
          updated.values = updatedValues;
          updated.status = 'approved';
        }
        
        return updated;
      }
      return submission;
    }));

    toast({
      title: "Values Updated",
      description: `Submission ${submissionId} has been updated successfully.`
    });
  };

  const handleApprove = (submissionId: string, comment: string) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        const updated = { ...submission };
        
        if (user?.role === 'level1') {
          updated.status = 'l1_reviewed';
          updated.l1Comment = comment;
        } else if (user?.role === 'level2') {
          updated.status = 'l2_reviewed';
          updated.l2Comment = comment;
        } else if (user?.role === 'level3') {
          updated.status = 'approved';
        }
        
        return updated;
      }
      return submission;
    }));

    toast({
      title: "Submission Approved",
      description: `Submission ${submissionId} has been approved.`
    });
  };

  const handleReject = (submissionId: string, comment: string) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          status: 'rejected' as const,
          rejectionComment: comment
        };
      }
      return submission;
    }));

    toast({
      title: "Submission Rejected",
      description: `Submission ${submissionId} has been rejected.`,
      variant: "destructive"
    });
  };

  const getRoleTitle = (role: string) => {
    const roleMap = {
      level1: 'Level 1 Reviewer',
      level2: 'Level 2 Validator',
      level3: 'Level 3 Approver'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getFinalAmount = (submission: Submission) => {
    // Always show the amount from the highest approval level available
    if (submission.l2EditedValues) {
      return Object.values(submission.l2EditedValues).reduce((sum, val) => sum + val, 0);
    }
    if (submission.l1EditedValues) {
      return Object.values(submission.l1EditedValues).reduce((sum, val) => sum + val, 0);
    }
    return submission.result || 0;
  };

  const totalValue = submissions.reduce((sum, s) => sum + getFinalAmount(s), 0);
  const approvedValue = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + getFinalAmount(s), 0);
  const pendingValue = submissions.filter(s => s.status !== 'approved' && s.status !== 'rejected').reduce((sum, s) => sum + getFinalAmount(s), 0);

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
                        <SubmissionDropdown
                          key={submission.id}
                          submission={submission}
                          isExpanded={expandedSubmission === submission.id}
                          onToggle={() => handleToggleSubmission(submission.id)}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onEditValues={handleEditValues}
                        />
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
                        <SubmissionDropdown
                          key={submission.id}
                          submission={submission}
                          isExpanded={expandedSubmission === submission.id}
                          onToggle={() => handleToggleSubmission(submission.id)}
                        />
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
                        <SubmissionDropdown
                          key={submission.id}
                          submission={submission}
                          isExpanded={expandedSubmission === submission.id}
                          onToggle={() => handleToggleSubmission(submission.id)}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onEditValues={handleEditValues}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
