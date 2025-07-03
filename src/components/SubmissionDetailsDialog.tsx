
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Calculator, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Download,
  ArrowRight
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

interface SubmissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission;
}

const SubmissionDetailsDialog: React.FC<SubmissionDetailsDialogProps> = ({
  open,
  onOpenChange,
  submission
}) => {
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

  const StatusIcon = getStatusConfig(submission.status).icon;
  const completionPercentage = submission.completionPercentage || 0;

  const renderValueChanges = () => {
    const changes = [];
    
    if (submission.l1EditedValues) {
      changes.push({
        level: 'Level 1 (Reviewed)',
        original: submission.originalValues || {},
        changed: submission.l1EditedValues,
        comment: submission.l1Comment || 'No comment',
        colorType: 'blue' as const
      });
    }
    
    if (submission.l2EditedValues) {
      changes.push({
        level: 'Level 2 (Validated)',
        original: submission.l1EditedValues || submission.originalValues || {},
        changed: submission.l2EditedValues,
        comment: submission.l2Comment || 'No comment',
        colorType: 'purple' as const
      });
    }

    return changes.map((change, index) => {
      const getColorClasses = (colorType: 'blue' | 'purple') => {
        if (colorType === 'blue') {
          return {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            accent: 'text-blue-600',
            commentBg: 'bg-blue-100'
          };
        } else {
          return {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-800',
            accent: 'text-purple-600',
            commentBg: 'bg-purple-100'
          };
        }
      };

      const colors = getColorClasses(change.colorType);

      return (
        <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-4`}>
          <h4 className={`font-medium ${colors.text} mb-3`}>{change.level}</h4>
          <div className="space-y-2">
            {Object.entries(change.changed).map(([key, newValue]: [string, number]) => {
              const oldValue: number = change.original[key] || 0;
              const hasChanged = oldValue !== newValue;
              
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{key}:</span>
                  <div className="flex items-center space-x-2">
                    <span className={hasChanged ? 'line-through text-gray-500' : 'font-mono'}>
                      {oldValue}
                    </span>
                    {hasChanged && (
                      <>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className={`font-mono font-bold ${colors.accent}`}>
                          {newValue}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-3 p-2 ${colors.commentBg} rounded text-sm`}>
            <span className="font-medium">Comment:</span> {change.comment}
          </div>
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Submission Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete information about submission {submission.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{submission.formula}</span>
                <Badge className={getStatusConfig(submission.status).className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {getStatusConfig(submission.status).label}
                </Badge>
              </CardTitle>
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
                  <span className="font-medium text-gray-600">Submission ID:</span>
                  <span className="ml-2 font-mono">{submission.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Vendor:</span>
                  <span className="ml-2">{submission.vendor}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Submitted At:</span>
                  <span className="ml-2">{submission.submittedAt}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Result:</span>
                  <span className="ml-2 font-mono font-bold text-green-600">
                    ₹{submission.result.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-600">Description:</span>
                <p className="text-sm text-gray-700 mt-1">{submission.description}</p>
              </div>

              {/* Attached PDF */}
              {submission.attachedPDF && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Attached Document</span>
                    </div>
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                      <Download className="h-3 w-3" />
                      <span className="text-xs">Download</span>
                    </button>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{submission.attachedPDF}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Current Block Values</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(submission.values).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">{key}</div>
                    <div className="text-lg font-mono font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Changes */}
          {(submission.l1EditedValues || submission.l2EditedValues) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Reviewer Changes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderValueChanges()}
              </CardContent>
            </Card>
          )}

          {/* Rejection Comment */}
          {submission.rejectionComment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Rejection Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{submission.rejectionComment}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailsDialog;
