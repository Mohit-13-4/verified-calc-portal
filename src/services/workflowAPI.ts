interface Submission {
  id: string;
  vendor: string;
  formula: string;
  status: 'pending' | 'l1_reviewed' | 'l2_reviewed' | 'approved' | 'rejected';
  submittedAt: string;
  description: string;
  values: Record<string, number>;
  originalValues?: Record<string, number>;
  l1EditedValues?: Record<string, number>;
  l2EditedValues?: Record<string, number>;
  result: number;
  erpReady: boolean;
  rejectionComment?: string;
  l1Comment?: string;
  l2Comment?: string;
  valueChangeHistory?: Array<{
    level: string;
    originalValues: Record<string, number>;
    newValues: Record<string, number>;
    comment: string;
    timestamp: string;
  }>;
}

interface SubmissionUpdate {
  status?: string;
  rejectionComment?: string;
  editedValues?: Record<string, number>;
  editComment?: string;
}

interface FormulaData {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  formula: string;
  usage: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'level1' | 'level2' | 'level3';
  status: 'active' | 'inactive';
}

class WorkflowAPI {
  private submissions: Submission[] = [
    {
      id: 'SUB-001',
      vendor: 'ABC Manufacturing',
      formula: 'Material Cost Analysis',
      status: 'pending',
      submittedAt: '2024-01-20 09:30',
      description: 'Quarterly material cost calculation for Project Alpha including raw materials, labor, and overhead costs.',
      values: { Block1: 15000, Block2: 8500, Block3: 2200 },
      originalValues: { Block1: 15000, Block2: 8500, Block3: 2200 },
      result: 25700,
      erpReady: false
    },
    {
      id: 'SUB-002',
      vendor: 'XYZ Corp',
      formula: 'Project Budget Estimation',
      status: 'l1_reviewed',
      submittedAt: '2024-01-20 08:15',
      description: 'Annual project budget estimation for infrastructure development with markup calculations.',
      values: { Block1: 85000, Block2: 12500, Block3: 3200 },
      originalValues: { Block1: 85000, Block2: 12500, Block3: 3200 },
      result: 100700,
      erpReady: false
    },
    {
      id: 'SUB-003',
      vendor: 'TechSolutions Ltd',
      formula: 'Revenue Projection',
      status: 'l2_reviewed',
      submittedAt: '2024-01-19 16:45',
      description: 'Q1 revenue projection based on growth factors and market analysis.',
      values: { Block1: 45000, Block2: 1.15, Block3: 5500 },
      originalValues: { Block1: 45000, Block2: 1.15, Block3: 5500 },
      result: 57250,
      erpReady: false
    },
    {
      id: 'SUB-004',
      vendor: 'Global Industries',
      formula: 'Material Cost Analysis',
      status: 'approved',
      submittedAt: '2024-01-19 11:20',
      description: 'Monthly material cost analysis for production line optimization.',
      values: { Block1: 32000, Block2: 15600, Block3: 4200 },
      originalValues: { Block1: 32000, Block2: 15600, Block3: 4200 },
      result: 51800,
      erpReady: true
    }
  ];

  private formulas: FormulaData[] = [
    {
      id: 'FORM-001',
      name: 'Material Cost Analysis',
      description: 'Calculates the total material cost based on quantity and price.',
      inputs: ['Quantity', 'Price'],
      formula: 'Quantity * Price',
      usage: 5
    },
    {
      id: 'FORM-002',
      name: 'Project Budget Estimation',
      description: 'Estimates the total project budget including labor, materials, and overhead.',
      inputs: ['Labor Cost', 'Material Cost', 'Overhead'],
      formula: 'Labor Cost + Material Cost + Overhead',
      usage: 12
    },
    {
      id: 'FORM-003',
      name: 'Revenue Projection',
      description: 'Projects the revenue based on sales volume and price per unit.',
      inputs: ['Sales Volume', 'Price per Unit'],
      formula: 'Sales Volume * Price per Unit',
      usage: 8
    }
  ];

  private users: UserData[] = [
    {
      id: 'USER-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active'
    },
    {
      id: 'USER-002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'level1',
      status: 'active'
    },
    {
      id: 'USER-003',
      name: 'Robert Jones',
      email: 'robert.jones@example.com',
      role: 'level2',
      status: 'inactive'
    }
  ];

  // Formula management methods
  async createFormula(formulaData: Omit<FormulaData, 'id' | 'usage'>): Promise<FormulaData> {
    const newFormula: FormulaData = {
      ...formulaData,
      id: `FORM-${Date.now()}`,
      usage: 0
    };
    
    this.formulas.push(newFormula);
    console.log('Formula created:', newFormula);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newFormula;
  }

  async getFormulas(): Promise<FormulaData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.formulas];
  }

  async updateFormula(id: string, updates: Partial<FormulaData>): Promise<FormulaData> {
    const index = this.formulas.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Formula not found');
    
    this.formulas[index] = { ...this.formulas[index], ...updates };
    console.log('Formula updated:', this.formulas[index]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.formulas[index];
  }

  async deleteFormula(id: string): Promise<void> {
    const index = this.formulas.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Formula not found');
    
    this.formulas.splice(index, 1);
    console.log('Formula deleted:', id);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // User management methods
  async getUsers(): Promise<UserData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
    const newUser: UserData = {
      ...userData,
      id: `USER-${Date.now()}`
    };
    
    this.users.push(newUser);
    console.log('User created:', newUser);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return newUser;
  }

  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = { ...this.users[index], ...updates };
    console.log('User updated:', this.users[index]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.users[index];
  }

  // Submission management methods with enhanced functionality
  async updateSubmissionStatus(id: string, updates: SubmissionUpdate): Promise<Submission> {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) throw new Error('Submission not found');
    
    console.log('Updating submission:', id, updates);
    
    // Handle rejection with comment
    if (updates.status === 'rejected' && updates.rejectionComment) {
      submission.status = 'rejected';
      submission.rejectionComment = updates.rejectionComment;
    }
    
    // Handle value edits
    if (updates.editedValues) {
      const currentLevel = this.getCurrentEditLevel(submission.status);
      
      // Store original values if not already stored
      if (!submission.originalValues) {
        submission.originalValues = { ...submission.values };
      }
      
      // Store edited values by level
      if (currentLevel === 'l1') {
        submission.l1EditedValues = updates.editedValues;
        submission.l1Comment = updates.editComment || '';
      } else if (currentLevel === 'l2') {
        submission.l2EditedValues = updates.editedValues;
        submission.l2Comment = updates.editComment || '';
      }
      
      // Update current values
      submission.values = updates.editedValues;
      
      // Recalculate result based on new values
      submission.result = Object.values(updates.editedValues).reduce((sum, val) => sum + val, 0);
      
      // Add to change history
      if (!submission.valueChangeHistory) {
        submission.valueChangeHistory = [];
      }
      
      submission.valueChangeHistory.push({
        level: currentLevel,
        originalValues: currentLevel === 'l1' ? submission.originalValues : 
                       currentLevel === 'l2' ? (submission.l1EditedValues || submission.originalValues) : 
                       (submission.l2EditedValues || submission.l1EditedValues || submission.originalValues),
        newValues: updates.editedValues,
        comment: updates.editComment || '',
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle status change
    if (updates.status && updates.status !== 'rejected') {
      submission.status = updates.status as any;
      
      // Set ERP ready flag when approved
      if (updates.status === 'approved') {
        submission.erpReady = true;
      }
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Submission updated:', submission);
    return submission;
  }

  private getCurrentEditLevel(status: string): string {
    switch (status) {
      case 'pending':
        return 'l1';
      case 'l1_reviewed':
        return 'l2';
      case 'l2_reviewed':
        return 'l3';
      default:
        return 'l1';
    }
  }

  async getSubmissions(): Promise<Submission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.submissions];
  }
}

// Export singleton instance
export const workflowAPI = new WorkflowAPI();
