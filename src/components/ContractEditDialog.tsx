
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from 'lucide-react';

interface ContractItem {
  id: string;
  description: string;
  quantity: number;
  deliveredQuantity: number;
  unitPrice: number;
}

interface ContractEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (itemUpdates: Array<{ itemId: string; deliveredQuantity?: number; unitPrice?: number }>, comment: string) => void;
  items: ContractItem[];
  loading?: boolean;
}

const ContractEditDialog: React.FC<ContractEditDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  items,
  loading = false
}) => {
  const [editedItems, setEditedItems] = useState<Record<string, { deliveredQuantity: number; unitPrice: number }>>({});
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    if (open) {
      const initialItems: Record<string, { deliveredQuantity: number; unitPrice: number }> = {};
      items.forEach(item => {
        initialItems[item.id] = {
          deliveredQuantity: item.deliveredQuantity,
          unitPrice: item.unitPrice
        };
      });
      setEditedItems(initialItems);
      setComment('');
    }
  }, [open, items]);

  const handleItemChange = (itemId: string, field: 'deliveredQuantity' | 'unitPrice', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: numValue
      }
    }));
  };

  const handleConfirm = () => {
    const updates = items
      .filter(item => {
        const edited = editedItems[item.id];
        return edited && (
          edited.deliveredQuantity !== item.deliveredQuantity ||
          edited.unitPrice !== item.unitPrice
        );
      })
      .map(item => ({
        itemId: item.id,
        deliveredQuantity: editedItems[item.id]?.deliveredQuantity,
        unitPrice: editedItems[item.id]?.unitPrice
      }));

    if (updates.length > 0) {
      onConfirm(updates, comment);
    }
  };

  const hasChanges = () => {
    return items.some(item => {
      const edited = editedItems[item.id];
      return edited && (
        edited.deliveredQuantity !== item.deliveredQuantity ||
        edited.unitPrice !== item.unitPrice
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Contract Items</span>
          </DialogTitle>
          <DialogDescription>
            Update delivered quantities and unit prices. Changes will be tracked in the approval history.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((item) => {
            const edited = editedItems[item.id] || { deliveredQuantity: item.deliveredQuantity, unitPrice: item.unitPrice };
            const hasItemChanges = edited.deliveredQuantity !== item.deliveredQuantity || edited.unitPrice !== item.unitPrice;
            
            return (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800">{item.description}</h4>
                  {hasItemChanges && (
                    <span className="text-orange-600 text-xs font-medium">Modified</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Delivered Quantity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Delivered Quantity</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Original: {item.deliveredQuantity}/{item.quantity}</Label>
                        <Input
                          value={item.deliveredQuantity}
                          disabled
                          className="bg-gray-50 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">New Value</Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={edited.deliveredQuantity}
                          onChange={(e) => handleItemChange(item.id, 'deliveredQuantity', e.target.value)}
                          className={`text-sm ${hasItemChanges ? 'border-orange-300' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Unit Price */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Unit Price</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Original: ${item.unitPrice}</Label>
                        <Input
                          value={`$${item.unitPrice}`}
                          disabled
                          className="bg-gray-50 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">New Value</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={edited.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            className={`text-sm pl-7 ${hasItemChanges ? 'border-orange-300' : ''}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Current vs New Total */}
                <div className="bg-gray-50 rounded p-2 text-sm">
                  <div className="flex justify-between">
                    <span>Original Total:</span>
                    <span className="font-mono">${(item.deliveredQuantity * item.unitPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>New Total:</span>
                    <span className={`font-mono ${hasItemChanges ? 'text-orange-600' : ''}`}>
                      ${(edited.deliveredQuantity * edited.unitPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div>
            <Label htmlFor="edit-comment">Change Reason (Optional)</Label>
            <Textarea
              id="edit-comment"
              placeholder="Explain why these items were modified..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasChanges() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractEditDialog;
