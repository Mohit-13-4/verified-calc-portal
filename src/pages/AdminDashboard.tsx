
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Users, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Eye,
  Pencil,
  Trash2,
  IndianRupee
} from 'lucide-react';

// Mock formulas data
const mockFormulas = [
  {
    id: 1,
    name: "Concrete Volume",
    expression: "Block1 * Block2 * Block3",
    description: "Calculate concrete volume for construction",
    blocks: [
      { name: "Block1", label: "Length", description: "Length in meters measured on site" },
      { name: "Block2", label: "Breadth", description: "Width between shuttering faces" },
      { name: "Block3", label: "Height", description: "Concrete depth from base to top surface" }
    ],
    createdAt: "2024-01-15",
    isActive: true
  },
  {
    id: 2,
    name: "Steel Weight",
    expression: "Block1 * Block2 * 7850",
    description: "Calculate steel weight based on dimensions",
    blocks: [
      { name: "Block1", label: "Volume", description: "Total volume of steel in cubic meters" },
      { name: "Block2", label: "Density Factor", description: "Density adjustment factor" }
    ],
    createdAt: "2024-01-10",
    isActive: true
  },
  {
    id: 3,
    name: "Area Calculation",
    expression: "Block1 * Block2",
    description: "Simple area calculation for surfaces",
    blocks: [
      { name: "Block1", label: "Length", description: "Length measurement in meters" },
      { name: "Block2", label: "Width", description: "Width measurement in meters" }
    ],
    createdAt: "2024-01-08",
    isActive: false
  }
];

// Mock statistics data
const mockStats = {
  totalUsers: 45,
  activeSubmissions: 28,
  totalFormulas: 12,
  monthlyRevenue: 2845000
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const [formulas, setFormulas] = useState(mockFormulas);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [newFormula, setNewFormula] = useState({
    name: '',
    expression: '',
    description: '',
    blocks: [{ name: 'Block1', label: '', description: '' }]
  });

  const handleViewFormula = (formula: any) => {
    setSelectedFormula(formula);
    setShowViewDialog(true);
  };

  const handleEditFormula = (formula: any) => {
    setSelectedFormula(formula);
    setNewFormula({
      name: formula.name,
      expression: formula.expression,
      description: formula.description,
      blocks: [...formula.blocks]
    });
    setShowEditDialog(true);
  };

  const handleDeleteFormula = (formula: any) => {
    setSelectedFormula(formula);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedFormula) {
      setFormulas(formulas.filter(f => f.id !== selectedFormula.id));
      toast({
        title: "Formula Deleted",
        description: `Formula "${selectedFormula.name}" has been successfully deleted.`,
      });
      setShowDeleteDialog(false);
      setSelectedFormula(null);
    }
  };

  const handleSaveFormula = () => {
    if (selectedFormula) {
      // Edit existing formula
      setFormulas(formulas.map(f => 
        f.id === selectedFormula.id 
          ? { ...f, ...newFormula }
          : f
      ));
      toast({
        title: "Formula Updated",
        description: `Formula "${newFormula.name}" has been successfully updated.`,
      });
      setShowEditDialog(false);
    } else {
      // Add new formula
      const newId = Math.max(...formulas.map(f => f.id)) + 1;
      setFormulas([...formulas, {
        ...newFormula,
        id: newId,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      }]);
      toast({
        title: "Formula Added",
        description: `Formula "${newFormula.name}" has been successfully added.`,
      });
      setShowAddDialog(false);
    }
    
    // Reset form
    setNewFormula({
      name: '',
      expression: '',
      description: '',
      blocks: [{ name: 'Block1', label: '', description: '' }]
    });
    setSelectedFormula(null);
  };

  const addBlock = () => {
    const blockCount = newFormula.blocks.length + 1;
    setNewFormula({
      ...newFormula,
      blocks: [...newFormula.blocks, { name: `Block${blockCount}`, label: '', description: '' }]
    });
  };

  const removeBlock = (index: number) => {
    if (newFormula.blocks.length > 1) {
      setNewFormula({
        ...newFormula,
        blocks: newFormula.blocks.filter((_, i) => i !== index)
      });
    }
  };

  const updateBlock = (index: number, field: string, value: string) => {
    const updatedBlocks = [...newFormula.blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setNewFormula({ ...newFormula, blocks: updatedBlocks });
  };

  const FormulaFormContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Formula Name</Label>
        <Input
          id="name"
          value={newFormula.name}
          onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
          placeholder="Enter formula name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={newFormula.description}
          onChange={(e) => setNewFormula({ ...newFormula, description: e.target.value })}
          placeholder="Enter formula description"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expression">Formula Expression</Label>
        <Input
          id="expression"
          value={newFormula.expression}
          onChange={(e) => setNewFormula({ ...newFormula, expression: e.target.value })}
          placeholder="e.g., Block1 * Block2 * Block3"
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Formula Blocks</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBlock}>
            <Plus className="h-4 w-4 mr-1" />
            Add Block
          </Button>
        </div>
        
        {newFormula.blocks.map((block, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{block.name}</span>
              {newFormula.blocks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Input
              value={block.label}
              onChange={(e) => updateBlock(index, 'label', e.target.value)}
              placeholder="Block label (e.g., Length)"
            />
            <Input
              value={block.description}
              onChange={(e) => updateBlock(index, 'description', e.target.value)}
              placeholder="Block description"
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedFormula(null);
        }}>
          Cancel
        </Button>
        <Button onClick={handleSaveFormula}>
          {selectedFormula ? 'Update Formula' : 'Add Formula'}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">Manage formulas, users, and system settings</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.activeSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Formulas</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.totalFormulas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{mockStats.monthlyRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formula Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Formula Management</CardTitle>
                <CardDescription>
                  Create and manage calculation formulas for the system
                </CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Formula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Formula</DialogTitle>
                    <DialogDescription>
                      Create a new calculation formula for the system
                    </DialogDescription>
                  </DialogHeader>
                  <FormulaFormContent />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formulas.map((formula) => (
                <div key={formula.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{formula.name}</h3>
                        <Badge className={formula.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {formula.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Expression:</strong> {formula.expression}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {formula.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        <strong>Blocks:</strong> {formula.blocks.map(b => b.label || b.name).join(', ')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {formula.createdAt}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFormula(formula)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFormula(formula)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFormula(formula)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Formula Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Formula Details</DialogTitle>
            <DialogDescription>
              View complete formula information
            </DialogDescription>
          </DialogHeader>
          {selectedFormula && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm font-medium">{selectedFormula.name}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedFormula.description}</p>
              </div>
              <div>
                <Label>Expression</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedFormula.expression}</p>
              </div>
              <div>
                <Label>Blocks</Label>
                <div className="space-y-2">
                  {selectedFormula.blocks.map((block: any, index: number) => (
                    <div key={index} className="border rounded p-2">
                      <p className="font-medium text-sm">{block.name}: {block.label}</p>
                      <p className="text-xs text-gray-600">{block.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Formula Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Formula</DialogTitle>
            <DialogDescription>
              Update the formula information
            </DialogDescription>
          </DialogHeader>
          <FormulaFormContent />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the formula "{selectedFormula?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Formula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminDashboard;
