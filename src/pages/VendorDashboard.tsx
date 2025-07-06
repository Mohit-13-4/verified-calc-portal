
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Receipt,
  Target,
  TrendingUp
} from 'lucide-react';
import ContractCard from '../components/ContractCard';
import ItemList from '../components/ItemList';
import SubitemList from '../components/SubitemList';
import SubitemEntryForm from '../components/SubitemEntryForm';
import InvoicePreview from '../components/InvoicePreview';
import ProjectDetailsView from '../components/ProjectDetailsView';
import { mockContracts } from '../data/mockContracts';
import { Contract, ContractSubitem, QuantityEntry, InvoiceItem } from '../types/contract';
import { formatINR } from '../utils/currency';
import { useToast } from "@/hooks/use-toast";

const VendorDashboard: React.FC = () => {
  const { toast } = useToast();
  const [contracts] = useState<Contract[]>(mockContracts);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedSubitems, setSelectedSubitems] = useState<string[]>([]);
  const [editingSubitem, setEditingSubitem] = useState<ContractSubitem | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'ready' | 'submitted'>('all');
  const [expandedProjectItems, setExpandedProjectItems] = useState<string[]>([]);

  // Stats calculations
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalValue = contracts.reduce((sum, c) => sum + c.totalValue, 0);
  
  const allSubitems = contracts.flatMap(c => 
    c.items.flatMap(i => i.subitems)
  );
  
  const completedValue = allSubitems.reduce((sum, s) => 
    sum + (s.completedQuantity * s.rate), 0
  );

  const draftEntries = allSubitems.filter(s => s.status === 'draft').length;
  const submittedEntries = allSubitems.filter(s => s.status === 'submitted').length;

  const handleExpandContract = (contractId: string) => {
    setExpandedContract(expandedContract === contractId ? null : contractId);
    setExpandedItem(null);
    setSelectedSubitems([]);
  };

  const handleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
    setSelectedSubitems([]);
  };

  const handleToggleProjectItem = (itemId: string) => {
    setExpandedProjectItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleToggleSubitemSelection = (subitemId: string) => {
    setSelectedSubitems(prev => 
      prev.includes(subitemId)
        ? prev.filter(id => id !== subitemId)
        : [...prev, subitemId]
    );
  };

  const handleSaveEntry = (
    subitemId: string, 
    entry: Omit<QuantityEntry, 'id' | 'createdAt'>, 
    isDraft: boolean
  ) => {
    console.log('Saving entry:', { subitemId, entry, isDraft });
    
    toast({
      title: isDraft ? "Draft Saved" : "Entry Submitted",
      description: isDraft 
        ? "Your progress has been saved as draft"
        : "Your entry has been submitted for review"
    });
  };

  const handleAddSubitem = (itemId: string) => {
    console.log('Adding new subitem to item:', itemId);
    
    // Create a mock subitem for the form
    const mockSubitem: ContractSubitem = {
      id: `new-${Date.now()}`,
      itemId: itemId,
      name: 'New Subitem',
      description: 'Enter subitem description',
      totalQuantity: 0,
      completedQuantity: 0,
      unit: 'units',
      rate: 0,
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      entries: []
    };
    
    setEditingSubitem(mockSubitem);
    
    toast({
      title: "Adding New Subitem",
      description: "Please fill in the subitem details"
    });
  };

  const handleEditSubitem = (subitemId: string, itemId: string) => {
    // Find the subitem to edit
    const contract = contracts.find(c => 
      c.items.some(i => i.subitems.some(s => s.id === subitemId))
    );
    
    if (contract) {
      const item = contract.items.find(i => i.subitems.some(s => s.id === subitemId));
      if (item) {
        const subitem = item.subitems.find(s => s.id === subitemId);
        if (subitem) {
          setEditingSubitem(subitem);
        }
      }
    }
  };

  const handleGenerateInvoice = () => {
    if (selectedSubitems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to generate an invoice",
        variant: "destructive"
      });
      return;
    }
    setShowInvoicePreview(true);
  };

  const getInvoiceItems = (): InvoiceItem[] => {
    const items: InvoiceItem[] = [];
    
    contracts.forEach(contract => {
      contract.items.forEach(item => {
        item.subitems.forEach(subitem => {
          if (selectedSubitems.includes(subitem.id)) {
            items.push({
              contractId: contract.id,
              itemId: item.id,
              subitemId: subitem.id,
              itemName: item.name,
              subitemName: subitem.name,
              totalQuantity: subitem.totalQuantity,
              completedQuantity: subitem.completedQuantity,
              rate: subitem.rate,
              amount: subitem.completedQuantity * subitem.rate
            });
          }
        });
      });
    });
    
    return items;
  };

  const handleSubmitInvoice = () => {
    console.log('Submitting invoice for items:', getInvoiceItems());
    setSelectedSubitems([]);
  };

  const getFilteredSubitems = () => {
    if (!expandedContract || !expandedItem) return [];
    
    const contract = contracts.find(c => c.id === expandedContract);
    const item = contract?.items.find(i => i.id === expandedItem);
    
    if (!item) return [];
    
    let subitems = item.subitems;
    
    if (searchTerm) {
      subitems = subitems.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      subitems = subitems.filter(s => s.status === filterStatus);
    }
    
    return subitems;
  };

  // Convert contracts to project format for ProjectDetailsView
  const getProjectFromContract = (contract: Contract) => {
    return {
      id: contract.id,
      name: contract.projectName,
      company: contract.clientName,
      location: contract.location,
      dateRange: `${contract.startDate} - ${contract.endDate}`,
      totalValue: contract.totalValue,
      status: contract.status as 'active' | 'completed',
      items: contract.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        progress: Math.round((item.subitems.reduce((sum, s) => sum + s.completedQuantity, 0) / 
                            item.subitems.reduce((sum, s) => sum + s.totalQuantity, 1)) * 100),
        pricePerUnit: item.rate,
        unit: item.unit,
        status: 'ready' as const,
        subitems: item.subitems.map(subitem => ({
          id: subitem.id,
          name: subitem.name,
          description: subitem.description,
          total: subitem.totalQuantity,
          completed: subitem.completedQuantity,
          rate: subitem.rate,
          value: subitem.completedQuantity * subitem.rate,
          status: subitem.status as 'ready' | 'submitted' | 'draft'
        }))
      }))
    };
  };

  return (
    <Layout title="Vendor Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">of {totalContracts} total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(totalValue)}</div>
              <p className="text-xs text-muted-foreground">Contract value</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatINR(completedValue)}</div>
              <p className="text-xs text-muted-foreground">Work completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{draftEntries}</div>
              <p className="text-xs text-muted-foreground">{submittedEntries} submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Contract Management */}
        <Tabs defaultValue="contracts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contracts">My Contracts</TabsTrigger>
            <TabsTrigger value="tasks">Task Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contracts" className="space-y-4">
            {/* Contract List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Assigned Contracts</h2>
              
              {contracts.map((contract) => (
                <div key={contract.id} className="space-y-4">
                  {/* Use ProjectDetailsView for better UI */}
                  <ProjectDetailsView
                    project={getProjectFromContract(contract)}
                    expandedItems={expandedProjectItems}
                    onToggleItem={handleToggleProjectItem}
                    onEditSubitem={handleEditSubitem}
                    onAddSubitem={handleAddSubitem}
                    userRole="vendor"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Draft Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-2">{draftEntries}</div>
                  <p className="text-sm text-gray-600">Items saved as draft</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Ready to Submit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {allSubitems.filter(s => s.status === 'ready').length}
                  </div>
                  <p className="text-sm text-gray-600">Items ready for review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">{submittedEntries}</div>
                  <p className="text-sm text-gray-600">Items under review</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky Action Bar */}
        {selectedSubitems.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {selectedSubitems.length} item{selectedSubitems.length > 1 ? 's' : ''} selected
              </Badge>
              <Button
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Generate Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedSubitems([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SubitemEntryForm
        subitem={editingSubitem}
        isOpen={!!editingSubitem}
        onClose={() => setEditingSubitem(null)}
        onSave={handleSaveEntry}
      />

      <InvoicePreview
        items={getInvoiceItems()}
        isOpen={showInvoicePreview}
        onClose={() => setShowInvoicePreview(false)}
        onSubmit={handleSubmitInvoice}
      />
    </Layout>
  );
};

export default VendorDashboard;
