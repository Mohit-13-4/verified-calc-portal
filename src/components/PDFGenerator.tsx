
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  vendor: string;
  formula: string;
  status: string;
  submittedAt: string;
  description: string;
  values: Record<string, number>;
  result: number;
  completionPercentage?: number;
  l1Comment?: string;
  l2Comment?: string;
  rejectionComment?: string;
}

interface PDFGeneratorProps {
  submission: Submission;
  type: 'submission' | 'invoice';
  className?: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  submission, 
  type = 'submission',
  className = "" 
}) => {
  const { toast } = useToast();

  const generatePDF = () => {
    // Mock PDF generation - in real app would use jspdf or html2pdf
    const pdfContent = {
      title: type === 'invoice' ? 'Invoice Document' : 'Submission Report',
      submissionId: submission.id,
      vendor: submission.vendor,
      formula: submission.formula,
      values: submission.values,
      result: submission.result,
      status: submission.status,
      completionPercentage: submission.completionPercentage || 0,
      generatedAt: new Date().toISOString(),
      description: submission.description
    };

    // Simulate PDF generation process
    console.log('Generating PDF with content:', pdfContent);
    
    // Create mock blob for download
    const mockPDFContent = JSON.stringify(pdfContent, null, 2);
    const blob = new Blob([mockPDFContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${submission.id}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "PDF Generated",
      description: `${type === 'invoice' ? 'Invoice' : 'Submission'} document has been downloaded successfully.`,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      className={`flex items-center space-x-2 ${className}`}
    >
      {type === 'invoice' ? (
        <FileText className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>
        {type === 'invoice' ? 'Generate Invoice' : 'Download PDF'}
      </span>
    </Button>
  );
};

export default PDFGenerator;
