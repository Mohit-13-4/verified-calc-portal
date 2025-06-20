
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const predefinedFormulas = [
  {
    id: 'material-cost',
    name: 'Material Cost Analysis',
    formula: 'Material Cost + Labor Cost + Overhead',
    description: 'Standard material cost calculation including labor and overhead',
    fields: ['materialCost', 'laborCost', 'overhead']
  },
  {
    id: 'project-budget',
    name: 'Project Budget Estimation',
    formula: '(Direct Costs × Markup Factor) + Fixed Costs',
    description: 'Project budget with markup and fixed costs',
    fields: ['directCosts', 'markupFactor', 'fixedCosts']
  },
  {
    id: 'revenue-projection',
    name: 'Revenue Projection',
    formula: 'Base Revenue × (1 + Growth Rate) + Additional Revenue',
    description: 'Revenue projection with growth factor',
    fields: ['baseRevenue', 'growthRate', 'additionalRevenue']
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

  const currentFormula = predefinedFormulas.find(f => f.id === selectedFormula);

  const handleFormulaSelect = (formulaId: string) => {
    setSelectedFormula(formulaId);
    setFormData({});
    const formula = predefinedFormulas.find(f => f.id === formulaId);
    if (formula) {
      setTitle(formula.name);
      setDescription(formula.description);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateResult = () => {
    if (!currentFormula) return 0;
    
    // Simple calculation logic based on formula type
    const values = currentFormula.fields.map(field => parseFloat(formData[field]) || 0);
    
    switch (currentFormula.id) {
      case 'material-cost':
        return values[0] + values[1] + values[2]; // Material + Labor + Overhead
      case 'project-budget':
        return (values[0] * (values[1] || 1)) + values[2]; // (Direct × Markup) + Fixed
      case 'revenue-projection':
        return values[0] * (1 + (values[1] || 0) / 100) + values[2]; // Base × (1 + Growth%) + Additional
      default:
        return 0;
    }
  };

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

    setIsSubmitting(false);
    navigate('/vendor/dashboard');
  };

  const getFieldLabel = (field: string) => {
    const labelMap: Record<string, string> = {
      materialCost: 'Material Cost ($)',
      laborCost: 'Labor Cost ($)', 
      overhead: 'Overhead Cost ($)',
      directCosts: 'Direct Costs ($)',
      markupFactor: 'Markup Factor',
      fixedCosts: 'Fixed Costs ($)',
      baseRevenue: 'Base Revenue ($)',
      growthRate: 'Growth Rate (%)',
      additionalRevenue: 'Additional Revenue ($)'
    };
    return labelMap[field] || field;
  };

  const calculatedResult = calculateResult();

  return (
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
                      <div><strong>Formula:</strong> {currentFormula.formula}</div>
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
                  {currentFormula.fields.map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{getFieldLabel(field)}</Label>
                      <Input
                        id={field}
                        type="number"
                        step="0.01"
                        value={formData[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  ))}
                </div>

                {calculatedResult > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Calculated Result:</span>
                      <span className="text-2xl font-bold text-green-900">
                        ${calculatedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
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
  );
};

export default CalculationForm;
