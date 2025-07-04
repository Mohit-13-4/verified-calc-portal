
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Save, Send, Upload, X } from 'lucide-react';
import { ContractSubitem, QuantityEntry } from '../types/contract';
import { formatINR } from '../utils/currency';
import { useToast } from "@/hooks/use-toast";

interface SubitemEntryFormProps {
  subitem: ContractSubitem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subitemId: string, entry: Omit<QuantityEntry, 'id' | 'createdAt'>, isDraft: boolean) => void;
}

const SubitemEntryForm: React.FC<SubitemEntryFormProps> = ({ 
  subitem, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    quantity: '',
    length: '',
    breadth: '',
    notes: '',
    attachments: [] as string[]
  });

  useEffect(() => {
    if (subitem) {
      setFormData({
        quantity: '',
        length: '',
        breadth: '',
        notes: '',
        attachments: []
      });
    }
  }, [subitem]);

  if (!subitem) return null;

  const progress = subitem.totalQuantity > 0 
    ? Math.round((subitem.completedQuantity / subitem.totalQuantity) * 100) 
    : 0;

  const remainingQuantity = subitem.totalQuantity - subitem.completedQuantity;
  const newQuantity = parseFloat(formData.quantity) || 0;
  const calculatedArea = formData.length && formData.breadth 
    ? parseFloat(formData.length) * parseFloat(formData.breadth)
    : 0;

  const finalQuantity = calculatedArea > 0 ? calculatedArea : newQuantity;

  const handleSave = (isDraft: boolean) => {
    if (!finalQuantity || finalQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity or dimensions",
        variant: "destructive"
      });
      return;
    }

    if (finalQuantity > remainingQuantity) {
      toast({
        title: "Quantity Exceeds Limit",
        description: `Cannot exceed remaining quantity of ${remainingQuantity} ${subitem.unit}`,
        variant: "destructive"
      });
      return;
    }

    const entry: Omit<QuantityEntry, 'id' | 'createdAt'> = {
      subitemId: subitem.id,
      quantity: finalQuantity,
      length: parseFloat(formData.length) || undefined,
      breadth: parseFloat(formData.breadth) || undefined,
      notes: formData.notes || undefined,
      attachments: formData.attachments,
      isDraft
    };

    onSave(subitem.id, entry, isDraft);
    
    toast({
      title: isDraft ? "Draft Saved" : "Entry Submitted",
      description: isDraft 
        ? "Your progress has been saved as draft"
        : "Your entry has been submitted for review"
    });
    
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subitem.name}</DialogTitle>
          <p className="text-sm text-gray-600">{subitem.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm text-gray-600">Total Quantity: </span>
                <span className="font-medium">{subitem.totalQuantity} {subitem.unit}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Completed: </span>
                <span className="font-medium">{subitem.completedQuantity} {subitem.unit}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Remaining: </span>
                <span className="font-medium text-orange-600">{remainingQuantity} {subitem.unit}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Rate: </span>
                <span className="font-medium">{formatINR(subitem.rate)} per {subitem.unit}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress: {progress}%</span>
              <Badge className="bg-orange-500 text-white">
                {subitem.status}
              </Badge>
            </div>
          </div>

          {/* Entry Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="length">Length (optional)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="Enter length"
                  value={formData.length}
                  onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="breadth">Breadth (optional)</Label>
                <Input
                  id="breadth"
                  type="number"
                  placeholder="Enter breadth"
                  value={formData.breadth}
                  onChange={(e) => setFormData(prev => ({ ...prev, breadth: e.target.value }))}
                />
              </div>
            </div>

            {calculatedArea > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-sm text-blue-800">
                  Calculated Area: {calculatedArea.toFixed(2)} {subitem.unit}
                </span>
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Quantity Worked {!calculatedArea && '*'}</Label>
              <Input
                id="quantity"
                type="number"
                placeholder={`Enter quantity in ${subitem.unit}`}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                disabled={calculatedArea > 0}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or comments"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Attachments (optional)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estimated Value */}
            {finalQuantity > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="text-sm text-green-800">
                  Estimated Value: {formatINR(finalQuantity * subitem.rate)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubitemEntryForm;
