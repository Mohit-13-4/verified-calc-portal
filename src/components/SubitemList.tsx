
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Edit, Clock, CheckCircle, Calendar, History, Plus } from 'lucide-react';
import { ContractSubitem } from '../types/contract';
import { formatINR } from '../utils/currency';
import { format } from 'date-fns';

interface SubitemListProps {
  subitems: ContractSubitem[];
  selectedSubitems: string[];
  onToggleSelection: (subitemId: string) => void;
  onEditSubitem: (subitem: ContractSubitem) => void;
  onViewHistory: (subitem: ContractSubitem) => void;
  onAddEntry: (subitem: ContractSubitem) => void;
}

const SubitemList: React.FC<SubitemListProps> = ({ 
  subitems, 
  selectedSubitems, 
  onToggleSelection, 
  onEditSubitem,
  onViewHistory,
  onAddEntry
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-500';
      case 'ready': return 'bg-blue-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge className="bg-green-100 text-green-800">🟢 Submitted</Badge>;
      case 'ready': return <Badge className="bg-blue-100 text-blue-800">🔵 Ready</Badge>;
      case 'draft': return <Badge className="bg-orange-100 text-orange-800">🟠 Draft</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (subitem: ContractSubitem) => {
    return subitem.totalQuantity > 0 
      ? Math.round((subitem.completedQuantity / subitem.totalQuantity) * 100) 
      : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLastEntryDate = (subitem: ContractSubitem) => {
    if (subitem.entries.length === 0) return null;
    const sortedEntries = subitem.entries.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
    return sortedEntries[0].entryDate;
  };

  const getDraftEntryCount = (subitem: ContractSubitem) => {
    return subitem.entries.filter(entry => entry.isDraft).length;
  };

  return (
    <div className="space-y-3">
      {subitems.map((subitem) => {
        const progress = calculateProgress(subitem);
        const isSelected = selectedSubitems.includes(subitem.id);
        const lastEntryDate = getLastEntryDate(subitem);
        const draftCount = getDraftEntryCount(subitem);
        
        return (
          <Card key={subitem.id} className={`transition-all hover:shadow-sm ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(subitem.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">{subitem.name}</CardTitle>
                    <p className="text-xs text-gray-600 mt-1">{subitem.description}</p>
                    
                    {/* Last Entry Date */}
                    {lastEntryDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Last entry: {format(new Date(lastEntryDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(subitem.status)}
                  
                  {/* Draft Count Badge */}
                  {draftCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {draftCount} draft{draftCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-medium">{subitem.totalQuantity} {subitem.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed: </span>
                  <span className="font-medium">{subitem.completedQuantity} {subitem.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rate: </span>
                  <span className="font-medium">{formatINR(subitem.rate)} per {subitem.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Value: </span>
                  <span className="font-medium">{formatINR(subitem.completedQuantity * subitem.rate)}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Entry Count and Last Updated */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Last updated: {formatDate(subitem.lastUpdated)}</span>
                <span>{subitem.entries.length} entries</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddEntry(subitem)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Entry
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewHistory(subitem)}
                  className="flex items-center gap-1"
                >
                  <History className="h-3 w-3" />
                  History
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSubitem(subitem)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubitemList;
