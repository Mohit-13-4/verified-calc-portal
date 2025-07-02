import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  User, 
  MessageSquare, 
  ArrowRight, 
  Edit3 
} from 'lucide-react';

interface ApprovalStep {
  level: number;
  approverName: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  comment?: string;
  changedValues?: Record<string, { before: any; after: any }>;
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  currentLevel: number;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ steps, currentLevel }) => {
  const getStepIcon = (status: string, level: number) => {
    if (level > currentLevel) {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
    
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'modified':
        return <Edit3 className="h-5 w-5 text-blue-600" />;
      case 'rejected':
        return <CheckCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStepStatus = (status: string, level: number) => {
    if (level > currentLevel) {
      return { label: 'Pending', className: 'bg-gray-100 text-gray-800' };
    }
    
    switch (status) {
      case 'approved':
        return { label: 'Approved', className: 'bg-green-100 text-green-800' };
      case 'modified':
        return { label: 'Modified & Approved', className: 'bg-blue-100 text-blue-800' };
      case 'rejected':
        return { label: 'Rejected', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'In Review', className: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Approval Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const statusConfig = getStepStatus(step.status, step.level);
            const isActive = step.level === currentLevel;
            const isCompleted = step.level < currentLevel || step.status === 'approved' || step.status === 'modified';
            
            return (
              <div key={step.level} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border ${
                  isActive ? 'border-blue-200 bg-blue-50' : 
                  isCompleted ? 'border-green-200 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}>
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step.status, step.level)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          Level {step.level} - {step.approverName}
                        </h4>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      {step.timestamp && (
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(step.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {/* Changes Made */}
                    {step.changedValues && Object.keys(step.changedValues).length > 0 && (
                      <div className="mb-3 p-3 bg-white rounded border border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Changes Made:
                        </div>
                        <div className="space-y-1">
                          {Object.entries(step.changedValues).map(([field, change]) => (
                            <div key={field} className="flex items-center text-sm">
                              <span className="font-medium text-gray-700">{field}:</span>
                              <span className="mx-2 text-gray-500">{change.before}</span>
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                              <span className="mx-2 font-medium text-blue-600">{change.after}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Comment */}
                    {step.comment && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 italic">"{step.comment}"</p>
                      </div>
                    )}
                    
                    {/* Pending State */}
                    {step.level > currentLevel && (
                      <p className="text-sm text-gray-500">
                        Awaiting approval from Level {step.level}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Progress:</span> Level {currentLevel} of {steps.length} completed
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalTimeline;