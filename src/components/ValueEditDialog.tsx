
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
  values: Record<string, number>;
  onSave: (updatedValues: Record<string, number>, comment: string) => void;
  onCancel: () => void;
}

const ValueEditDialog: React.FC<ValueEditDialogProps> = ({
  values,
  onSave,
  onCancel
}) => {
  const [editedValues, setEditedValues] = useState<Record<string, number>>(values);
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
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Edit Submission Values</span>
          </DialogTitle>
          <DialogDescription>
            Modify the values for this submission
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
          <Button variant="outline" onClick={onCancel}>
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
