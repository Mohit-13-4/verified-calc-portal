
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, FileText, Filter } from 'lucide-react';

interface SubmissionTrackerProps {
  draftCount: number;
  submittedCount: number;
  approvedCount: number;
  activeFilter: 'all' | 'draft' | 'submitted' | 'approved';
  onFilterChange: (filter: 'all' | 'draft' | 'submitted' | 'approved') => void;
}

const SubmissionTracker: React.FC<SubmissionTrackerProps> = ({
  draftCount,
  submittedCount,
  approvedCount,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="sticky top-4 z-10 bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Submission Tracker
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="flex items-center gap-2 h-auto p-3"
        >
          <FileText className="h-4 w-4" />
          <div className="text-left">
            <div className="text-xs">All Items</div>
            <div className="text-sm font-bold">{draftCount + submittedCount + approvedCount}</div>
          </div>
        </Button>

        <Button
          variant={activeFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('draft')}
          className="flex items-center gap-2 h-auto p-3"
        >
          <Clock className="h-4 w-4 text-orange-500" />
          <div className="text-left">
            <div className="text-xs">Draft</div>
            <div className="text-sm font-bold text-orange-600">{draftCount}</div>
          </div>
        </Button>

        <Button
          variant={activeFilter === 'submitted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('submitted')}
          className="flex items-center gap-2 h-auto p-3"
        >
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <div className="text-left">
            <div className="text-xs">Submitted</div>
            <div className="text-sm font-bold text-blue-600">{submittedCount}</div>
          </div>
        </Button>

        <Button
          variant={activeFilter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('approved')}
          className="flex items-center gap-2 h-auto p-3"
        >
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div className="text-left">
            <div className="text-xs">Approved</div>
            <div className="text-sm font-bold text-green-600">{approvedCount}</div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default SubmissionTracker;
