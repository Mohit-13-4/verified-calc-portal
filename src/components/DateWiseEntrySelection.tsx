
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, AlertTriangle, Receipt, Clock } from 'lucide-react';
import { ContractSubitem, QuantityEntry, DateWiseEntry } from '../types/contract';
import { formatINR } from '../utils/currency';
import { format, parseISO, isBefore } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface DateWiseEntrySelectionProps {
  subitem: ContractSubitem;
  onGenerateInvoice: (selectedEntries: QuantityEntry[]) => void;
  onSubmitEntries: (selectedEntries: QuantityEntry[]) => void;
}

const DateWiseEntrySelection: React.FC<DateWiseEntrySelectionProps> = ({ 
  subitem, 
  onGenerateInvoice,
  onSubmitEntries
}) => {
  const { toast } = useToast();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Sort entries by date
  const sortedEntries = subitem.entries.sort((a, b) => 
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  const getStatusBadge = (entry: QuantityEntry) => {
    if (!entry.isDraft) {
      return <Badge className="bg-green-100 text-green-800">🟢 Submitted</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800">🟠 Draft</Badge>;
  };

  const canSelectEntry = (entryIndex: number): boolean => {
    // Check if all previous entries are submitted
    for (let i = 0; i < entryIndex; i++) {
      if (sortedEntries[i].isDraft) {
        return false;
      }
    }
    return true;
  };

  const getValidationMessage = (entryIndex: number): string | null => {
    if (!canSelectEntry(entryIndex)) {
      const earliestDraftDate = sortedEntries
        .slice(0, entryIndex)
        .find(entry => entry.isDraft)?.entryDate;
      
      if (earliestDraftDate) {
        return `Please submit entries for earlier dates (${format(parseISO(earliestDraftDate), 'dd MMM yyyy')}) before proceeding.`;
      }
    }
    return null;
  };

  const handleEntrySelection = (entryId: string, entryIndex: number) => {
    const validationMessage = getValidationMessage(entryIndex);
    
    if (validationMessage) {
      toast({
        title: "Cannot Select Entry",
        description: validationMessage,
        variant: "destructive"
      });
      return;
    }

    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const getSelectedEntriesData = (): QuantityEntry[] => {
    return sortedEntries.filter(entry => selectedEntries.includes(entry.id));
  };

  const getTotalSelectedQuantity = (): number => {
    return getSelectedEntriesData().reduce((sum, entry) => sum + entry.quantity, 0);
  };

  const getTotalSelectedAmount = (): number => {
    return getTotalSelectedQuantity() * subitem.rate;
  };

  const getProgressPercentage = (): number => {
    const completedQuantity = sortedEntries
      .filter(entry => !entry.isDraft)
      .reduce((sum, entry) => sum + entry.quantity, 0);
    
    return subitem.totalQuantity > 0 
      ? Math.round((completedQuantity / subitem.totalQuantity) * 100) 
      : 0;
  };

  const handleGenerateInvoice = () => {
    if (selectedEntries.length === 0) {
      toast({
        title: "No Entries Selected",
        description: "Please select at least one entry to generate an invoice",
        variant: "destructive"
      });
      return;
    }

    onGenerateInvoice(getSelectedEntriesData());
  };

  const handleSubmitSelected = () => {
    if (selectedEntries.length === 0) {
      toast({
        title: "No Entries Selected",
        description: "Please select at least one entry to submit",
        variant: "destructive"
      });
      return;
    }

    const selectedData = getSelectedEntriesData();
    const draftEntries = selectedData.filter(entry => entry.isDraft);

    if (draftEntries.length === 0) {
      toast({
        title: "No Draft Entries",
        description: "Selected entries are already submitted",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Confirmation Required",
      description: `You are about to submit entries for ${draftEntries.length} date${draftEntries.length > 1 ? 's' : ''}. Proceed?`,
    });

    // Proceed with submission
    onSubmitEntries(draftEntries);
    setSelectedEntries([]);
  };

  if (sortedEntries.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6 text-center text-gray-500">
          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No date-wise entries recorded yet.</p>
          <p className="text-sm">Add entries using the "Add Entry" button above.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date-wise Entries
          </CardTitle>
          <div className="text-sm text-gray-600">
            Progress: {getProgressPercentage()}%
          </div>
        </div>
        <Progress value={getProgressPercentage()} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Select</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Quantity</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry, index) => {
                  const canSelect = canSelectEntry(index);
                  const validationMessage = getValidationMessage(index);
                  const isSelected = selectedEntries.includes(entry.id);
                  
                  return (
                    <tr key={entry.id} className={`border-b ${!canSelect ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-2">
                        <div className="flex flex-col items-start gap-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleEntrySelection(entry.id, index)}
                            disabled={!canSelect}
                            className={!canSelect ? 'opacity-50' : ''}
                          />
                          {!canSelect && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">
                          {format(parseISO(entry.entryDate), 'dd MMM yyyy')}
                        </div>
                        {validationMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            {validationMessage}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {entry.quantity} {subitem.unit}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatINR(entry.quantity * subitem.rate)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {getStatusBadge(entry)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {entry.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selection Summary */}
          {selectedEntries.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">
                    {selectedEntries.length} date{selectedEntries.length > 1 ? 's' : ''} selected
                  </div>
                  <div className="text-sm text-blue-700">
                    Total: {getTotalSelectedQuantity()} {subitem.unit} • {formatINR(getTotalSelectedAmount())}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmitSelected}
                    className="flex items-center gap-1"
                  >
                    Submit Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateInvoice}
                    className="flex items-center gap-1"
                  >
                    <Receipt className="h-4 w-4" />
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Clear Selection */}
          {selectedEntries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedEntries([])}
              className="w-full"
            >
              Clear Selection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateWiseEntrySelection;
