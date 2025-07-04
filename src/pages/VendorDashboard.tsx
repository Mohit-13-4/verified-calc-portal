
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
    // Mock saving - in real implementation, this would call an API
    console.log('Saving entry:', { subitemId, entry, isDraft });
    
    // Update the subitem's completed quantity and status
    // This is a simplified mock implementation
    toast({
      title: isDraft ? "Draft Saved" : "Entry Submitted",
      description: isDraft 
        ? "Your progress has been saved as draft"
        : "Your entry has been submitted for review"
    });
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
    // Mock invoice submission
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
                  <ContractCard
                    contract={contract}
                    onExpand={handleExpandContract}
                    isExpanded={expandedContract === contract.id}
                  />
                  
                  {/* Expanded Contract Items */}
                  {expandedContract === contract.id && (
                    <div className="ml-6 space-y-4">
                      <h3 className="text-lg font-medium">Project Items</h3>
                      <ItemList
                        items={contract.items}
                        expandedItem={expandedItem}
                        onExpandItem={handleExpandItem}
                      />
                      
                      {/* Expanded Item Subitems */}
                      {expandedItem && (
                        <div className="ml-6 space-y-4">
                          {/* Search and Filter */}
                          <div className="flex gap-4 items-center">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search subitems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                              >
                                All
                              </Button>
                              <Button
                                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('draft')}
                              >
                                Draft
                              </Button>
                              <Button
                                variant={filterStatus === 'ready' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('ready')}
                              >
                                Ready
                              </Button>
                              <Button
                                variant={filterStatus === 'submitted' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('submitted')}
                              >
                                Submitted
                              </Button>
                            </div>
                          </div>
                          
                          <h4 className="text-md font-medium">Subitems</h4>
                          <SubitemList
                            subitems={getFilteredSubitems()}
                            selectedSubitems={selectedSubitems}
                            onToggleSelection={handleToggleSubitemSelection}
                            onEditSubitem={setEditingSubitem}
                          />
                        </div>
                      )}
                    </div>
                  )}
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
