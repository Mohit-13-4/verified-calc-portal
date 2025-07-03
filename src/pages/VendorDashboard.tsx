
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Plus, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import SubmissionDetailsDialog from '../components/SubmissionDetailsDialog';
import PartialInvoiceDialog from '../components/PartialInvoiceDialog';
import { formatINR } from '../utils/currency';

interface Submission {
  id: string;
  trackingNumber: string;
  vendor: string;
  projectName: string;
  submissionDate: string;
  submittedAt: string;
  status: 'pending' | 'l1_reviewed' | 'l2_reviewed' | 'approved' | 'rejected';
  totalAmount: number;
  completionPercentage: number;
  formula: string;
  values: Record<string, number>;
  result: number;
  description: string;
  invoicePercentage?: number;
  invoiceAmount?: number;
  invoiceStatus?: 'none' | 'requested' | 'approved' | 'paid';
  erpReady: boolean;
}

const VendorDashboard: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [submissions] = useState<Submission[]>([
    {
      id: '1',
      trackingNumber: 'CALC-001',
      vendor: 'ABC Construction Ltd',
      projectName: 'Highway Construction Phase 1',
      submissionDate: '2025-01-03',
      submittedAt: '2025-01-03',
      status: 'approved',
      totalAmount: 2500000,
      completionPercentage: 100,
      formula: 'Material Cost + Labor + Overhead',
      values: { Block1: 10.5, Block2: 8.2, Block3: 6.0 },
      result: 2500000,
      description: 'Complete material cost analysis for Q4 construction work',
      invoicePercentage: 100,
      invoiceAmount: 2500000,
      invoiceStatus: 'approved',
      erpReady: true
    },
    {
      id: '2',
      trackingNumber: 'CALC-002',
      vendor: 'ABC Construction Ltd',
      projectName: 'Bridge Foundation Work',
      submissionDate: '2025-01-02',
      submittedAt: '2025-01-02',
      status: 'l2_reviewed',
      totalAmount: 1800000,
      completionPercentage: 85,
      formula: 'Concrete Volume × Rate + Steel Weight × Rate',
      values: { ConcreteVolume: 450, SteelWeight: 12.5 },
      result: 1800000,
      description: 'Foundation concrete and steel reinforcement calculations',
      invoicePercentage: 75,
      invoiceAmount: 1350000,
      invoiceStatus: 'requested',
      erpReady: false
    },
    {
      id: '3',
      trackingNumber: 'CALC-003',
      vendor: 'ABC Construction Ltd',
      projectName: 'Residential Complex - Block A',
      submissionDate: '2025-01-01',
      submittedAt: '2025-01-01',
      status: 'l1_reviewed',
      totalAmount: 3200000,
      completionPercentage: 60,
      formula: 'Built-up Area × Rate per sq.ft',
      values: { BuiltUpArea: 8000, RatePerSqFt: 400 },
      result: 3200000,
      description: 'Residential building construction cost estimation',
      invoicePercentage: 0,
      invoiceAmount: 0,
      invoiceStatus: 'none',
      erpReady: false
    },
    {
      id: '4',
      trackingNumber: 'CALC-004',
      vendor: 'ABC Construction Ltd',
      projectName: 'Water Treatment Plant',
      submissionDate: '2024-12-30',
      submittedAt: '2024-12-30',
      status: 'pending',
      totalAmount: 4500000,
      completionPercentage: 40,
      formula: 'Equipment Cost + Installation + Civil Work',
      values: { Equipment: 2800000, Installation: 900000, CivilWork: 800000 },
      result: 4500000,
      description: 'Water treatment facility construction and equipment installation',
      invoicePercentage: 0,
      invoiceAmount: 0,
      invoiceStatus: 'none',
      erpReady: false
    }
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      l1_reviewed: { color: 'bg-blue-500', text: 'Reviewed' },
      l2_reviewed: { color: 'bg-purple-500', text: 'Validated' },
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
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'l1_reviewed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'l2_reviewed': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusConfig = {
      none: { color: 'bg-gray-400', text: 'No Invoice' },
      requested: { color: 'bg-orange-500', text: 'Requested' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      paid: { color: 'bg-blue-500', text: 'Paid' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80`}>
        {config.text}
      </Badge>
    );
  };

  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const totalEarnings = approvedSubmissions.reduce((sum, s) => sum + (s.invoiceAmount || 0), 0);
  const pendingAmount = submissions.filter(s => s.invoiceStatus === 'requested').reduce((sum, s) => sum + (s.invoiceAmount || 0), 0);

  return (
    <Layout title="Vendor Dashboard">
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedSubmissions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatINR(totalEarnings)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatINR(pendingAmount)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Submissions</h2>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Submission</span>
          </Button>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Tracking #</th>
                    <th className="text-left p-4">Project</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Completion</th>
                    <th className="text-left p-4">Invoice</th>
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
                        <div>
                          <div className="font-medium">{submission.projectName}</div>
                          <div className="text-sm text-gray-500">{submission.submissionDate}</div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{formatINR(submission.totalAmount)}</td>
                      <td className="p-4">{getStatusBadge(submission.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${submission.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{submission.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {getInvoiceStatusBadge(submission.invoiceStatus || 'none')}
                          {submission.invoiceAmount ? (
                            <div className="text-sm text-gray-600">
                              {formatINR(submission.invoiceAmount)} ({submission.invoicePercentage}%)
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          {submission.status === 'approved' && submission.invoiceStatus !== 'paid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowInvoiceDialog(true);
                              }}
                              className="flex items-center space-x-1"
                            >
                              <DollarSign className="h-4 w-4" />
                              <span>Invoice</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-4 w-4" />
                            <span>PDF</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedSubmission && (
        <SubmissionDetailsDialog
          submission={selectedSubmission}
          open={!!selectedSubmission}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSubmission(null);
              setShowInvoiceDialog(false);
            }
          }}
        />
      )}

      {showInvoiceDialog && selectedSubmission && (
        <PartialInvoiceDialog
          submission={selectedSubmission}
          isOpen={showInvoiceDialog}
          onClose={() => setShowInvoiceDialog(false)}
        />
      )}
    </Layout>
  );
};

export default VendorDashboard;
