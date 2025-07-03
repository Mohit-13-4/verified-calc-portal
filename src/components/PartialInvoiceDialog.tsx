
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Receipt, 
  IndianRupee, 
  Calculator,
  FileText,
  Download
} from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  formula: string;
  totalValue: number;
  completionPercentage: number;
  vendor: string;
  description: string;
}

interface PartialInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission;
}

const PartialInvoiceDialog: React.FC<PartialInvoiceDialogProps> = ({
  open,
  onOpenChange,
  submission
}) => {
  const [invoicePercentage, setInvoicePercentage] = useState([submission.completionPercentage || 50]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateInvoiceAmount = () => {
    return (submission.totalValue * invoicePercentage[0]) / 100;
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Partial Invoice Generated",
        description: `Invoice for ${invoicePercentage[0]}% of work (₹${calculateInvoiceAmount().toLocaleString('en-IN')}) has been generated successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPreview = () => {
    toast({
      title: "Preview Downloaded",
      description: "Invoice preview has been downloaded to your device.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Generate Partial Invoice</span>
          </DialogTitle>
          <DialogDescription>
            Create an invoice for partially completed work on {submission.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{submission.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Submission ID:</span>
                  <span className="ml-2 font-mono">{submission.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Vendor:</span>
                  <span className="ml-2">{submission.vendor}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Formula:</span>
                  <span className="ml-2">{submission.formula}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Value:</span>
                  <span className="ml-2 font-bold text-green-600">
                    ₹{submission.totalValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Description:</span>
                <p className="text-sm text-gray-700 mt-1">{submission.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Invoice Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Percentage of work completed:
                  </label>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    {invoicePercentage[0]}%
                  </div>
                </div>
                <Slider
                  value={invoicePercentage}
                  onValueChange={setInvoicePercentage}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3">Invoice Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Project Value:</span>
                    <span className="font-mono">₹{submission.totalValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Work Completed:</span>
                    <span className="font-mono">{invoicePercentage[0]}%</span>
                  </div>
                  <div className="border-t border-green-300 pt-2 flex justify-between font-bold text-green-800">
                    <span>Invoice Amount:</span>
                    <span className="font-mono text-lg">
                      ₹{calculateInvoiceAmount().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Invoice Details</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Invoice will be generated for {invoicePercentage[0]}% of completed work</div>
                  <div>• Payment terms: 30 days from invoice date</div>
                  <div>• GST will be calculated as per applicable rates</div>
                  <div>• Supporting documents will be attached automatically</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDownloadPreview}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Preview Invoice</span>
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateInvoice}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Receipt className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate Invoice"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartialInvoiceDialog;
