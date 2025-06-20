
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock calculation data
const mockCalculations = [
  {
    id: 'CALC-001',
    title: 'Material Cost Analysis Q4',
    formula: 'Material Cost + Labor + Overhead',
    status: 'approved',
    submittedDate: '2024-01-15',
    currentLevel: 'completed',
    totalValue: 125000,
    comments: 'Approved by all levels'
  },
  {
    id: 'CALC-002',
    title: 'Project Budget Estimation',
    formula: 'Direct Costs × 1.15 + Fixed Costs',
    status: 'pending',
    submittedDate: '2024-01-18',
    currentLevel: 'level2',
    totalValue: 89500,
    comments: 'Under review by Level 2'
  },
  {
    id: 'CALC-003',
    title: 'Quarterly Revenue Projection',
    formula: 'Base Revenue + Growth Factor',
    status: 'rejected',
    submittedDate: '2024-01-10',
    currentLevel: 'level1',
    totalValue: 0,
    comments: 'Incorrect formula parameters - please revise'
  }
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [calculations] = useState(mockCalculations);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusMap[status as keyof typeof statusMap];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getLevelProgress = (currentLevel: string, status: string) => {
    if (status === 'rejected') return 'Rejected at Level 1';
    if (status === 'approved') return 'All levels approved';
    
    const levelMap = {
      level1: 'Under Level 1 Review',
      level2: 'Under Level 2 Review', 
      level3: 'Under Level 3 Review'
    };
    
    return levelMap[currentLevel as keyof typeof levelMap] || 'Submitted';
  };

  return (
    <Layout title="Vendor Portal">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Calculations</h2>
            <p className="text-gray-600">Submit and track your calculation requests</p>
          </div>
          <Button 
            onClick={() => navigate('/vendor/new-calculation')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">{calculations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculations.filter(c => c.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculations List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
            <CardDescription>
              Track the status of your submitted calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculations.map((calc) => (
                <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{calc.title}</h3>
                        {getStatusBadge(calc.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {calc.id}
                        </div>
                        <div>
                          <span className="font-medium">Formula:</span> {calc.formula}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {calc.submittedDate}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Status:</span>{' '}
                          <span className="text-gray-600">{getLevelProgress(calc.currentLevel, calc.status)}</span>
                        </div>
                        {calc.totalValue > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Value:</span>{' '}
                            <span className="text-gray-600">${calc.totalValue.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      {calc.comments && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <span className="font-medium">Comments:</span> {calc.comments}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
