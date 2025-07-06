
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Package, 
  ChevronDown, 
  ChevronRight,
  Edit,
  Plus
} from 'lucide-react';
import { formatINR } from '../utils/currency';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  progress: number;
  pricePerUnit: number;
  unit: string;
  status: 'ready' | 'submitted' | 'draft';
  subitems: SubItem[];
}

interface SubItem {
  id: string;
  name: string;
  description: string;
  total: number;
  completed: number;
  rate: number;
  value: number;
  status: 'ready' | 'submitted' | 'draft';
}

interface ProjectDetailsViewProps {
  project: {
    id: string;
    name: string;
    company: string;
    location: string;
    dateRange: string;
    totalValue: number;
    status: 'active' | 'completed';
    items: ProjectItem[];
  };
  expandedItems: string[];
  onToggleItem: (itemId: string) => void;
  onEditSubitem: (subitemId: string, itemId: string) => void;
  onAddSubitem: (itemId: string) => void;
  userRole?: string;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  project,
  expandedItems,
  onToggleItem,
  onEditSubitem,
  onAddSubitem,
  userRole
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = userRole === 'level1' || userRole === 'level2' || userRole === 'level3';

  return (
    <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
      {/* Project Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <Badge className={project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">{project.company}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {project.dateRange}
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-1" />
              {formatINR(project.totalValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Project Items */}
      <div className="mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Project Items</h4>
        <div className="space-y-3">
          {project.items.map((item) => (
            <div key={item.id} className="border border-blue-200 rounded-lg">
              <div 
                className="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => onToggleItem(item.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Progress: {item.progress}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatINR(item.pricePerUnit)} per {item.unit}
                      </div>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {expandedItems.includes(item.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {item.subitems.length} subitems
                </div>
              </div>

              {/* Expanded Subitems */}
              {expandedItems.includes(item.id) && (
                <div className="border-t border-blue-200 bg-blue-25 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="text-sm font-medium text-gray-900">Subitems</h6>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSubitem(item.id);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Subitem
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {item.subitems.map((subitem) => (
                      <div key={subitem.id} className="bg-white rounded border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h7 className="text-sm font-medium text-gray-900">{subitem.name}</h7>
                              <Badge className={getStatusColor(subitem.status)} variant="outline">
                                {subitem.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{subitem.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Total: </span>
                                <span className="font-medium">{subitem.total.toLocaleString()} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Completed: </span>
                                <span className="font-medium">{subitem.completed.toLocaleString()} {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Rate: </span>
                                <span className="font-medium">{formatINR(subitem.rate)} per {item.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Value: </span>
                                <span className="font-medium text-green-600">{formatINR(subitem.value)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSubitem(subitem.id, item.id);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsView;
