
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RejectionDialog from './RejectionDialog';
import ValueEditDialog from './ValueEditDialog';
import ApprovalTimeline from './ApprovalTimeline';
import SubmissionDetailsDialog from './SubmissionDetailsDialog';
import { workflowAPI } from '../services/workflowAPI';
import { 
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Download,
  Edit,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  History,
  Eye,
  TrendingUp
} from 'lucide-react';

interface Submission {
  id: string;
  vendor: string;
  formula: string;
  status: 'pending' | 'l1_reviewed' | 'l2_reviewed' | 'approved' | 'rejected';
  submittedAt: string;
  description: string;
  values: Record<string, number>;
  originalValues?: Record<string, number>;
  l1EditedValues?: Record<string, number>;
  l2EditedValues?: Record<string, number>;
  result: number;
  erpReady: boolean;
  rejectionComment?: string;
  l1Comment?: string;
  l2Comment?: string;
  completionPercentage?: number;
  attachedPDF?: string;
  valueChangeHistory?: Array<{
    level: string;
    originalValues: Record<string, number>;
    newValues: Record<string, number>;
    comment: string;
    timestamp: string;
  }>;
}

interface SubmissionCardProps {
  submission: Submission;
  userRole: 'level1' | 'level2' | 'level3';
  onStatusChange?: (submissionId: string, newStatus: string) => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ 
  submission, 
  userRole, 
  onStatusChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showValueEditDialog, setShowValueEditDialog] = useState(false);
  const [showApprovalTimeline, setShowApprovalTimeline] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      l1_reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      l2_reviewed: { label: 'Validated', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const canApprove = () => {
    if (userRole === 'level1' && submission.status === 'pending') return true;
    if (userRole === 'level2' && submission.status === 'l1_reviewed') return true;
    if (userRole === 'level3' && submission.status === 'l2_reviewed') return true;
    return false;
  };

  const getNextStatus = () => {
    if (userRole === 'level1') return 'l1_reviewed';
    if (userRole === 'level2') return 'l2_reviewed';
    if (userRole === 'level3') return 'approved';
    return submission.status;
  };

  const getActionLabel = () => {
    if (userRole === 'level1') return 'Review';
    if (userRole === 'level2') return 'Validate';
    if (userRole === 'level3') return 'Approve';
    return 'Action';
  };

  const handleApproval = async () => {
    if (!canApprove()) return;

    setLoading(true);
    try {
      const nextStatus = getNextStatus();
      console.log(`Updating submission ${submission.id} from ${submission.status} to ${nextStatus}`);
      
      await workflowAPI.updateSubmissionStatus(submission.id, { status: nextStatus });
      
      if (userRole === 'level3') {
        console.log('Generating PDF report for submission:', submission.id);
        toast({
          title: "Submission Approved",
          description: "PDF report generated and submission approved for ERP integration.",
        });
      } else {
        const actionName = getActionLabel().toLowerCase();
        toast({
          title: "Status Updated",
          description: `Submission has been ${actionName}ed and forwarded to the next level.`,
        });
      }
      
      onStatusChange?.(submission.id, nextStatus);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update submission status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (comment: string) => {
    setLoading(true);
    try {
      console.log(`Rejecting submission ${submission.id} with comment:`, comment);
      
      await workflowAPI.updateSubmissionStatus(submission.id, { 
        status: 'rejected',
        rejectionComment: comment
      });
      
      toast({
        title: "Submission Rejected",
        description: "Submission has been rejected and returned to vendor with your comments.",
      });
      
      onStatusChange?.(submission.id, 'rejected');
      setShowRejectionDialog(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValueEdit = async (newValues: Record<string, number>, comment: string) => {
    setLoading(true);
    try {
      console.log(`Editing values for submission ${submission.id}:`, newValues);
      
      await workflowAPI.updateSubmissionStatus(submission.id, {
        editedValues: newValues,
        editComment: comment
      });
      
      toast({
        title: "Values Updated",
        description: "The submission values have been updated. Changes are tracked for the next level.",
      });
      
      onStatusChange?.(submission.id, submission.status);
      setShowValueEditDialog(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update values. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF for submission:', submission.id);
    toast({
      title: "Download Started",
      description: "PDF report is being generated and will download shortly.",
    });
  };

  const handleViewDetails = () => {
    setShowDetailsDialog(true);
  };

  const renderValueComparison = () => {
    if (!submission.originalValues) return null;

    const showL1Changes = userRole !== 'level1' && submission.l1EditedValues;
    const showL2Changes = userRole === 'level3' && submission.l2EditedValues;

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Value History</h4>
        
        {/* Original Values */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600 mb-2">Original (Vendor)</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(submission.originalValues).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {showL1Changes && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-600 mb-2">
              Level 1 Changes
              {submission.l1Comment && (
                <span className="ml-2 text-xs text-blue-500">({submission.l1Comment})</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(submission.l1EditedValues!).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={`font-mono ${
                    submission.originalValues![key] !== value ? 'text-blue-600 font-bold' : ''
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showL2Changes && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-600 mb-2">
              Level 2 Changes
              {submission.l2Comment && (
                <span className="ml-2 text-xs text-purple-500">({submission.l2Comment})</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(submission.l2EditedValues!).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={`font-mono ${
                    (submission.l1EditedValues || submission.originalValues)![key] !== value ? 'text-purple-600 font-bold' : ''
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-600 mb-2">Current Values</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(submission.values).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="font-mono font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const StatusIcon = getStatusConfig(submission.status).icon;
  const canEdit = canApprove() && submission.status !== 'approved' && submission.status !== 'rejected';
  const completionPercentage = submission.completionPercentage || 0;

  // Mock approval timeline data
  const mockApprovalSteps = [
    {
      level: 1,
      approverName: 'Rajesh Kumar (Site Engineer)',
      timestamp: '2025-06-25T09:30:00Z',
      status: 'approved' as const,
      comment: 'Measurements verified on-site. Length adjusted after re-measurement.',
      changedValues: {
        'Block1': { before: 10.0, after: 10.2 }
      }
    },
    {
      level: 2,
      approverName: 'Arvind Thakur (Project Manager)',
      timestamp: '2025-06-25T11:32:00Z',
      status: 'modified' as const,
      comment: 'Revised after post-pour inspection of slab thickness. Depth corrected as per revised site layout.',
      changedValues: {
        'Block2': { before: 1.50, after: 1.65 },
        'Block3': { before: 2.00, after: 2.10 }
      }
    },
    {
      level: 3,
      approverName: 'Dr. Priya Sharma (Chief Engineer)',
      timestamp: '',
      status: 'pending' as const,
      comment: ''
    }
  ];

  const getCurrentLevel = () => {
    switch (submission.status) {
      case 'pending': return 0;
      case 'l1_reviewed': return 1;
      case 'l2_reviewed': return 2;
      case 'approved': return 3;
      default: return 0;
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{submission.formula}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusConfig(submission.status).className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {getStatusConfig(submission.status).label}
              </Badge>
              {submission.erpReady && (
                <Badge className="bg-blue-100 text-blue-800">
                  ERP Ready
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Work Completion Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Work Completion</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Vendor:</span>
              <span className="ml-2">{submission.vendor}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Submitted:</span>
              <span className="ml-2">{submission.submittedAt}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Result:</span>
              <span className="ml-2 font-mono">₹{submission.result.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">ID:</span>
              <span className="ml-2 font-mono">{submission.id}</span>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Description:</span>
            <p className="text-sm text-gray-700 mt-1">{submission.description}</p>
          </div>

          {submission.rejectionComment && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Rejection Reason</span>
              </div>
              <p className="text-sm text-red-700">{submission.rejectionComment}</p>
            </div>
          )}

          {renderValueComparison()}

          <Collapsible open={showApprovalTimeline} onOpenChange={setShowApprovalTimeline}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Approval Timeline</span>
                </div>
                {showApprovalTimeline ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <ApprovalTimeline 
                steps={mockApprovalSteps}
                currentLevel={getCurrentLevel()}
              />
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {canApprove() && (
                <Button
                  onClick={handleApproval}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : getActionLabel()}
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setShowValueEditDialog(true)}
                  disabled={loading}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Values
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(true)}
                disabled={loading || submission.status === 'approved'}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : "Reject"}
              </Button>
            </div>

            <div className="flex space-x-2">
              {submission.status === 'approved' && (
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RejectionDialog
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        onConfirm={handleReject}
        loading={loading}
      />

      <ValueEditDialog
        open={showValueEditDialog}
        onOpenChange={setShowValueEditDialog}
        onConfirm={handleValueEdit}
        originalValues={submission.values}
        loading={loading}
      />

      <SubmissionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        submission={submission}
      />
    </>
  );
};

export default SubmissionCard;
