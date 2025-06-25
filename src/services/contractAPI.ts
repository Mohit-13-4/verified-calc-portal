
interface Contract {
  id: string;
  vendor: string;
  projectName: string;
  totalAmount: number;
  startDate: string;
  description: string;
  status: 'draft' | 'submitted' | 'l1_review' | 'l2_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  items: ContractItem[];
  submissions: ContractSubmission[];
}

interface ContractItem {
  id: string;
  contractId: string;
  parentItemId?: string;
  description: string;
  quantity: number;
  deliveredQuantity: number;
  unitPrice: number;
  isSubitem: boolean;
  subitems?: ContractItem[];
}

interface ContractSubmission {
  id: string;
  contractId: string;
  vendorId: string;
  trackingNumber: string;
  submissionDate: string;
  statusNotes?: string;
  attachments: ContractAttachment[];
  approvalHistory: ApprovalHistory[];
}

interface ContractAttachment {
  id: string;
  submissionId: string;
  filePath: string;
  fileType: string;
  fileName: string;
  uploadedAt: string;
}

interface ApprovalHistory {
  id: string;
  submissionId: string;
  approverLevel: 1 | 2 | 3;
  approverId: string;
  action: 'approved' | 'rejected' | 'modified';
  changedFields?: Record<string, { before: any; after: any }>;
  notes?: string;
  actionDate: string;
}

class ContractAPI {
  private contracts: Contract[] = [
    {
      id: 'CONTRACT-001',
      vendor: 'ABC Manufacturing',
      projectName: 'Office Renovation Phase 1',
      totalAmount: 50000,
      startDate: '2024-02-01',
      description: 'Complete office renovation including furniture and equipment installation',
      status: 'submitted',
      createdAt: '2024-01-20T09:30:00Z',
      updatedAt: '2024-01-20T09:30:00Z',
      items: [
        {
          id: 'ITEM-001',
          contractId: 'CONTRACT-001',
          description: 'Office Desks',
          quantity: 20,
          deliveredQuantity: 0,
          unitPrice: 500,
          isSubitem: false
        },
        {
          id: 'ITEM-002',
          contractId: 'CONTRACT-001',
          description: 'Ergonomic Chairs',
          quantity: 20,
          deliveredQuantity: 0,
          unitPrice: 300,
          isSubitem: false
        },
        {
          id: 'ITEM-003',
          contractId: 'CONTRACT-001',
          description: 'Conference Tables',
          quantity: 5,
          deliveredQuantity: 0,
          unitPrice: 800,
          isSubitem: false
        }
      ],
      submissions: [
        {
          id: 'SUB-001',
          contractId: 'CONTRACT-001',
          vendorId: 'VENDOR-001',
          trackingNumber: 'TRK-20240120-001',
          submissionDate: '2024-01-20T09:30:00Z',
          attachments: [],
          approvalHistory: []
        }
      ]
    },
    {
      id: 'CONTRACT-002',
      vendor: 'XYZ Corp',
      projectName: 'IT Infrastructure Upgrade',
      totalAmount: 75000,
      startDate: '2024-02-15',
      description: 'Network equipment and server installation for main office',
      status: 'l1_review',
      createdAt: '2024-01-19T14:20:00Z',
      updatedAt: '2024-01-20T10:15:00Z',
      items: [
        {
          id: 'ITEM-004',
          contractId: 'CONTRACT-002',
          description: 'Network Switches',
          quantity: 10,
          deliveredQuantity: 8,
          unitPrice: 1200,
          isSubitem: false
        },
        {
          id: 'ITEM-005',
          contractId: 'CONTRACT-002',
          description: 'Server Racks',
          quantity: 3,
          deliveredQuantity: 3,
          unitPrice: 2500,
          isSubitem: false
        }
      ],
      submissions: [
        {
          id: 'SUB-002',
          contractId: 'CONTRACT-002',
          vendorId: 'VENDOR-002',
          trackingNumber: 'TRK-20240119-002',
          submissionDate: '2024-01-19T14:20:00Z',
          statusNotes: 'Partial delivery - 2 network switches pending',
          attachments: [],
          approvalHistory: [
            {
              id: 'HIST-001',
              submissionId: 'SUB-002',
              approverLevel: 1,
              approverId: 'USER-002',
              action: 'modified',
              changedFields: {
                'deliveredQuantity': { before: 10, after: 8 }
              },
              notes: 'Updated delivered quantity due to partial shipment',
              actionDate: '2024-01-20T10:15:00Z'
            }
          ]
        }
      ]
    }
  ];

  async getContracts(): Promise<Contract[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.contracts];
  }

  async getContractById(id: string): Promise<Contract | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.contracts.find(c => c.id === id) || null;
  }

  async updateContractStatus(
    contractId: string,
    updates: {
      status?: Contract['status'];
      statusNotes?: string;
      itemUpdates?: Array<{
        itemId: string;
        deliveredQuantity?: number;
        unitPrice?: number;
      }>;
      approverLevel?: 1 | 2 | 3;
      approverId?: string;
      notes?: string;
    }
  ): Promise<Contract> {
    const contract = this.contracts.find(c => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const submission = contract.submissions[0];
    if (!submission) throw new Error('No submission found');

    // Update contract status
    if (updates.status) {
      contract.status = updates.status;
    }

    // Update submission notes
    if (updates.statusNotes) {
      submission.statusNotes = updates.statusNotes;
    }

    // Update item quantities/prices
    if (updates.itemUpdates) {
      updates.itemUpdates.forEach(update => {
        const item = contract.items.find(i => i.id === update.itemId);
        if (item) {
          const changedFields: Record<string, { before: any; after: any }> = {};
          
          if (update.deliveredQuantity !== undefined && update.deliveredQuantity !== item.deliveredQuantity) {
            changedFields['deliveredQuantity'] = { before: item.deliveredQuantity, after: update.deliveredQuantity };
            item.deliveredQuantity = update.deliveredQuantity;
          }
          
          if (update.unitPrice !== undefined && update.unitPrice !== item.unitPrice) {
            changedFields['unitPrice'] = { before: item.unitPrice, after: update.unitPrice };
            item.unitPrice = update.unitPrice;
          }

          // Add to approval history if there were changes
          if (Object.keys(changedFields).length > 0) {
            submission.approvalHistory.push({
              id: `HIST-${Date.now()}`,
              submissionId: submission.id,
              approverLevel: updates.approverLevel || 1,
              approverId: updates.approverId || 'USER-UNKNOWN',
              action: 'modified',
              changedFields,
              notes: updates.notes,
              actionDate: new Date().toISOString()
            });
          }
        }
      });
    }

    // Add approval history entry for status changes
    if (updates.status && updates.approverLevel) {
      submission.approvalHistory.push({
        id: `HIST-${Date.now()}-STATUS`,
        submissionId: submission.id,
        approverLevel: updates.approverLevel,
        approverId: updates.approverId || 'USER-UNKNOWN',
        action: updates.status === 'rejected' ? 'rejected' : 'approved',
        notes: updates.notes,
        actionDate: new Date().toISOString()
      });
    }

    // Recalculate total amount
    contract.totalAmount = contract.items.reduce((total, item) => 
      total + (item.deliveredQuantity * item.unitPrice), 0
    );

    contract.updatedAt = new Date().toISOString();

    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Contract updated:', contract);
    return contract;
  }

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'submissions'>): Promise<Contract> {
    const newContract: Contract = {
      ...contractData,
      id: `CONTRACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissions: []
    };

    this.contracts.push(newContract);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Contract created:', newContract);
    return newContract;
  }

  generateTrackingNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = String(Date.now()).slice(-3);
    return `TRK-${date}-${sequence}`;
  }
}

export const contractAPI = new ContractAPI();
