
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
}
