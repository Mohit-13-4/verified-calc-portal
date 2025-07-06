
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Edit, 
  Check, 
  X, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import ValueEditDialog from './ValueEditDialog';
import RejectionDialog from './RejectionDialog';
import SubitemEntryForm from './SubitemEntryForm';
import { ContractSubitem } from '../types/contract';

interface Submission {
  id: string;
  trackingNumber: string;
  contractName: string;
  vendorName: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  totalValue: number;
  items: SubmissionItem[];
}

interface SubmissionItem {
  id: string;
  name: string;
  description: string;
  unit: string;
  subitems: SubmissionSubitem[];
}

interface SubmissionSubitem {
  id: string;
  name: string;
  description: string;
  totalQuantity: number;
  submittedQuantity: number;
  approvedQuantity?: number;
  rate: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected';
  value: number;
  attachments?: string[];
  notes?: string;
}

interface SubmissionDropdownProps {
  submission: Submission;
  onApprove: (submissionId: string, updatedValues: Record<string, number>, comment: string) => void;
  onReject: (submissionId: string, comment: string) => void;
  userRole: string;
}

const SubmissionDropdown: React.FC<SubmissionDropdownProps> = ({
  submission,
  onApprove,
  onReject,
  userRole
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [editingValue, setEditingValue] = useState<{
    subitemId: string;
    currentValue: number;
    maxValue: number;
  } | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [editingSubitem, setEditingSubitem] = useState<ContractSubitem | null>(null);

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = userRole === 'level1' || userRole === 'level2' || userRole === 'level3';
  const canApprove = userRole === 'level1' || userRole === 'level2' || userRole === 'level3';

  const handleValueEdit = (subitemId: string, currentValue: number, maxValue: number) => {
    setEditingValue({ subitemId, currentValue, maxValue });
  };

  const handleValueSave = (newValue: number) => {
    if (editingValue) {
      const updatedValues = { [editingValue.subitemId]: newValue };
      onApprove(submission.id, updatedValues, `Updated quantity for subitem ${editingValue.subitemId}`);
      setEditingValue(null);
    }
  };

  const handleApprove = () => {
    onApprove(submission.id, {}, 'Approved submission');
  };

  const handleReject = (comment: string) => {
    onReject(submission.id, comment);
    setShowRejectionDialog(false);
  };

  const handleAddSubitem = (itemId: string) => {
    console.log('Add subitem to item:', itemId);
    // Mock subitem for demonstration
    const mockSubitem: ContractSubitem = {
      id: `new-${Date.now()}`,
      itemId: itemId,
      name: 'New Subitem',
      description: 'New subitem description',
      totalQuantity: 0,
      completedQuantity: 0,
      unit: 'units',
      rate: 0,
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      entries: []
    };
    setEditingSubitem(mockSubitem);
  };

  const handleSaveSubitemEntry = (
    subitemId: string, 
    entry: any, 
    isDraft: boolean
  ) => {
    console.log('Saving subitem entry:', { subitemId, entry, isDraft });
    setEditingSubitem(null);
  };

  return (
    <div className="space-y-4">
      {/* Submission Header */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold">{submission.contractName}</h3>
            <p className="text-sm text-gray-600">
              {submission.vendorName} • {submission.trackingNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(submission.status)}>
              {submission.status}
            </Badge>
            <span className="text-sm font-medium">{formatINR(submission.totalValue)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          Submitted: {new Date(submission.submissionDate).toLocaleDateString()}
        </p>

        {/* Action Buttons */}
        {canApprove && submission.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApprove}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setShowRejectionDialog(true)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Submission Items */}
      <div className="space-y-3">
        {submission.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleItemExpansion(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {item.subitems.length} subitems
                  </span>
                  {expandedItems.includes(item.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Subitems */}
            {expandedItems.includes(item.id) && (
              <div className="border-t bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Subitems</h5>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubitem(item.id);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subitem
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {item.subitems.map((subitem) => (
                    <div key={subitem.id} className="bg-white rounded p-3 border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h6 className="font-medium">{subitem.name}</h6>
                            <Badge className={getStatusColor(subitem.status)} variant="outline">
                              {subitem.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{subitem.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Total: </span>
                          <span className="font-medium">{subitem.totalQuantity} {subitem.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Submitted: </span>
                          <span className="font-medium">{subitem.submittedQuantity} {subitem.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rate: </span>
                          <span className="font-medium">{formatINR(subitem.rate)} per {subitem.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Value: </span>
                          <span className="font-medium">{formatINR(subitem.value)}</span>
                        </div>
                      </div>

                      {canEdit && subitem.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValueEdit(subitem.id, subitem.submittedQuantity, subitem.totalQuantity)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Quantity
                          </Button>
                        </div>
                      )}

                      {subitem.attachments && subitem.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-1">Attachments:</p>
                          <div className="flex flex-wrap gap-1">
                            {subitem.attachments.map((attachment, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {subitem.notes && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-1">Notes:</p>
                          <p className="text-xs">{subitem.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <ValueEditDialog
        isOpen={!!editingValue}
        currentValue={editingValue?.currentValue || 0}
        maxValue={editingValue?.maxValue || 0}
        onSave={handleValueSave}
        onCancel={() => setEditingValue(null)}
      />

      <RejectionDialog
        isOpen={showRejectionDialog}
        onConfirm={handleReject}
        onClose={() => setShowRejectionDialog(false)}
      />

      <SubitemEntryForm
        subitem={editingSubitem}
        isOpen={!!editingSubitem}
        onClose={() => setEditingSubitem(null)}
        onSave={handleSaveSubitemEntry}
      />
    </div>
  );
};

export default SubmissionDropdown;
