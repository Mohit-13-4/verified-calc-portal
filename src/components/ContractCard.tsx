
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import RejectionDialog from './RejectionDialog';
import ContractEditDialog from './ContractEditDialog';
import { contractAPI } from '../services/contractAPI';
import { 
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Download,
  Edit,
  Package,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Contract {
  id: string;
  vendor: string;
  projectName: string;
  totalAmount: number;
  startDate: string;
  description: string;
  status: 'draft' | 'submitted' | 'l1_review' | 'l2_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    deliveredQuantity: number;
    unitPrice: number;
  }>;
  submissions: Array<{
    statusNotes?: string;
    approvalHistory: Array<{
      approverLevel: 1 | 2 | 3;
      action: string;
      notes?: string;
      actionDate: string;
      changedFields?: Record<string, { before: any; after: any }>;
    }>;
  }>;
}

interface ContractCardProps {
  contract: Contract;
  userRole: 'level1' | 'level2' | 'level3';
  onStatusChange?: (contractId: string, newStatus: string) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ 
  contract, 
  userRole, 
  onStatusChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
      submitted: { label: 'Submitted', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      l1_review: { label: 'L1 Review', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      l2_review: { label: 'L2 Review', className: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    return configs[status as keyof typeof configs] || configs.submitted;
  };

  const canApprove = () => {
    if (userRole === 'level1' && contract.status === 'submitted') return true;
    if (userRole === 'level2' && contract.status === 'l1_review') return true;
    if (userRole === 'level3' && contract.status === 'l2_review') return true;
    return false;
  };

  const getNextStatus = () => {
    if (userRole === 'level1') return 'l1_review';
    if (userRole === 'level2') return 'l2_review';
    if (userRole === 'level3') return 'approved';
    return contract.status;
  };

  const handleApproval = async () => {
    if (!canApprove()) return;

    setLoading(true);
    try {
      const nextStatus = getNextStatus();
      await contractAPI.updateContractStatus(contract.id, { 
        status: nextStatus,
        approverLevel: userRole === 'level1' ? 1 : userRole === 'level2' ? 2 : 3,
        approverId: 'CURRENT-USER',
        notes: `Approved by ${userRole}`
      });
      
      toast({
        title: "Contract Approved",
        description: `Contract has been approved and forwarded to ${userRole === 'level3' ? 'final processing' : 'the next level'}.`,
      });
      
      onStatusChange?.(contract.id, nextStatus);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (comment: string) => {
    setLoading(true);
    try {
      await contractAPI.updateContractStatus(contract.id, { 
        status: 'rejected',
        statusNotes: comment,
        approverLevel: userRole === 'level1' ? 1 : userRole === 'level2' ? 2 : 3,
        approverId: 'CURRENT-USER',
        notes: comment
      });
      
      toast({
        title: "Contract Rejected",
        description: "Contract has been rejected and returned to vendor.",
      });
      
      onStatusChange?.(contract.id, 'rejected');
      setShowRejectionDialog(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemEdit = async (itemUpdates: Array<{ itemId: string; deliveredQuantity?: number; unitPrice?: number }>, comment: string) => {
    setLoading(true);
    try {
      await contractAPI.updateContractStatus(contract.id, {
        itemUpdates,
        approverLevel: userRole === 'level1' ? 1 : userRole === 'level2' ? 2 : 3,
        approverId: 'CURRENT-USER',
        notes: comment
      });
      
      toast({
        title: "Items Updated",
        description: "Contract items have been updated successfully.",
      });
      
      onStatusChange?.(contract.id, contract.status);
      setShowEditDialog(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalDelivered = () => {
    return contract.items.reduce((total, item) => total + (item.deliveredQuantity * item.unitPrice), 0);
  };

  const getDeliveryProgress = () => {
    const totalQuantity = contract.items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveredQuantity = contract.items.reduce((sum, item) => sum + item.deliveredQuantity, 0);
    return totalQuantity > 0 ? Math.round((deliveredQuantity / totalQuantity) * 100) : 0;
  };

  const StatusIcon = getStatusConfig(contract.status).icon;
  const canEdit = canApprove() && contract.status !== 'approved' && contract.status !== 'rejected';

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{contract.projectName}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusConfig(contract.status).className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {getStatusConfig(contract.status).label}
              </Badge>
              <Badge variant="outline">
                {getDeliveryProgress()}% Delivered
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-600">Vendor:</span>
              <span className="ml-2">{contract.vendor}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-600">Start Date:</span>
              <span className="ml-2">{new Date(contract.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-600">Total Amount:</span>
              <span className="ml-2 font-mono">${contract.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-gray-600">Delivered Value:</span>
              <span className="ml-2 font-mono">${getTotalDelivered().toLocaleString()}</span>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-600">Description:</span>
            <p className="text-sm text-gray-700 mt-1">{contract.description}</p>
          </div>

          {/* Contract Items */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Contract Items</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {contract.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="flex-1">{item.description}</span>
                  <div className="flex items-center space-x-4 text-xs">
                    <span>Qty: {item.deliveredQuantity}/{item.quantity}</span>
                    <span>Price: ${item.unitPrice}</span>
                    <span className="font-mono">${(item.deliveredQuantity * item.unitPrice).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Notes */}
          {contract.submissions[0]?.statusNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Status Notes</span>
              </div>
              <p className="text-sm text-yellow-700">{contract.submissions[0].statusNotes}</p>
            </div>
          )}

          {/* Approval History */}
          {contract.submissions[0]?.approvalHistory?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Approval History</h4>
              <div className="space-y-2">
                {contract.submissions[0].approvalHistory.map((history, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-blue-800">Level {history.approverLevel} - {history.action}</span>
                        {history.notes && <p className="text-sm text-blue-700 mt-1">{history.notes}</p>}
                      </div>
                      <span className="text-xs text-blue-600">{new Date(history.actionDate).toLocaleString()}</span>
                    </div>
                    {history.changedFields && Object.keys(history.changedFields).length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-blue-600">Changes: </span>
                        {Object.entries(history.changedFields).map(([field, change]) => (
                          <span key={field} className="text-blue-700">
                            {field}: {change.before} → {change.after}; 
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {canApprove() && (
                <Button
                  onClick={handleApproval}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : userRole === 'level3' ? 'Finalize' : 'Approve'}
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                  disabled={loading}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Items
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(true)}
                disabled={loading || contract.status === 'approved'}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>

            <div className="flex space-x-2">
              {contract.status === 'approved' && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Certificate
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

      <RejectionDialog
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        onConfirm={handleReject}
        loading={loading}
      />

      <ContractEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onConfirm={handleItemEdit}
        items={contract.items}
        loading={loading}
      />
    </>
  );
};

export default ContractCard;
