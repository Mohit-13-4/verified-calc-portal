
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Send } from 'lucide-react';
import { InvoiceItem } from '../types/contract';
import { formatINR } from '../utils/currency';
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewProps {
  items: InvoiceItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  items, 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { toast } = useToast();
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const invoiceNumber = `INV-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString('en-IN');

  const handleSubmit = () => {
    onSubmit();
    toast({
      title: "Invoice Submitted",
      description: `Invoice ${invoiceNumber} has been submitted for approval`,
    });
    onClose();
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Invoice PDF download will begin shortly",
    });
  };

  if (items.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Tax Invoice</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Electronic Measurement Book System</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">#{invoiceNumber}</div>
                  <div className="text-sm text-gray-600">Date: {currentDate}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">From:</h4>
                  <p className="text-sm">ABC Construction Ltd</p>
                  <p className="text-sm text-gray-600">Vendor Registration No: VEND-001</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">To:</h4>
                  <p className="text-sm">Client Name</p>
                  <p className="text-sm text-gray-600">Project Department</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Item Description</th>
                      <th className="text-right py-3 px-2">Qty</th>
                      <th className="text-right py-3 px-2">Completed</th>
                      <th className="text-right py-3 px-2">Rate</th>
                      <th className="text-right py-3 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={`${item.contractId}-${item.subitemId}`} className="border-b">
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium text-sm">{item.itemName}</div>
                            <div className="text-xs text-gray-600">{item.subitemName}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {item.totalQuantity}
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {item.completedQuantity}
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {formatINR(item.rate)}
                        </td>
                        <td className="text-right py-3 px-2 text-sm font-medium">
                          {formatINR(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={4} className="py-3 px-2 text-right font-semibold">
                        Total Amount:
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-lg">
                        {formatINR(totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Status:</span>
                  <Badge variant="outline">As Applicable</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payment Terms:</span>
                  <span className="font-medium">Net 30 Days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;
