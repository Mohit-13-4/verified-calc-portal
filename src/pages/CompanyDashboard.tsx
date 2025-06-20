
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ArrowRight,
  MessageSquare,
  Download,
  Eye
} from 'lucide-react';

// Mock calculation data with approval workflow
const mockCalculations = [
  {
    id: 'CALC-002',
    title: 'Project Budget Estimation',
    vendor: 'ABC Suppliers',
    formula: 'Direct Costs × 1.15 + Fixed Costs',
    status: 'pending',
    currentLevel: 'level2',
    submittedDate: '2024-01-18',
    totalValue: 89500,
    level1: {
      reviewer: 'Alice Reviewer',
      status: 'approved',
      comments: 'Initial validation complete. Values appear correct.',
      reviewDate: '2024-01-19'
    },
    level2: { reviewer: null, status: 'pending', comments: null, reviewDate: null },
    level3: { reviewer: null, status: 'pending', comments: null, reviewDate: null }
  },
  {
    id: 'CALC-004',
    title: 'Material Cost Analysis Q1',
    vendor: 'XYZ Materials',
    formula: 'Material Cost + Labor + Overhead',
    status: 'pending',
    currentLevel: 'level1',
    submittedDate: '2024-01-20',
    totalValue: 156300,
    level1: { reviewer: null, status: 'pending', comments: null, reviewDate: null },
    level2: { reviewer: null, status: 'pending', comments: null, reviewDate: null },
    level3: { reviewer: null, status: 'pending', comments: null, reviewDate: null }
  },
  {
    id: 'CALC-005',
    title: 'Quarterly Revenue Forecast',
    vendor: 'DEF Corporation',
    formula: 'Base Revenue × Growth Factor + Adjustments',
    status: 'pending',
    currentLevel: 'level3',
    submittedDate: '2024-01-16',
    totalValue: 245000,
    level1: {
      reviewer: 'Alice Reviewer',
      status: 'approved',
      comments: 'Calculations verified.',
      reviewDate: '2024-01-17'
    },
    level2: {
      reviewer: 'Bob Validator',
      status: 'approved',
      comments: 'Cross-checked with historical data. Approved.',
      reviewDate: '2024-01-19'
    },
    level3: { reviewer: null, status: 'pending', comments: null, reviewDate: null }
  }
];

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [calculations] = useState(mockCalculations);
  const [selectedCalc, setSelectedCalc] = useState<string | null>(null);

  const userLevel = user?.role;
  
  // Filter calculations based on user level
  const getAvailableCalculations = () => {
    return calculations.filter(calc => {
      if (userLevel === 'level1') {
        return calc.currentLevel === 'level1';
      } else if (userLevel === 'level2') {
        return calc.currentLevel === 'level2';
      } else if (userLevel === 'level3') {
        return calc.currentLevel === 'level3';
      }
      return false;
    });
  };

  const availableCalculations = getAvailableCalculations();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
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

  const getLevelTitle = () => {
    const titles = {
      level1: 'Level 1 - Initial Review',
      level2: 'Level 2 - Quality Validation', 
      level3: 'Level 3 - Final Approval'
    };
    return titles[userLevel as keyof typeof titles] || 'Company Portal';
  };

  const getLevelDescription = () => {
    const descriptions = {
      level1: 'Perform initial validation of calculation inputs and basic verification',
      level2: 'Conduct quality assurance and cross-check calculations with historical data',
      level3: 'Provide final approval and generate official reports for completed calculations'
    };
    return descriptions[userLevel as keyof typeof descriptions] || '';
  };

  const WorkflowProgress = ({ calculation }: { calculation: any }) => {
    const levels = ['level1', 'level2', 'level3'];
    
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        {levels.map((level, index) => {
          const levelData = calculation[level];
          const isCurrent = calculation.currentLevel === level;
          const isCompleted = levelData.status === 'approved';
          const isRejected = levelData.status === 'rejected';
          
          return (
            <React.Fragment key={level}>
              <div className={`flex items-center space-x-2 ${isCurrent ? 'font-semibold' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isRejected ? 'bg-red-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300'
                }`}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> :
                   isRejected ? <XCircle className="h-4 w-4" /> :
                   isCurrent ? <Clock className="h-4 w-4" /> : (index + 1)}
                </div>
                <span className="text-sm">Level {index + 1}</span>
              </div>
              {index < levels.length - 1 && (
                <ArrowRight className={`h-4 w-4 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Layout title={getLevelTitle()}>
      <div className="space-y-6">
        {/* Level Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Your Role:</span> {getLevelDescription()}
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {availableCalculations.length} items for review
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Awaiting Review</p>
                  <p className="text-2xl font-bold text-gray-900">{availableCalculations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${availableCalculations.reduce((sum, calc) => sum + calc.totalValue, 0).toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">This Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.role?.replace('level', 'Level ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculations for Review */}
        <Card>
          <CardHeader>
            <CardTitle>Calculations Requiring Your Review</CardTitle>
            <CardDescription>
              Items waiting for {user?.role?.replace('level', 'Level ')} approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableCalculations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No calculations are currently awaiting your review.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableCalculations.map((calc) => (
                  <div key={calc.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{calc.title}</h3>
                        <p className="text-sm text-gray-600">Submitted by {calc.vendor} • {calc.submittedDate}</p>
                      </div>
                      {getStatusBadge(calc.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Calculation ID:</span> {calc.id}
                      </div>
                      <div>
                        <span className="font-medium">Total Value:</span> ${calc.totalValue.toLocaleString()}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Formula:</span> {calc.formula}
                      </div>
                    </div>

                    <WorkflowProgress calculation={calc} />

                    {/* Previous Level Comments */}
                    {userLevel !== 'level1' && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Previous Reviews:</h4>
                        {calc.level1.status === 'approved' && (
                          <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-green-800">Level 1 - {calc.level1.reviewer}</span>
                              <span className="text-green-600">{calc.level1.reviewDate}</span>
                            </div>
                            <p className="text-green-700 mt-1">{calc.level1.comments}</p>
                          </div>
                        )}
                        {userLevel === 'level3' && calc.level2.status === 'approved' && (
                          <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-green-800">Level 2 - {calc.level2.reviewer}</span>
                              <span className="text-green-600">{calc.level2.reviewDate}</span>
                            </div>
                            <p className="text-green-700 mt-1">{calc.level2.comments}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Comment
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ERP Integration Note */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>ERP Integration:</strong> Approved calculations will be automatically flagged for ERP synchronization when the integration is enabled.
              </span>
              <Button variant="outline" size="sm" disabled className="opacity-50">
                ERP Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
