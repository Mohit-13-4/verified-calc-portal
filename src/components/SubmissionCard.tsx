
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Download
} from 'lucide-react';

interface Submission {
  id: string;
  vendor: string;
  formula: string;
  status: 'pending' | 'l1_reviewed' | 'l2_reviewed' | 'approved' | 'rejected';
  submittedAt: string;
  description: string;
  values: Record<string, number>;
  result: number;
  erpReady: boolean;
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
  const { toast } = useToast();

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      l1_reviewed: { label: 'L1 Reviewed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      l2_reviewed: { label: 'L2 Reviewed', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
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
    if (userRole === 'level1') return 'Verify';
    if (userRole === 'level2') return 'Approve';
    if (userRole === 'level3') return 'Finalize';
    return 'Action';
  };

  const handleApproval = async () => {
    if (!canApprove()) return;

    setLoading(true);
    try {
      const nextStatus = getNextStatus();
      console.log(`Updating submission ${submission.id} from ${submission.status} to ${nextStatus}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For Level 3, simulate PDF generation
      if (userRole === 'level3') {
        console.log('Generating PDF report for submission:', submission.id);
        toast({
          title: "Submission Finalized",
          description: "PDF report generated and submission approved for ERP integration.",
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Submission has been ${getActionLabel().toLowerCase()}ed and forwarded to the next level.`,
        });
      }
      
      // Call parent callback
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

  const handleReject = async () => {
    setLoading(true);
    try {
      console.log(`Rejecting submission ${submission.id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Submission Rejected",
        description: "Submission has been rejected and returned to vendor.",
      });
      
      onStatusChange?.(submission.id, 'rejected');
      
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

  const handleDownloadPDF = () => {
    console.log('Downloading PDF for submission:', submission.id);
    toast({
      title: "Download Started",
      description: "PDF report is being generated and will download shortly.",
    });
  };

  const StatusIcon = getStatusConfig(submission.status).icon;

  return (
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
            <span className="ml-2 font-mono">{submission.result}</span>
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
            
            <Button
              variant="outline"
              onClick={handleReject}
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
            
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionCard;
