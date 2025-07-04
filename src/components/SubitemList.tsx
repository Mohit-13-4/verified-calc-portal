
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Edit, Clock, CheckCircle } from 'lucide-react';
import { ContractSubitem } from '../types/contract';
import { formatINR } from '../utils/currency';

interface SubitemListProps {
  subitems: ContractSubitem[];
  selectedSubitems: string[];
  onToggleSelection: (subitemId: string) => void;
  onEditSubitem: (subitem: ContractSubitem) => void;
}

const SubitemList: React.FC<SubitemListProps> = ({ 
  subitems, 
  selectedSubitems, 
  onToggleSelection, 
  onEditSubitem 
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

  return (
    <div className="space-y-3">
      {subitems.map((subitem) => {
        const progress = calculateProgress(subitem);
        const isSelected = selectedSubitems.includes(subitem.id);
        
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(subitem.status)} text-white text-xs flex items-center gap-1`}>
                    {getStatusIcon(subitem.status)}
                    {subitem.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSubitem(subitem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Last updated: {formatDate(subitem.lastUpdated)}</span>
                <span>{subitem.entries.length} entries</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubitemList;
