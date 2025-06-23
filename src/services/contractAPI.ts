
import { supabase } from '@/integrations/supabase/client';

interface Contract {
  id: string;
  vendor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
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
  async getContracts(): Promise<Contract[]> {
    try {
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          *,
          vendors(*)
        `);

      if (contractsError) throw contractsError;

      const contracts = await Promise.all(
        contractsData.map(async (contract) => {
          // Get contract items
          const { data: itemsData, error: itemsError } = await supabase
            .from('contract_items')
            .select('*')
            .eq('contract_id', contract.id);

          if (itemsError) throw itemsError;

          // Get submissions with related data
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('submissions')
            .select(`
              *,
              attachments(*),
              approval_history(*)
            `)
            .eq('contract_id', contract.id);

          if (submissionsError) throw submissionsError;

          return {
            id: contract.id,
            vendor: {
              id: contract.vendors.id,
              name: contract.vendors.name,
              email: contract.vendors.email,
              phone: contract.vendors.phone,
              address: contract.vendors.address,
            },
            projectName: contract.project_name,
            totalAmount: parseFloat(contract.total_amount),
            startDate: contract.start_date,
            description: contract.description,
            status: contract.status,
            createdAt: contract.created_at,
            updatedAt: contract.updated_at,
            items: itemsData.map(item => ({
              id: item.id,
              contractId: item.contract_id,
              parentItemId: item.parent_item_id,
              description: item.description,
              quantity: item.quantity,
              deliveredQuantity: item.delivered_quantity,
              unitPrice: parseFloat(item.unit_price),
              isSubitem: item.is_subitem,
            })),
            submissions: submissionsData.map(submission => ({
              id: submission.id,
              contractId: submission.contract_id,
              vendorId: submission.vendor_id,
              trackingNumber: submission.tracking_number,
              submissionDate: submission.submission_date,
              statusNotes: submission.status_notes,
              attachments: submission.attachments.map((att: any) => ({
                id: att.id,
                submissionId: att.submission_id,
                filePath: att.file_path,
                fileType: att.file_type,
                fileName: att.file_name,
                uploadedAt: att.uploaded_at,
              })),
              approvalHistory: submission.approval_history.map((hist: any) => ({
                id: hist.id,
                submissionId: hist.submission_id,
                approverLevel: hist.approver_level,
                approverId: hist.approver_id,
                action: hist.action,
                changedFields: hist.changed_fields,
                notes: hist.notes,
                actionDate: hist.action_date,
              })),
            })),
          };
        })
      );

      return contracts;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async getContractById(id: string): Promise<Contract | null> {
    try {
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select(`
          *,
          vendors(*)
        `)
        .eq('id', id)
        .single();

      if (contractError) {
        if (contractError.code === 'PGRST116') return null;
        throw contractError;
      }

      // Get contract items
      const { data: itemsData, error: itemsError } = await supabase
        .from('contract_items')
        .select('*')
        .eq('contract_id', id);

      if (itemsError) throw itemsError;

      // Get submissions with related data
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          attachments(*),
          approval_history(*)
        `)
        .eq('contract_id', id);

      if (submissionsError) throw submissionsError;

      return {
        id: contractData.id,
        vendor: {
          id: contractData.vendors.id,
          name: contractData.vendors.name,
          email: contractData.vendors.email,
          phone: contractData.vendors.phone,
          address: contractData.vendors.address,
        },
        projectName: contractData.project_name,
        totalAmount: parseFloat(contractData.total_amount),
        startDate: contractData.start_date,
        description: contractData.description,
        status: contractData.status,
        createdAt: contractData.created_at,
        updatedAt: contractData.updated_at,
        items: itemsData.map(item => ({
          id: item.id,
          contractId: item.contract_id,
          parentItemId: item.parent_item_id,
          description: item.description,
          quantity: item.quantity,
          deliveredQuantity: item.delivered_quantity,
          unitPrice: parseFloat(item.unit_price),
          isSubitem: item.is_subitem,
        })),
        submissions: submissionsData.map(submission => ({
          id: submission.id,
          contractId: submission.contract_id,
          vendorId: submission.vendor_id,
          trackingNumber: submission.tracking_number,
          submissionDate: submission.submission_date,
          statusNotes: submission.status_notes,
          attachments: submission.attachments.map((att: any) => ({
            id: att.id,
            submissionId: att.submission_id,
            filePath: att.file_path,
            fileType: att.file_type,
            fileName: att.file_name,
            uploadedAt: att.uploaded_at,
          })),
          approvalHistory: submission.approval_history.map((hist: any) => ({
            id: hist.id,
            submissionId: hist.submission_id,
            approverLevel: hist.approver_level,
            approverId: hist.approver_id,
            action: hist.action,
            changedFields: hist.changed_fields,
            notes: hist.notes,
            actionDate: hist.action_date,
          })),
        })),
      };
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
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
    try {
      // Start a transaction
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;

      // Update contract status if provided
      if (updates.status) {
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ 
            status: updates.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', contractId);

        if (updateError) throw updateError;
      }

      // Update contract items if provided
      if (updates.itemUpdates) {
        for (const itemUpdate of updates.itemUpdates) {
          const updateData: any = {};
          
          if (itemUpdate.deliveredQuantity !== undefined) {
            updateData.delivered_quantity = itemUpdate.deliveredQuantity;
          }
          
          if (itemUpdate.unitPrice !== undefined) {
            updateData.unit_price = itemUpdate.unitPrice;
          }

          if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { error: itemUpdateError } = await supabase
              .from('contract_items')
              .update(updateData)
              .eq('id', itemUpdate.itemId);

            if (itemUpdateError) throw itemUpdateError;
          }
        }
      }

      // Get submission for approval history
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('contract_id', contractId)
        .limit(1)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') throw submissionError;

      // Add approval history entries
      if (submission && (updates.itemUpdates || updates.status) && updates.approverLevel) {
        const historyData: any = {
          submission_id: submission.id,
          approver_level: updates.approverLevel,
          approver_id: updates.approverId || 'USER-UNKNOWN',
          action: updates.status === 'rejected' ? 'rejected' : 
                  updates.itemUpdates ? 'modified' : 'approved',
          notes: updates.notes,
          action_date: new Date().toISOString()
        };

        // Add changed fields for item updates
        if (updates.itemUpdates) {
          const changedFields: Record<string, { before: any; after: any }> = {};
          updates.itemUpdates.forEach(update => {
            if (update.deliveredQuantity !== undefined) {
              changedFields['deliveredQuantity'] = { 
                before: 'unknown', 
                after: update.deliveredQuantity 
              };
            }
            if (update.unitPrice !== undefined) {
              changedFields['unitPrice'] = { 
                before: 'unknown', 
                after: update.unitPrice 
              };
            }
          });
          historyData.changed_fields = changedFields;
        }

        const { error: historyError } = await supabase
          .from('approval_history')
          .insert(historyData);

        if (historyError) throw historyError;
      }

      // Update submission status notes if provided
      if (updates.statusNotes && submission) {
        const { error: submissionUpdateError } = await supabase
          .from('submissions')
          .update({ 
            status_notes: updates.statusNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.id);

        if (submissionUpdateError) throw submissionUpdateError;
      }

      // Recalculate total amount
      const { data: items, error: itemsError } = await supabase
        .from('contract_items')
        .select('delivered_quantity, unit_price')
        .eq('contract_id', contractId);

      if (itemsError) throw itemsError;

      const totalAmount = items.reduce((total, item) => 
        total + (item.delivered_quantity * parseFloat(item.unit_price)), 0
      );

      // Update contract total
      const { error: totalUpdateError } = await supabase
        .from('contracts')
        .update({ 
          total_amount: totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (totalUpdateError) throw totalUpdateError;

      // Return updated contract
      const updatedContract = await this.getContractById(contractId);
      if (!updatedContract) throw new Error('Contract not found after update');
      
      console.log('Contract updated:', updatedContract);
      return updatedContract;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async createContract(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'submissions'>): Promise<Contract> {
    try {
      // Create contract
      const { data: newContract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          vendor_id: contractData.vendor.id,
          project_name: contractData.projectName,
          total_amount: contractData.totalAmount,
          start_date: contractData.startDate,
          description: contractData.description,
          status: contractData.status
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // Create contract items
      if (contractData.items.length > 0) {
        const itemsToInsert = contractData.items.map(item => ({
          contract_id: newContract.id,
          parent_item_id: item.parentItemId,
          description: item.description,
          quantity: item.quantity,
          delivered_quantity: item.deliveredQuantity,
          unit_price: item.unitPrice,
          is_subitem: item.isSubitem
        }));

        const { error: itemsError } = await supabase
          .from('contract_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      const createdContract = await this.getContractById(newContract.id);
      if (!createdContract) throw new Error('Contract not found after creation');
      
      console.log('Contract created:', createdContract);
      return createdContract;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async generateTrackingNumber(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_tracking_number');
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error generating tracking number:', error);
      // Fallback to client-side generation
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const sequence = String(Date.now()).slice(-3);
      return `TRK-${date}-${sequence}`;
    }
  }
}

export const contractAPI = new ContractAPI();
