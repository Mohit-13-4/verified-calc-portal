
// Mock API service for workflow operations
// This would be replaced with actual API calls to your backend

export interface FormulaData {
  name: string;
  description: string;
  formula: string;
  blocks: Record<string, { name: string; unit: string }>;
}

export interface UserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface SubmissionUpdate {
  id: string;
  status: string;
  updatedBy: string;
  timestamp: string;
}

class WorkflowAPI {
  // Formula Management
  async createFormula(formulaData: FormulaData): Promise<{ id: string; success: boolean }> {
    console.log('API: Creating formula', formulaData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!formulaData.name || !formulaData.formula) {
      throw new Error('Formula name and expression are required');
    }
    
    // Mock successful response
    return {
      id: `formula_${Date.now()}`,
      success: true
    };
  }

  async updateFormula(id: string, formulaData: Partial<FormulaData>): Promise<{ success: boolean }> {
    console.log('API: Updating formula', id, formulaData);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true };
  }

  async deleteFormula(id: string): Promise<{ success: boolean }> {
    console.log('API: Deleting formula', id);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
  }

  // User Management
  async createUser(userData: UserData): Promise<{ id: string; success: boolean }> {
    console.log('API: Creating user', userData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }
    
    return {
      id: `user_${Date.now()}`,
      success: true
    };
  }

  async updateUser(id: string, userData: Partial<UserData>): Promise<{ success: boolean }> {
    console.log('API: Updating user', id, userData);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true };
  }

  // Submission Status Management
  async updateSubmissionStatus(submissionId: string, newStatus: string, userRole: string): Promise<{ success: boolean; erpReady?: boolean }> {
    console.log('API: Updating submission status', { submissionId, newStatus, userRole });
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock business logic
    const erpReady = newStatus === 'approved';
    
    // Simulate PDF generation for Level 3 approvals
    if (newStatus === 'approved') {
      console.log('API: Generating PDF report for submission', submissionId);
      // Mock PDF generation process
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return { 
      success: true,
      erpReady
    };
  }

  async getSubmissionHistory(submissionId: string): Promise<Array<{
    status: string;
    updatedBy: string;
    timestamp: string;
    comments?: string;
  }>> {
    console.log('API: Fetching submission history', submissionId);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock history data
    return [
      {
        status: 'pending',
        updatedBy: 'vendor@company.com',
        timestamp: '2024-01-20T10:00:00Z',
        comments: 'Initial submission'
      },
      {
        status: 'l1_reviewed',
        updatedBy: 'level1@company.com',
        timestamp: '2024-01-20T14:30:00Z',
        comments: 'Verified calculations and inputs'
      }
    ];
  }

  // ERP Integration (Stubbed)
  async syncToERP(submissionId: string): Promise<{ success: boolean; erpId?: string }> {
    console.log('API: [ERP STUB] Syncing submission to ERP', submissionId);
    
    // This is intentionally stubbed - no actual ERP integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: false, // Always return false since ERP is not connected
      erpId: undefined
    };
  }

  async getERPStatus(): Promise<{ connected: boolean; lastSync?: string; pendingItems: number }> {
    console.log('API: [ERP STUB] Checking ERP status');
    
    return {
      connected: false,
      lastSync: undefined,
      pendingItems: 89 // Mock number from systemStats
    };
  }
}

// Export singleton instance
export const workflowAPI = new WorkflowAPI();
