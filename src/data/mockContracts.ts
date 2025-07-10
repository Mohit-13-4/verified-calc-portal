
import { Contract } from '../types/contract';

export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    projectName: 'Highway Construction Phase 1',
    projectId: 'HWY-2024-001',
    clientName: 'Maharashtra State Road Development Corporation',
    location: 'Mumbai-Pune Highway, Maharashtra',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    totalValue: 25000000,
    status: 'active',
    items: [
      {
        id: 'item-1',
        contractId: 'contract-1',
        name: 'Road Surface Work',
        description: 'Bituminous concrete and surface preparation',
        unit: 'sq.m',
        rate: 450,
        subitems: [
          {
            id: 'subitem-1',
            itemId: 'item-1',
            name: 'Section A - Lane 1',
            description: 'Bituminous concrete laying for Lane 1, KM 0-5',
            totalQuantity: 5000,
            completedQuantity: 2250,
            unit: 'sq.m',
            rate: 450,
            status: 'ready',
            lastUpdated: '2024-01-20T10:30:00Z',
            entries: [
              {
                id: 'entry-1',
                subitemId: 'subitem-1',
                quantity: 1250,
                length: 50,
                breadth: 25,
                notes: 'Completed section from KM 0-2.5',
                attachments: ['progress-photo-1.jpg'],
                createdAt: '2024-01-18T09:00:00Z',
                isDraft: false,
                entryDate: '2024-01-18'
              },
              {
                id: 'entry-2',
                subitemId: 'subitem-1',
                quantity: 1000,
                length: 40,
                breadth: 25,
                notes: 'Section KM 2.5-4.5 completed',
                attachments: [],
                createdAt: '2024-01-20T10:30:00Z',
                isDraft: true,
                entryDate: '2024-01-20'
              }
            ],
            approvalHistory: [
              {
                id: 'approval-1',
                subitemId: 'subitem-1',
                action: 'submitted',
                reviewerName: 'John Doe',
                reviewerRole: 'level1',
                timestamp: '2024-01-19T08:00:00Z',
                comment: 'Initial submission for review'
              }
            ]
          },
          {
            id: 'subitem-2',
            itemId: 'item-1',
            name: 'Section A - Lane 2',
            description: 'Bituminous concrete laying for Lane 2, KM 0-5',
            totalQuantity: 5000,
            completedQuantity: 1800,
            unit: 'sq.m',
            rate: 450,
            status: 'draft',
            lastUpdated: '2024-01-19T14:15:00Z',
            entries: [
              {
                id: 'entry-3',
                subitemId: 'subitem-2',
                quantity: 1800,
                length: 36,
                breadth: 50,
                notes: 'Initial section completed',
                attachments: ['quality-check.pdf'],
                createdAt: '2024-01-19T14:15:00Z',
                isDraft: true,
                entryDate: '2024-01-19'
              }
            ],
            approvalHistory: []
          }
        ]
      },
      {
        id: 'item-2',
        contractId: 'contract-1',
        name: 'Drainage Systems',
        description: 'Side drains and culvert construction',
        unit: 'running meter',
        rate: 280,
        subitems: [
          {
            id: 'subitem-3',
            itemId: 'item-2',
            name: 'Left Side Drain - Section A',
            description: 'Concrete side drain construction, KM 0-3',
            totalQuantity: 3000,
            completedQuantity: 3000,
            unit: 'running meter',
            rate: 280,
            status: 'submitted',
            lastUpdated: '2024-01-21T16:45:00Z',
            entries: [
              {
                id: 'entry-4',
                subitemId: 'subitem-3',
                quantity: 3000,
                notes: 'Complete section finished with quality approval',
                attachments: ['drain-completion.jpg', 'quality-certificate.pdf'],
                createdAt: '2024-01-21T16:45:00Z',
                isDraft: false,
                entryDate: '2024-01-21'
              }
            ],
            approvalHistory: [
              {
                id: 'approval-2',
                subitemId: 'subitem-3',
                action: 'approved',
                reviewerName: 'Jane Smith',
                reviewerRole: 'level2',
                timestamp: '2024-01-22T09:00:00Z',
                comment: 'Work quality meets specifications',
                changedFields: {
                  'quantity': { oldValue: 2900, newValue: 3000 }
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'contract-2',
    projectName: 'Residential Complex - Phase II',
    projectId: 'RES-2024-002',
    clientName: 'Urban Development Authority',
    location: 'Sector 15, Navi Mumbai',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    totalValue: 18500000,
    status: 'active',
    items: [
      {
        id: 'item-3',
        contractId: 'contract-2',
        name: 'Structural Work',
        description: 'RCC work for residential buildings',
        unit: 'cubic meter',
        rate: 6500,
        subitems: [
          {
            id: 'subitem-4',
            itemId: 'item-3',
            name: 'Building A - Foundation',
            description: 'RCC foundation work for Building A',
            totalQuantity: 450,
            completedQuantity: 180,
            unit: 'cubic meter',
            rate: 6500,
            status: 'draft',
            lastUpdated: '2024-01-22T11:20:00Z',
            entries: [
              {
                id: 'entry-5',
                subitemId: 'subitem-4',
                quantity: 180,
                notes: 'Foundation excavation and concrete pouring completed',
                attachments: ['foundation-progress.jpg'],
                createdAt: '2024-01-22T11:20:00Z',
                isDraft: true,
                entryDate: '2024-01-22'
              }
            ],
            approvalHistory: []
          },
          {
            id: 'subitem-5',
            itemId: 'item-3',
            name: 'Building B - Ground Floor Slab',
            description: 'RCC slab casting for Building B ground floor',
            totalQuantity: 320,
            completedQuantity: 0,
            unit: 'cubic meter',
            rate: 6500,
            status: 'draft',
            lastUpdated: '2024-01-15T09:00:00Z',
            entries: [],
            approvalHistory: []
          }
        ]
      }
    ]
  }
];
