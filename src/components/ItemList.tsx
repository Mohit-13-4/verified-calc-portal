
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Package } from 'lucide-react';
import { ContractItem } from '../types/contract';
import { formatINR } from '../utils/currency';

interface ItemListProps {
  items: ContractItem[];
  expandedItem: string | null;
  onExpandItem: (itemId: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, expandedItem, onExpandItem }) => {
  const calculateItemProgress = (item: ContractItem) => {
    const totalQuantity = item.subitems.reduce((sum, sub) => sum + sub.totalQuantity, 0);
    const completedQuantity = item.subitems.reduce((sum, sub) => sum + sub.completedQuantity, 0);
    return totalQuantity > 0 ? Math.round((completedQuantity / totalQuantity) * 100) : 0;
  };

  const getItemStatus = (item: ContractItem) => {
    const statuses = item.subitems.map(sub => sub.status);
    if (statuses.every(status => status === 'submitted')) return 'submitted';
    if (statuses.some(status => status === 'ready')) return 'ready';
    return 'draft';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-500';
      case 'ready': return 'bg-blue-500';
      case 'draft': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const progress = calculateItemProgress(item);
        const status = getItemStatus(item);
        const isExpanded = expandedItem === item.id;
        
        return (
          <Card key={item.id} className={`transition-all ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(status)} text-white text-xs`}>
                    {status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onExpandItem(item.id)}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress: {progress}%</span>
                <span className="text-sm font-medium">{formatINR(item.rate)} per {item.unit}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">{item.subitems.length} subitems</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ItemList;
