
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calculator,
  FileText,
  ArrowRight,
  TrendingUp,
  User
} from 'lucide-react';
import ValueEditDialog from './ValueEditDialog';
import { useAuth } from '../contexts/AuthContext';

interface SubmissionDropdownProps {
  submission: any;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove?: (id: string, comment: string) => void;
  onReject?: (id: string, comment: string) => void;
  onEditValues?: (id: string, values: Record<string, number>, comment: string) => void;
}

const SubmissionDropdown: React.FC<SubmissionDropdownProps> = ({
  submission,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  onEditValues
}) => {
  const { user } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [showActionForm, setShowActionForm] = useState<'approve' | 'reject' | null>(null);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      l1_reviewed: { label: 'L1 Reviewed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      l2_reviewed: { label: 'L2 Validated', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      approved: { label: 'L3 Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const canEdit = () => {
    const role = user?.role;
    if (role === 'level1' && submission.status === 'pending') return true;
    if (role === 'level2' && submission.status === 'l1_reviewed') return true;
    if (role === 'level3' && submission.status === 'l2_reviewed') return true;
    return false;
  };

  const canApprove = () => {
    const role = user?.role;
    if (role === 'level1' && submission.status === 'pending') return true;
    if (role === 'level2' && submission.status === 'l1_reviewed') return true;
    if (role === 'level3' && submission.status === 'l2_reviewed') return true;
    return false;
  };

  const getFinalAmount = () => {
    // Always show the amount from the highest approval level available
    if (submission.l2EditedValues) {
      return Object.values(submission.l2EditedValues).reduce((sum: number, val: number) => sum + val, 0);
    }
    if (submission.l1EditedValues) {
      return Object.values(submission.l1EditedValues).reduce((sum: number, val: number) => sum + val, 0);
    }
    return submission.result || 0;
  };

  const StatusIcon = getStatusConfig(submission.status).icon;
  const completionPercentage = submission.completionPercentage || 0;

  const handleAction = (action: 'approve' | 'reject') => {
    if (action === 'approve' && onApprove) {
      onApprove(submission.id, actionComment);
    } else if (action === 'reject' && onReject) {
      onReject(submission.id, actionComment);
    }
    setActionComment('');
    setShowActionForm(null);
  };

  const renderValueChanges = () => {
    const changes = [];
    
    if (submission.l1EditedValues) {
      changes.push({
        level: 'Level 1 Review',
        original: submission.originalValues || submission.values,
        changed: submission.l1EditedValues,
        comment: submission.l1Comment || 'No comment',
        colorType: 'blue' as const
      });
    }
    
    if (submission.l2EditedValues) {
      changes.push({
        level: 'Level 2 Validation',
        original: submission.l1EditedValues || submission.originalValues || submission.values,
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
            accent: 'text-blue-600'
          };
        } else {
          return {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-800',
            accent: 'text-purple-600'
          };
        }
      };

      const colors = getColorClasses(change.colorType);

      return (
        <div key={index} className={`${colors.bg} ${colors.border} border rounded-lg p-3 mb-3`}>
          <h5 className={`font-medium ${colors.text} mb-2 text-sm`}>{change.level}</h5>
          <div className="space-y-1">
            {Object.entries(change.changed).map(([key, newValue]: [string, any]) => {
              const oldValue: number = change.original[key] || 0;
              const numNewValue = Number(newValue);
              const hasChanged = oldValue !== numNewValue;
              
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{key}:</span>
                  <div className="flex items-center space-x-1">
                    <span className={hasChanged ? 'line-through text-gray-500' : 'font-mono'}>
                      {oldValue}
                    </span>
                    {hasChanged && (
                      <>
                        <ArrowRight className="h-2 w-2 text-gray-400" />
                        <span className={`font-mono font-bold ${colors.accent}`}>
                          {numNewValue}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">Comment:</span> {change.comment}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <td className="p-4">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4" />
            <span className="font-medium">{submission.trackingNumber}</span>
          </div>
        </td>
        <td className="p-4">{submission.vendorName}</td>
        <td className="p-4">
          <div>
            <div className="font-medium">{submission.projectName}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {submission.description}
            </div>
          </div>
        </td>
        <td className="p-4 font-medium">₹{getFinalAmount().toLocaleString('en-IN')}</td>
        <td className="p-4">
          <Badge className={getStatusConfig(submission.status).className}>
            {getStatusConfig(submission.status).label}
          </Badge>
        </td>
        <td className="p-4 text-sm text-gray-500">{submission.submissionDate}</td>
        <td className="p-4">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            <Eye className="h-4 w-4" />
          </Button>
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="bg-gray-50 border-t">
              <Card className="m-4 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Submission Details</span>
                    <div className="flex items-center space-x-2">
                      {canEdit() && (
                        <Button
                          size="sm"
                          onClick={() => setShowEditDialog(true)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Values</span>
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress and Basic Info */}
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Work Completion</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Formula:</span>
                      <span className="ml-2">{submission.formula}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Final Amount:</span>
                      <span className="ml-2 font-mono font-bold text-green-600">
                        ₹{getFinalAmount().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Current Values */}
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Current Values</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(submission.values).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-2 rounded">
                          <div className="text-xs font-medium text-gray-600">{key}</div>
                          <div className="text-sm font-mono font-bold">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Value Changes History */}
                  {(submission.l1EditedValues || submission.l2EditedValues) && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Review History</span>
                      </h4>
                      {renderValueChanges()}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canApprove() && (
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      {showActionForm ? (
                        <div className="flex-1 space-y-2">
                          <textarea
                            placeholder={`Enter your ${user?.role} comment...`}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAction(showActionForm)}
                              disabled={!actionComment.trim()}
                              className={showActionForm === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                              {showActionForm === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowActionForm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setShowActionForm('approve')}
                            className="bg-green-600 hover:bg-green-700 flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowActionForm('reject')}
                            className="flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </td>
        </tr>
      )}

      <ValueEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        submission={submission}
        userRole={user?.role || ''}
        onSave={onEditValues || (() => {})}
      />
    </>
  );
};

export default SubmissionDropdown;
