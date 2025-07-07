
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react';

interface RejectionDialogProps {
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  onConfirm,
  onCancel
}) => {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (comment.trim()) {
      onConfirm(comment.trim());
      setComment('');
    }
  };

  const handleCancel = () => {
    setComment('');
    onCancel();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Reject Submission</span>
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this submission. This will be sent to the vendor.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-comment">Rejection Reason *</Label>
            <Textarea
              id="rejection-comment"
              placeholder="Explain why this submission is being rejected..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!comment.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;
