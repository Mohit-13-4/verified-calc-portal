
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

interface ValueEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newValues: Record<string, number>, comment: string) => void;
  originalValues: Record<string, number>;
  loading?: boolean;
}

const ValueEditDialog: React.FC<ValueEditDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  originalValues,
  loading = false
}) => {
  const [editedValues, setEditedValues] = useState<Record<string, number>>(originalValues);
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    if (open) {
      setEditedValues(originalValues);
      setComment('');
    }
  }, [open, originalValues]);

  const handleValueChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedValues(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const handleConfirm = () => {
    onConfirm(editedValues, comment);
  };

  const hasChanges = () => {
    return Object.keys(originalValues).some(key => 
      originalValues[key] !== editedValues[key]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Values</span>
          </DialogTitle>
          <DialogDescription>
            Modify the values submitted by the vendor. Changes will be tracked and visible to the next level.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(originalValues).map(([key, originalValue]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`value-${key}`}>
                {key} 
                {originalValue !== editedValues[key] && (
                  <span className="text-orange-600 text-xs ml-2">(Modified)</span>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Original</Label>
                  <Input
                    value={originalValue}
                    disabled
                    className="bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">New Value</Label>
                  <Input
                    id={`value-${key}`}
                    type="number"
                    value={editedValues[key]}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div>
            <Label htmlFor="edit-comment">Change Reason (Optional)</Label>
            <Textarea
              id="edit-comment"
              placeholder="Explain why these values were changed..."
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

export default ValueEditDialog;
