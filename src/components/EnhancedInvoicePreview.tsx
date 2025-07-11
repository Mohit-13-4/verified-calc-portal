
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Send, Eye, FileText, Calendar } from 'lucide-react';
import { InvoiceItem } from '../types/contract';
import { formatINR } from '../utils/currency';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

interface EnhancedInvoicePreviewProps {
  items: InvoiceItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  projectName: string;
}

const EnhancedInvoicePreview: React.FC<EnhancedInvoicePreviewProps> = ({ 
  items, 
  isOpen, 
  onClose, 
  onSubmit,
  projectName
}) => {
  const { toast } = useToast();
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const invoiceNumber = `INV-${Date.now()}`;
  const currentDate = new Date().toLocaleDateString('en-IN');

  // Group items by status for better visualization
  const itemsByStatus = items.reduce((acc, item) => {
    if (!acc[item.status]) acc[item.status] = [];
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, InvoiceItem[]>);

  const handleSubmit = () => {
    onSubmit();
    toast({
      title: "Invoice Submitted",
      description: `Invoice ${invoiceNumber} has been submitted for approval`,
    });
    onClose();
  };

  const handlePreviewPDF = () => {
    toast({
      title: "PDF Preview",
      description: "PDF preview will open in a new window",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Invoice PDF download will begin shortly",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-800">🟠 Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">🔵 Submitted</Badge>;
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">🟢 Ready</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (items.length === 0) return null;

  // Check if this is a date-wise invoice (has selected entries)
  const isDateWiseInvoice = items.some(item => item.selectedEntries && item.selectedEntries.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Preview - {projectName}
            {isDateWiseInvoice && (
              <Badge className="bg-blue-100 text-blue-800">
                <Calendar className="h-3 w-3 mr-1" />
                Date-wise Invoice
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardHeader className="bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-blue-900">Tax Invoice</CardTitle>
                  <p className="text-sm text-blue-700 mt-1">Electronic Measurement Book System</p>
                  <p className="text-lg font-semibold text-blue-800 mt-2">{projectName}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">#{invoiceNumber}</div>
                  <div className="text-sm text-gray-600">Date: {currentDate}</div>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    {items.length} Items Selected
                  </Badge>
                  {isDateWiseInvoice && (
                    <Badge className="mt-1 bg-green-100 text-green-800 block">
                      Date-wise Billing
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">From:</h4>
                  <p className="text-sm">ABC Construction Ltd</p>
                  <p className="text-sm text-gray-600">Vendor Registration No: VEND-001</p>
                  <p className="text-sm text-gray-600">Contact: +91 98765 43210</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">To:</h4>
                  <p className="text-sm">Project Authority</p>
                  <p className="text-sm text-gray-600">Engineering Department</p>
                  <p className="text-sm text-gray-600">Government of India</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {itemsByStatus.draft?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Draft Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {itemsByStatus.submitted?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Submitted Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatINR(totalAmount)}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Work Items Breakdown
                {isDateWiseInvoice && (
                  <span className="text-sm font-normal text-gray-600 ml-2">(Date-wise entries)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold">Item Description</th>
                      <th className="text-center py-3 px-2 font-semibold">Status</th>
                      {isDateWiseInvoice && (
                        <th className="text-center py-3 px-2 font-semibold">Dates</th>
                      )}
                      <th className="text-right py-3 px-2 font-semibold">Total Qty</th>
                      <th className="text-right py-3 px-2 font-semibold">Completed</th>
                      <th className="text-right py-3 px-2 font-semibold">Rate</th>
                      <th className="text-right py-3 px-2 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <React.Fragment key={`${item.contractId}-${item.subitemId}`}>
                        <tr className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium text-sm">{item.itemName}</div>
                              <div className="text-xs text-gray-600">{item.subitemName}</div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            {getStatusBadge(item.status)}
                          </td>
                          {isDateWiseInvoice && (
                            <td className="text-center py-3 px-2">
                              {item.selectedEntries && item.selectedEntries.length > 0 ? (
                                <div className="text-xs">
                                  <Badge variant="outline" className="text-xs">
                                    {item.selectedEntries.length} dates
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">All dates</span>
                              )}
                            </td>
                          )}
                          <td className="text-right py-3 px-2 text-sm">
                            {item.totalQuantity}
                          </td>
                          <td className="text-right py-3 px-2 text-sm font-medium">
                            {item.completedQuantity}
                          </td>
                          <td className="text-right py-3 px-2 text-sm">
                            {formatINR(item.rate)}
                          </td>
                          <td className="text-right py-3 px-2 text-sm font-bold">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                        
                        {/* Date-wise breakdown if available */}
                        {item.selectedEntries && item.selectedEntries.length > 0 && (
                          <tr className="bg-blue-50">
                            <td colSpan={isDateWiseInvoice ? 7 : 6} className="py-2 px-4">
                              <div className="text-xs text-blue-800">
                                <div className="font-medium mb-1">Selected Date-wise Entries:</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {item.selectedEntries.map((entry) => (
                                    <div key={entry.id} className="flex justify-between">
                                      <span>{format(parseISO(entry.entryDate), 'dd MMM')}</span>
                                      <span>{entry.quantity} units</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Separator className="my-4" />
              
              {/* Total Section */}
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatINR(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST (18%):</span>
                      <span>{formatINR(totalAmount * 0.18)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>{formatINR(totalAmount * 1.18)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Net 30 Days from invoice date</li>
                    <li>• All measurements verified by Level 3 approver</li>
                    <li>• GST as applicable</li>
                    {isDateWiseInvoice && (
                      <li>• Date-wise entries verified chronologically</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Submission Status:</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Draft Items:</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {itemsByStatus.draft?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Submitted:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {itemsByStatus.submitted?.length || 0}
                      </Badge>
                    </div>
                    {isDateWiseInvoice && (
                      <div className="flex justify-between">
                        <span>Date-wise:</span>
                        <Badge className="bg-green-100 text-green-800">
                          Yes
                        </Badge>
                      </div>
                    )}
                  </div>
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
              onClick={handlePreviewPDF}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Invoice
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

export default EnhancedInvoicePreview;
