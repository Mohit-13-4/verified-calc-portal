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
import EnhancedInvoicePreview from '../components/EnhancedInvoicePreview';
import SubmissionTracker from '../components/SubmissionTracker';
import DateWiseEntryForm from '../components/DateWiseEntryForm';
import ApprovalTimeline from '../components/ApprovalTimeline';
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
  const [addingEntrySubitem, setAddingEntrySubitem] = useState<ContractSubitem | null>(null);
  const [viewingHistorySubitem, setViewingHistorySubitem] = useState<ContractSubitem | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'ready' | 'submitted'>('all');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'draft' | 'submitted' | 'approved'>('all');

  // New state for date-wise invoice
  const [selectedEntriesInvoice, setSelectedEntriesInvoice] = useState<{
    subitem: ContractSubitem;
    entries: QuantityEntry[];
  } | null>(null);

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

  const draftCount = allSubitems.filter(s => s.status === 'draft').length;
  const submittedCount = allSubitems.filter(s => s.status === 'submitted').length;
  const readyCount = allSubitems.filter(s => s.status === 'ready').length;

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
    console.log('Saving entry:', { subitemId, entry, isDraft });
    
    toast({
      title: isDraft ? "Draft Saved" : "Entry Submitted",
      description: isDraft 
        ? "Your progress has been saved as draft"
        : "Your entry has been submitted for review"
    });
  };

  const handleAddEntry = (subitem: ContractSubitem) => {
    setAddingEntrySubitem(subitem);
  };

  const handleViewHistory = (subitem: ContractSubitem) => {
    setViewingHistorySubitem(subitem);
  };

  // New handler for date-wise invoice generation
  const handleGenerateInvoiceForEntries = (subitem: ContractSubitem, selectedEntries: QuantityEntry[]) => {
    setSelectedEntriesInvoice({ subitem, entries: selectedEntries });
    setShowInvoicePreview(true);
  };

  // New handler for submitting selected entries
  const handleSubmitEntries = (subitem: ContractSubitem, selectedEntries: QuantityEntry[]) => {
    console.log('Submitting selected entries:', { subitem: subitem.id, entries: selectedEntries });
    
    toast({
      title: "Entries Submitted",
      description: `${selectedEntries.length} date-wise entries have been submitted for review`,
    });
  };

  const handleAddDocuments = (subitemId: string, date: Date, files: File[], notes: string) => {
    console.log('Adding documents for subitem:', subitemId, 'Date:', date, 'Files:', files.length, 'Notes:', notes);
    // Mock implementation - in real app would upload files and update entry
    toast({
      title: "Documents Added",
      description: `Successfully added ${files.length} document(s) for ${date.toDateString()}`,
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
    // If we have selected entries invoice, create invoice for those specific entries
    if (selectedEntriesInvoice) {
      const { subitem, entries } = selectedEntriesInvoice;
      const contract = contracts.find(c => 
        c.items.some(i => i.subitems.some(s => s.id === subitem.id))
      );
      const item = contract?.items.find(i => i.subitems.some(s => s.id === subitem.id));
      
      if (contract && item) {
        const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
        return [{
          contractId: contract.id,
          itemId: item.id,
          subitemId: subitem.id,
          itemName: item.name,
          subitemName: subitem.name,
          totalQuantity: subitem.totalQuantity,
          completedQuantity: totalQuantity,
          rate: subitem.rate,
          amount: totalQuantity * subitem.rate,
          status: subitem.status,
          selectedEntries: entries
        }];
      }
      return [];
    }

    // Regular invoice generation
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
              amount: subitem.completedQuantity * subitem.rate,
              status: subitem.status
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
    setSelectedEntriesInvoice(null);
  };

  const handleCloseInvoicePreview = () => {
    setShowInvoicePreview(false);
    setSelectedEntriesInvoice(null);
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

    if (submissionFilter !== 'all') {
      if (submissionFilter === 'approved') {
        subitems = subitems.filter(s => s.status === 'submitted');
      } else {
        subitems = subitems.filter(s => s.status === submissionFilter);
      }
    }
    
    return subitems;
  };

  const getCurrentProjectName = () => {
    const contract = contracts.find(c => c.id === expandedContract);
    return contract?.projectName || 'Project';
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
              <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
              <p className="text-xs text-muted-foreground">{submittedCount} submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Submission Tracker */}
        <SubmissionTracker
          draftCount={draftCount}
          submittedCount={submittedCount}
          approvedCount={readyCount}
          activeFilter={submissionFilter}
          onFilterChange={setSubmissionFilter}
        />

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
                            onViewHistory={handleViewHistory}
                            onAddEntry={handleAddEntry}
                        onGenerateInvoiceForEntries={handleGenerateInvoiceForEntries}
                        onSubmitEntries={handleSubmitEntries}
                        onAddDocuments={handleAddDocuments}
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
                  <div className="text-3xl font-bold text-orange-600 mb-2">{draftCount}</div>
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
                  <div className="text-3xl font-bold text-blue-600 mb-2">{readyCount}</div>
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
                  <div className="text-3xl font-bold text-green-600 mb-2">{submittedCount}</div>
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

      <DateWiseEntryForm
        subitem={addingEntrySubitem}
        isOpen={!!addingEntrySubitem}
        onClose={() => setAddingEntrySubitem(null)}
        onSave={handleSaveEntry}
      />

      <EnhancedInvoicePreview
        items={getInvoiceItems()}
        isOpen={showInvoicePreview}
        onClose={handleCloseInvoicePreview}
        onSubmit={handleSubmitInvoice}
        projectName={getCurrentProjectName()}
      />

      {viewingHistorySubitem && (
        <ApprovalTimeline
          steps={viewingHistorySubitem.approvalHistory.map(history => ({
            level: parseInt(history.reviewerRole.replace('level', '')),
            approverName: history.reviewerName,
            timestamp: history.timestamp,
            status: history.action === 'submitted' ? 'pending' : history.action as 'approved' | 'rejected' | 'modified',
            comment: history.comment,
            changedValues: history.changedFields ? Object.entries(history.changedFields).reduce((acc, [key, value]) => {
              acc[key] = { before: value.oldValue, after: value.newValue };
              return acc;
            }, {} as Record<string, { before: any; after: any }>) : undefined
          }))}
          currentLevel={1}
        />
      )}
    </Layout>
  );
};

export default VendorDashboard;
