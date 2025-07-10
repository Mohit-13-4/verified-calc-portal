import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Save, Send, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ContractSubitem, QuantityEntry } from '../types/contract';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DateWiseEntryFormProps {
  subitem: ContractSubitem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subitemId: string, entry: Omit<QuantityEntry, 'id' | 'createdAt'>, isDraft: boolean) => void;
}

const DateWiseEntryForm: React.FC<DateWiseEntryFormProps> = ({
  subitem,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [quantity, setQuantity] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setSelectedDate(undefined);
    setQuantity('');
    setLength('');
    setBreadth('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const checkDateSubmissionOrder = (date: Date): boolean => {
    if (!subitem) return true;
    
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const existingEntries = subitem.entries
      .filter(entry => !entry.isDraft)
      .map(entry => entry.entryDate)
      .sort();
    
    if (existingEntries.length === 0) return true;
    
    const lastSubmittedDate = existingEntries[existingEntries.length - 1];
    
    // Check if there are any gaps in submitted dates
    const allDatesInRange: string[] = [];
    const startDate = new Date(existingEntries[0]);
    const endDate = new Date(selectedDateStr);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDatesInRange.push(format(d, 'yyyy-MM-dd'));
    }
    
    // Find missing dates between first submitted and selected date
    const missingDates = allDatesInRange.filter(dateStr => 
      !existingEntries.includes(dateStr) && dateStr !== selectedDateStr
    );
    
    return missingDates.length === 0;
  };

  const handleSave = (isDraft: boolean) => {
    if (!subitem || !selectedDate || !quantity) {
      toast({
        title: "Missing Information",
        description: "Please select a date and enter quantity",
        variant: "destructive"
      });
      return;
    }

    if (!isDraft && !checkDateSubmissionOrder(selectedDate)) {
      toast({
        title: "Date Order Error",
        description: "You must submit entries in chronological order. Previous dates are missing.",
        variant: "destructive"
      });
      return;
    }

    const entry: Omit<QuantityEntry, 'id' | 'createdAt'> = {
      subitemId: subitem.id,
      quantity: parseFloat(quantity),
      length: length ? parseFloat(length) : undefined,
      breadth: breadth ? parseFloat(breadth) : undefined,
      notes: notes || undefined,
      entryDate: format(selectedDate, 'yyyy-MM-dd'),
      isDraft
    };

    onSave(subitem.id, entry, isDraft);
    
    toast({
      title: isDraft ? "Draft Saved" : "Entry Submitted",
      description: isDraft 
        ? "Your progress has been saved as draft"
        : "Your entry has been submitted for review"
    });

    handleClose();
  };

  const getExistingEntries = () => {
    if (!subitem) return [];
    return subitem.entries.sort((a, b) => 
      new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
    );
  };

  if (!subitem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Date-wise Entry - {subitem.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Entries Timeline */}
          <div>
            <h4 className="font-medium mb-3">Previous Entries</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getExistingEntries().map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📅 {format(new Date(entry.entryDate), 'dd MMM yyyy')}</span>
                    <span className="text-sm font-medium">{entry.quantity} {subitem.unit}</span>
                  </div>
                  <Badge variant={entry.isDraft ? "secondary" : "outline"}>
                    {entry.isDraft ? "🟠 Draft" : "🔵 Submitted"}
                  </Badge>
                </div>
              ))}
              {getExistingEntries().length === 0 && (
                <p className="text-sm text-gray-500 italic">No entries yet</p>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label>Entry Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quantity Entry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Quantity * ({subitem.unit})</Label>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter quantity in ${subitem.unit}`}
              />
            </div>
            <div>
              <Label>Length (optional)</Label>
              <Input
                type="number"
                step="0.01"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Length"
              />
            </div>
            <div>
              <Label>Breadth (optional)</Label>
              <Input
                type="number"
                step="0.01"
                value={breadth}
                onChange={(e) => setBreadth(e.target.value)}
                placeholder="Breadth"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or observations"
              rows={3}
            />
          </div>

          {/* Submission Warning */}
          {selectedDate && !checkDateSubmissionOrder(selectedDate) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                You must submit entries in chronological order. Submit previous dates first.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={!selectedDate || !quantity}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={!selectedDate || !quantity || (selectedDate && !checkDateSubmissionOrder(selectedDate))}
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

export default DateWiseEntryForm;
