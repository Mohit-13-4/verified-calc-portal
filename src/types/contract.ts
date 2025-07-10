
export interface Contract {
  id: string;
  projectName: string;
  projectId: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  status: 'active' | 'completed' | 'pending';
  items: ContractItem[];
}

export interface ContractItem {
  id: string;
  contractId: string;
  name: string;
  description: string;
  unit: string;
  rate: number;
  subitems: ContractSubitem[];
}

export interface ContractSubitem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  totalQuantity: number;
  completedQuantity: number;
  unit: string;
  rate: number;
  status: 'draft' | 'ready' | 'submitted';
  lastUpdated: string;
  entries: QuantityEntry[];
  approvalHistory: ApprovalHistoryEntry[];
}

export interface QuantityEntry {
  id: string;
  subitemId: string;
  quantity: number;
  length?: number;
  breadth?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  isDraft: boolean;
  entryDate: string; // New field for date-wise entries
}

export interface ApprovalHistoryEntry {
  id: string;
  subitemId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'modified';
  reviewerName: string;
  reviewerRole: 'level1' | 'level2' | 'level3';
  timestamp: string;
  comment?: string;
  changedFields?: Record<string, { oldValue: any; newValue: any }>;
}

export interface InvoiceItem {
  contractId: string;
  itemId: string;
  subitemId: string;
  itemName: string;
  subitemName: string;
  totalQuantity: number;
  completedQuantity: number;
  rate: number;
  amount: number;
  status: 'draft' | 'ready' | 'submitted';
}
