
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
import { Badge } from "@/components/ui/badge";
import { Calculator, Save, X } from 'lucide-react';

interface ValueEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    values: Record<string, number>;
    l1EditedValues?: Record<string, number>;
    l2EditedValues?: Record<string, number>;
  };
  userRole: string;
  onSave: (updatedValues: Record<string, number>, comment: string) => void;
}

const ValueEditDialog: React.FC<ValueEditDialogProps> = ({
  open,
  onOpenChange,
  submission,
  userRole,
  onSave
}) => {
  // Use the most recent values based on user role
  const getCurrentValues = () => {
    if (userRole === 'level3' && submission.l2EditedValues) {
      return submission.l2EditedValues;
    }
    if ((userRole === 'level2' || userRole === 'level3') && submission.l1EditedValues) {
      return submission.l1EditedValues;
    }
    return submission.values;
  };

  const [editedValues, setEditedValues] = useState<Record<string, number>>(getCurrentValues());
  const [comment, setComment] = useState('');

  const handleValueChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedValues(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const handleSave = () => {
    onSave(editedValues, comment);
    setComment('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedValues(getCurrentValues());
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Edit Submission Values</span>
          </DialogTitle>
          <DialogDescription>
            Modify the values for this submission as {userRole}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(editedValues).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  className="font-mono"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Required)</Label>
            <Textarea
              id="comment"
              placeholder="Enter your review comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!comment.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValueEditDialog;
