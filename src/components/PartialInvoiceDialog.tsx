
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, FileText, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatINR } from '../utils/currency';

interface Submission {
  id: string;
  trackingNumber: string;
  projectName: string;
  totalAmount: number;
  completionPercentage: number;
  invoicePercentage?: number;
  invoiceAmount?: number;
  invoiceStatus?: string;
}

interface PartialInvoiceDialogProps {
  submission: Submission;
  isOpen: boolean;
  onClose: () => void;
}

const PartialInvoiceDialog: React.FC<PartialInvoiceDialogProps> = ({
  submission,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [invoicePercentage, setInvoicePercentage] = useState(submission.invoicePercentage || 50);
  const [customPercentage, setCustomPercentage] = useState(submission.invoicePercentage || 50);

  const maxInvoicePercentage = Math.min(submission.completionPercentage, 100);
  const invoiceAmount = (submission.totalAmount * invoicePercentage) / 100;
  const previousInvoiceAmount = submission.invoiceAmount || 0;
  const netInvoiceAmount = invoiceAmount - previousInvoiceAmount;

  const handleSliderChange = (value: number[]) => {
    setInvoicePercentage(value[0]);
    setCustomPercentage(value[0]);
  };

  const handleCustomPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), maxInvoicePercentage);
    setCustomPercentage(value);
    setInvoicePercentage(value);
  };

  const handleSubmitInvoice = () => {
    if (invoicePercentage <= 0) {
      toast({
        title: "Invalid Percentage",
        description: "Invoice percentage must be greater than 0%",
        variant: "destructive"
      });
      return;
    }

    if (invoicePercentage > maxInvoicePercentage) {
      toast({
        title: "Invalid Percentage",
        description: `Invoice percentage cannot exceed completion percentage (${maxInvoicePercentage}%)`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invoice Submitted",
      description: `Partial invoice request for ${invoicePercentage}% (${formatINR(netInvoiceAmount)}) has been submitted successfully.`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Partial Invoice Request</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Submission Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-medium">{submission.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project</p>
                  <p className="font-medium">{submission.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">{formatINR(submission.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Work Completion</p>
                  <p className="font-medium">{submission.completionPercentage}%</p>
                </div>
              </div>
              
              {previousInvoiceAmount > 0 && (
                <>
                  <Separator />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Previous Invoice</p>
                    <p className="text-blue-700">{formatINR(previousInvoiceAmount)} ({submission.invoicePercentage}%)</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Invoice Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Percentage Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="percentage">Invoice Percentage</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="percentage"
                      type="number"
                      value={customPercentage}
                      onChange={handleCustomPercentageChange}
                      className="w-20"
                      min={0}
                      max={maxInvoicePercentage}
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                
                <Slider
                  value={[invoicePercentage]}
                  onValueChange={handleSliderChange}
                  max={maxInvoicePercentage}
                  min={0}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0%</span>
                  <span>Max: {maxInvoicePercentage}%</span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Amount Breakdown</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Project Value:</span>
                    <span className="font-medium">{formatINR(submission.totalAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Percentage:</span>
                    <span className="font-medium">{invoicePercentage}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Invoice Amount:</span>
                    <span className="font-medium">{formatINR(invoiceAmount)}</span>
                  </div>
                  
                  {previousInvoiceAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Less: Previous Invoice:</span>
                      <span className="font-medium">-{formatINR(previousInvoiceAmount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Net Payable Amount:</span>
                    <span>{formatINR(netInvoiceAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Validation Messages */}
              {invoicePercentage > maxInvoicePercentage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">
                    Invoice percentage cannot exceed work completion percentage ({maxInvoicePercentage}%)
                  </p>
                </div>
              )}

              {netInvoiceAmount <= 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    Net payable amount is zero or negative. Please adjust the invoice percentage.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitInvoice}
              disabled={invoicePercentage <= 0 || invoicePercentage > maxInvoicePercentage || netInvoiceAmount <= 0}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit Invoice Request</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartialInvoiceDialog;
