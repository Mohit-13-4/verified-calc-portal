
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { Contract } from '../types/contract';
import { formatINR } from '../utils/currency';

interface ContractCardProps {
  contract: Contract;
  onExpand: (contractId: string) => void;
  isExpanded: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onExpand, isExpanded }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{contract.projectName}</h3>
              <Badge className={`${getStatusColor(contract.status)} text-white text-xs`}>
                {contract.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">ID: {contract.projectId}</p>
            <p className="text-sm font-medium text-gray-800">{contract.clientName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExpand(contract.id)}
            className="ml-2"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{contract.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{contract.startDate} - {contract.endDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-800">{formatINR(contract.totalValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractCard;
