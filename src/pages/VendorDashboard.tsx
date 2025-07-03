
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsDialog from '../components/SubmissionDetailsDialog';
import PartialInvoiceDialog from '../components/PartialInvoiceDialog';
import { Plus, FileText, Clock, CheckCircle, XCircle, Eye, TrendingUp, Receipt, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock calculation data with INR currency and completion percentages
const mockCalculations = [
  {
    id: 'CALC-001',
    title: 'Material Cost Analysis Q4',
    formula: 'Material Cost + Labor + Overhead',
    status: 'approved',
    submittedDate: '2024-01-15',
    currentLevel: 'completed',
    totalValue: 1250000,
    completionPercentage: 100,
    vendor: 'ABC Construction Ltd',
    description: 'Complete material cost analysis for Q4 construction work',
    values: { Block1: 10.5, Block2: 8.2, Block3: 6.0 },
    originalValues: { Block1: 10.0, Block2: 8.0, Block3: 6.0 },
    result: 1250000,
    erpReady: true,
    submittedAt: '2024-01-15T10:30:00Z',
    attachedPDF: 'material_cost_analysis_q4.pdf',
    comments: 'Approved by all levels'
  },
  {
    id: 'CALC-002',
    title: 'Project Budget Estimation',
    formula: 'Direct Costs × 1.15 + Fixed Costs',
    status: 'l2_reviewed',
    submittedDate: '2024-01-18',
    currentLevel: 'level2',
    totalValue: 895000,
    completionPercentage: 75,
    vendor: 'ABC Construction Ltd',
    description: 'Budget estimation for new infrastructure project',
    values: { Block1: 15.2, Block2: 12.8, Block3: 8.5 },
    originalValues: { Block1: 15.0, Block2: 12.5, Block3: 8.0 },
    result: 895000,
    erpReady: false,
    submittedAt: '2024-01-18T14:20:00Z',
    attachedPDF: 'project_budget_estimation.pdf',
    comments: 'Under review by Level 2'
  },
  {
    id: 'CALC-003',
    title: 'Quarterly Revenue Projection',
    formula: 'Base Revenue + Growth Factor',
    status: 'rejected',
    submittedDate: '2024-01-10',
    currentLevel: 'level1',
    totalValue: 0,
    completionPercentage: 30,
    vendor: 'ABC Construction Ltd',
    description: 'Revenue projection analysis for current quarter',
    values: { Block1: 5.0, Block2: 3.2, Block3: 2.1 },
    originalValues: { Block1: 5.0, Block2: 3.2, Block3: 2.1 },
    result: 0,
    erpReady: false,
    submittedAt: '2024-01-10T09:15:00Z',
    rejectionComment: 'Incorrect formula parameters - please revise measurements and resubmit',
    comments: 'Incorrect formula parameters - please revise'
  }
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calculations] = useState(mockCalculations);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceSubmission, setInvoiceSubmission] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      l2_reviewed: { label: 'Validated', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      l1_reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusMap[status as keyof typeof statusMap];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getLevelProgress = (currentLevel: string, status: string) => {
    if (status === 'rejected') return 'Rejected at Level 1';
    if (status === 'approved') return 'All levels approved';
    
    const levelMap = {
      level1: 'Under Level 1 Review',
      level2: 'Under Level 2 Validation', 
      level3: 'Under Level 3 Approval'
    };
    
    return levelMap[currentLevel as keyof typeof levelMap] || 'Submitted';
  };

  const handleViewSubmission = (calc: any) => {
    setSelectedSubmission(calc);
    setShowDetailsDialog(true);
  };

  const handleGenerateInvoice = (calc: any) => {
    setInvoiceSubmission(calc);
    setShowInvoiceDialog(true);
  };

  const getTotalEarnings = () => {
    return calculations
      .filter(calc => calc.status === 'approved')
      .reduce((sum, calc) => sum + calc.totalValue, 0);
  };

  const getPendingAmount = () => {
    return calculations
      .filter(calc => calc.status !== 'rejected' && calc.status !== 'approved')
      .reduce((sum, calc) => sum + calc.totalValue, 0);
  };

  return (
    <Layout title="Vendor Portal">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Calculations</h2>
            <p className="text-gray-600">Submit and track your calculation requests</p>
          </div>
          <Button 
            onClick={() => navigate('/vendor/new-calculation')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">{calculations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'pending' || c.status.includes('reviewed')).length}
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{getTotalEarnings().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculations List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
            <CardDescription>
              Track the status of your submitted calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculations.map((calc) => (
                <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{calc.title}</h3>
                        {getStatusBadge(calc.status)}
                      </div>

                      {/* Work Completion Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-gray-600">Work Completion</span>
                          </div>
                          <span className="text-xs font-bold text-blue-600">{calc.completionPercentage}%</span>
                        </div>
                        <Progress value={calc.completionPercentage} className="h-1" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {calc.id}
                        </div>
                        <div>
                          <span className="font-medium">Formula:</span> {calc.formula}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {calc.submittedDate}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Status:</span>{' '}
                          <span className="text-gray-600">{getLevelProgress(calc.currentLevel, calc.status)}</span>
                        </div>
                        {calc.totalValue > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Value:</span>{' '}
                            <span className="text-green-600 font-bold">₹{calc.totalValue.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                      {calc.comments && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <span className="font-medium">Comments:</span> {calc.comments}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubmission(calc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {calc.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGenerateInvoice(calc)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedSubmission && (
        <SubmissionDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          submission={selectedSubmission}
        />
      )}

      {invoiceSubmission && (
        <PartialInvoiceDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          submission={invoiceSubmission}
        />
      )}
    </Layout>
  );
};

export default VendorDashboard;
