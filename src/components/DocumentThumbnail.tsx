import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, File, Download, Eye } from 'lucide-react';
import { DocumentAttachment } from '@/types/contract';
import { format } from 'date-fns';

interface DocumentThumbnailProps {
  document: DocumentAttachment;
  onPreview: (document: DocumentAttachment) => void;
  onDownload: (document: DocumentAttachment) => void;
}

const DocumentThumbnail: React.FC<DocumentThumbnailProps> = ({
  document,
  onPreview,
  onDownload
}) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (fileType.includes('image')) return <Image className="h-6 w-6 text-blue-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeDisplay = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'DOCX';
    if (fileType.includes('sheet')) return 'XLSX';
    if (fileType.includes('image')) return 'Image';
    return 'File';
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      {getFileIcon(document.fileType)}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{document.fileName}</p>
          <Badge variant="secondary" className="text-xs">
            {getFileTypeDisplay(document.fileType)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>•</span>
          <span>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
        </div>
        {document.notes && (
          <p className="text-xs text-gray-600 mt-1 truncate">{document.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(document)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(document)}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentThumbnail;