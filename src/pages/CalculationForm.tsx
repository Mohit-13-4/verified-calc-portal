
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Save, Upload, FileText, X, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { evaluate } from 'mathjs';

const predefinedFormulas = [
  {
    id: 'concrete-volume',
    name: 'Concrete Volume',
    expression: 'Block1 * Block2 * Block3',
    description: 'Calculate concrete volume using length, breadth, and height',
    blocks: [
      { name: 'Length', description: 'Length in meters measured on site from end to end' },
      { name: 'Breadth', description: 'Width between shuttering faces in meters' },
      { name: 'Height', description: 'Concrete depth from base to top surface in meters' }
    ]
  },
  {
    id: 'material-cost',
    name: 'Material Cost Analysis',
    expression: 'Block1 + Block2 + Block3',
    description: 'Standard material cost calculation including labor and overhead',
    blocks: [
      { name: 'Material Cost', description: 'Total cost of raw materials including transport' },
      { name: 'Labor Cost', description: 'Manpower cost including skilled and unskilled workers' },
      { name: 'Overhead', description: 'Administrative and indirect costs' }
    ]
  },
  {
    id: 'project-budget',
    name: 'Project Budget Estimation',
    expression: '(Block1 * Block2) + Block3',
    description: 'Project budget with markup and fixed costs',
    blocks: [
      { name: 'Direct Costs', description: 'Direct project expenses including materials and labor' },
      { name: 'Markup Factor', description: 'Profit margin multiplier (e.g., 1.2 for 20% markup)' },
      { name: 'Fixed Costs', description: 'One-time setup and equipment costs' }
    ]
  },
  {
    id: 'excavation-area',
    name: 'Excavation Area Calculation',
    expression: 'Block1 * Block2 * Block3 - Block4',
    description: 'Calculate excavation area with depth adjustment',
    blocks: [
      { name: 'Length', description: 'Excavation length as per site survey in meters' },
      { name: 'Width', description: 'Excavation width including working space in meters' },
      { name: 'Depth', description: 'Required excavation depth below ground level in meters' },
      { name: 'Exclusion Area', description: 'Areas to exclude like existing structures in cubic meters' }
    ]
  }
];

const CalculationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFormula, setSelectedFormula] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<number>(0);

  const currentFormula = predefinedFormulas.find(f => f.id === selectedFormula);

  const handleFormulaSelect = (formulaId: string) => {
    setSelectedFormula(formulaId);
    setFormData({});
    setCalculatedResult(0);
    const formula = predefinedFormulas.find(f => f.id === formulaId);
    if (formula) {
      setTitle(formula.name);
      setDescription(formula.description);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const calculateResult = () => {
    if (!currentFormula) return 0;
    
    try {
      // Create a scope with block values
      const scope: Record<string, number> = {};
      currentFormula.blocks.forEach((block, index) => {
        const blockKey = `Block${index + 1}`;
        scope[blockKey] = parseFloat(formData[blockKey]) || 0;
      });
      
      // Only calculate if we have at least one non-zero value
      const hasValues = Object.values(scope).some(value => value > 0);
      if (!hasValues) return 0;
      
      // Evaluate the expression using mathjs
      const result = evaluate(currentFormula.expression, scope);
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      console.error('Error calculating formula:', error);
      return 0;
    }
  };

  // Real-time calculation whenever form data changes
  useEffect(() => {
    if (currentFormula) {
      const result = calculateResult();
      setCalculatedResult(result);
    }
  }, [formData, currentFormula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const calculationId = `CALC-${Date.now().toString().slice(-3).padStart(3, '0')}`;
    
    toast({
      title: "Calculation Submitted Successfully",
      description: `Your calculation (${calculationId}) has been submitted for review.`,
    });

    // Clear uploaded file
    setUploadedFile(null);
    setFormData({});
    setCalculatedResult(0);
    
    setIsSubmitting(false);
    navigate('/vendor/dashboard');
  };

  const getFieldLabel = (blockIndex: number) => {
    if (!currentFormula) return '';
    const block = currentFormula.blocks[blockIndex];
    return block ? block.name : `Block ${blockIndex + 1}`;
  };

  const getFieldDescription = (blockIndex: number) => {
    if (!currentFormula) return '';
    const block = currentFormula.blocks[blockIndex];
    return block ? block.description : '';
  };

  return (
    <TooltipProvider>
      <Layout title="New Calculation">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vendor/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submit New Calculation</h2>
            <p className="text-gray-600">Use predefined formulas for accurate calculations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formula Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Select Formula</span>
              </CardTitle>
              <CardDescription>
                Choose from pre-approved calculation formulas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="formula">Formula Type</Label>
                <Select value={selectedFormula} onValueChange={handleFormulaSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a calculation formula" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedFormulas.map((formula) => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentFormula && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Formula:</strong> {currentFormula.expression}</div>
                      <div><strong>Description:</strong> {currentFormula.description}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Calculation Details */}
          {selectedFormula && (
            <Card>
              <CardHeader>
                <CardTitle>Calculation Details</CardTitle>
                <CardDescription>
                  Provide the calculation title and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Calculation Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional context or notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Fields */}
          {currentFormula && (
            <Card>
              <CardHeader>
                <CardTitle>Input Values</CardTitle>
                <CardDescription>
                  Enter the values for calculation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFormula.blocks.map((block, index) => {
                    const blockKey = `Block${index + 1}`;
                    const fieldDescription = getFieldDescription(index);
                    return (
                      <div key={blockKey}>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={blockKey}>{getFieldLabel(index)}</Label>
                          {fieldDescription && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">{fieldDescription}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <Input
                          id={blockKey}
                          type="number"
                          step="0.01"
                          value={formData[blockKey] || ''}
                          onChange={(e) => handleFieldChange(blockKey, e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    );
                  })}
                </div>

                {calculatedResult > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Calculated Result:</span>
                      <span className="text-2xl font-bold text-green-900">
                        {calculatedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* PDF Upload Section */}
          {selectedFormula && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Supporting Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload a PDF document to support your calculation (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-gray-600">Upload a PDF file</p>
                      <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
                    </div>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose PDF File
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">{uploadedFile.name}</div>
                        <div className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeUploadedFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ERP Integration Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              <div className="flex items-center space-x-2">
                <span className="font-medium">ERP Integration:</span>
                <span>This calculation will be flagged as ERP-ready upon approval for future system integration.</span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          {selectedFormula && (
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/vendor/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Calculation
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
        </div>
      </Layout>
    </TooltipProvider>
  );
};

export default CalculationForm;
