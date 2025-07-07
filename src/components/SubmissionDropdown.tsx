import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pencil,
  Building
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import ValueEditDialog from './ValueEditDialog';
import RejectionDialog from './RejectionDialog';
import { useAuth } from '../contexts/AuthContext';

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

interface SubmissionDropdownProps {
  submission: Submission;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove?: (submissionId: string, comment: string) => void;
  onReject?: (submissionId: string, comment: string) => void;
  onEditValues?: (submissionId: string, updatedValues: Record<string, number>, comment: string) => void;
  onShowDetails?: () => void;
}

const SubmissionDropdown: React.FC<SubmissionDropdownProps> = ({
  submission,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  onEditValues,
  onShowDetails
}) => {
  const { user } = useAuth();
  const [showValueEditDialog, setShowValueEditDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'l1_reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'l2_reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'l1_reviewed':
        return 'L1 Reviewed';
      case 'l2_reviewed':
        return 'L2 Reviewed';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const canApprove = () => {
    if (!user?.role) return false;
    
    switch (user.role) {
      case 'level1':
        return submission.status === 'pending';
      case 'level2':
        return submission.status === 'l1_reviewed';
      case 'level3':
        return submission.status === 'l2_reviewed';
      default:
        return false;
    }
  };

  const canEdit = () => {
    return canApprove() && onEditValues;
  };

  const getFinalAmount = () => {
    if (submission.l2EditedValues) {
      return Object.values(submission.l2EditedValues).reduce((sum, val) => sum + val, 0);
    }
    if (submission.l1EditedValues) {
      return Object.values(submission.l1EditedValues).reduce((sum, val) => sum + val, 0);
    }
    return submission.result || 0;
  };

  const handleApprove = (comment: string) => {
    if (onApprove) {
      onApprove(submission.id, comment);
    }
  };

  const handleReject = (comment: string) => {
    if (onReject) {
      onReject(submission.id, comment);
    }
    setShowRejectDialog(false);
  };

  const handleEditValues = (updatedValues: Record<string, number>, comment: string) => {
    if (onEditValues) {
      onEditValues(submission.id, updatedValues, comment);
    }
    setShowValueEditDialog(false);
  };

  return (
    <div className="border rounded-lg hover:bg-gray-50 transition-colors">
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <div className="font-medium text-gray-900">{submission.trackingNumber}</div>
              <div className="text-sm text-gray-600">{submission.vendor}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium text-gray-900">{submission.projectName}</div>
              <div className="text-sm text-gray-600">{formatINR(getFinalAmount())}</div>
            </div>
            <Badge className={getStatusColor(submission.status)}>
              {getStatusLabel(submission.status)}
            </Badge>
            <div className="text-sm text-gray-500">{submission.submittedAt}</div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Description:</strong> {submission.description}</div>
                <div><strong>Formula:</strong> {submission.formula}</div>
                <div><strong>Completion:</strong> {submission.completionPercentage}%</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Values</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(submission.values).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Value History */}
          {(submission.originalValues || submission.l1EditedValues || submission.l2EditedValues) && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Value History</h4>
              <div className="space-y-2 text-sm">
                {submission.originalValues && (
                  <div className="p-2 bg-gray-100 rounded">
                    <strong>Original Values:</strong>
                    <div className="ml-4">
                      {Object.entries(submission.originalValues).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {submission.l1EditedValues && (
                  <div className="p-2 bg-blue-50 rounded">
                    <strong>L1 Edited Values:</strong>
                    <div className="ml-4">
                      {Object.entries(submission.l1EditedValues).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </div>
                    {submission.l1Comment && (
                      <div className="ml-4 mt-1 text-gray-600">
                        <strong>L1 Comment:</strong> {submission.l1Comment}
                      </div>
                    )}
                  </div>
                )}
                
                {submission.l2EditedValues && (
                  <div className="p-2 bg-purple-50 rounded">
                    <strong>L2 Edited Values:</strong>
                    <div className="ml-4">
                      {Object.entries(submission.l2EditedValues).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </div>
                    {submission.l2Comment && (
                      <div className="ml-4 mt-1 text-gray-600">
                        <strong>L2 Comment:</strong> {submission.l2Comment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {onShowDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetails();
                }}
              >
                <Building className="h-4 w-4 mr-1" />
                View Project Details
              </Button>
            )}
            
            {canEdit() && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowValueEditDialog(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Values
              </Button>
            )}
            
            {canApprove() && onApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove('');
                }}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            
            {canApprove() && onReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRejectDialog(true);
                }}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showValueEditDialog && (
        <ValueEditDialog
          open={showValueEditDialog}
          onOpenChange={setShowValueEditDialog}
          submission={submission}
          userRole={user?.role || ''}
          onSave={handleEditValues}
        />
      )}

      {showRejectDialog && (
        <RejectionDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
};

export default SubmissionDropdown;
