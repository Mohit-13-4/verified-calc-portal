import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import { QuantityEntry, DocumentAttachment } from '@/types/contract';
import { format } from 'date-fns';
import DocumentThumbnail from './DocumentThumbnail';

interface EntryTimelineProps {
  entries: QuantityEntry[];
  onPreviewDocument: (document: DocumentAttachment) => void;
  onDownloadDocument: (document: DocumentAttachment) => void;
}

const EntryTimeline: React.FC<EntryTimelineProps> = ({
  entries,
  onPreviewDocument,
  onDownloadDocument
}) => {
  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.entryDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, QuantityEntry[]>);

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(entriesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (sortedDates.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-center text-gray-500">
          <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No entries with documents yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {sortedDates.map((date) => {
        const dayEntries = entriesByDate[date];
        const totalQuantity = dayEntries.reduce((sum, entry) => sum + entry.quantity, 0);
        const totalDocuments = dayEntries.reduce((sum, entry) => sum + (entry.attachments?.length || 0), 0);

        return (
          <Card key={date} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              {/* Date Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{format(new Date(date), 'EEEE, MMMM dd, yyyy')}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(dayEntries[0].isDraft ? 'draft' : 'submitted')}
                  <Badge variant="outline">{totalQuantity} units</Badge>
                  {totalDocuments > 0 && (
                    <Badge variant="outline">{totalDocuments} document{totalDocuments > 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </div>

              {/* Entries for this date */}
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="pl-4 border-l-2 border-gray-200">
                    {/* Entry Details */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Quantity: <span className="font-medium">{entry.quantity}</span>
                        {entry.length && entry.breadth && (
                          <span className="ml-2">
                            ({entry.length} × {entry.breadth})
                          </span>
                        )}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Notes:</span> {entry.notes}
                        </p>
                      )}
                    </div>

                    {/* Document Attachments */}
                    {entry.attachments && entry.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Documents:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {entry.attachments.map((document) => (
                            <DocumentThumbnail
                              key={document.id}
                              document={document}
                              onPreview={onPreviewDocument}
                              onDownload={onDownloadDocument}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EntryTimeline;