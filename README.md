
# Multi-Level Verified Calculation System

A sophisticated business application featuring dual portals, role-based authentication, and a three-tier approval workflow with ERP-ready architecture.

## Project Overview

This system provides a comprehensive platform for managing calculation submissions and approvals across multiple organizational levels, designed with future ERP integration capabilities.

### Key Features

- **Dual Portal System**: Separate interfaces for vendors and company staff
- **Role-Based Authentication**: Secure login system with role-specific dashboards
- **Three-Tier Approval Workflow**: Level 1 → Level 2 → Level 3 approval process
- **ERP Integration Ready**: Architected for future ERP system connectivity
- **Comprehensive Audit Trail**: Complete tracking of all actions and approvals
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## User Roles

### Vendor Portal
- Submit calculations using predefined formulas
- Track submission status through approval pipeline
- View calculation history and comments
- Edit pending calculations

### Company Portal - Three Levels
- **Level 1 Reviewers**: Initial validation and basic verification
- **Level 2 Validators**: Quality assurance and cross-checking
- **Level 3 Approvers**: Final approval and report generation

### Admin Portal
- User management and role assignment
- Formula configuration and management
- System monitoring and ERP settings
- Audit trail access

## Demo Credentials

Use these credentials to explore different user roles:

| Role | Email | Password |
|------|-------|----------|
| Vendor | vendor@company.com | vendor123 |
| Level 1 Reviewer | level1@company.com | level1123 |
| Level 2 Validator | level2@company.com | level2123 |
| Level 3 Approver | level3@company.com | level3123 |
| Administrator | admin@company.com | admin123 |

## Technology Stack

- **Frontend**: React.js + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Authentication**: JWT-ready architecture
- **Database Ready**: Structured for MongoDB integration
- **ERP Integration**: Staged service layer with OpenAPI documentation

## ERP Integration Architecture

The system is built with comprehensive ERP integration capabilities (currently staged):

### Database Schema
- All entities include `erpSyncReady`, `erpId`, and `lastSyncAttempt` fields
- Audit trails designed for ERP synchronization
- Flexible field mapping architecture

### API Design
- Reserved RESTful endpoints for ERP operations
- OpenAPI 3.0 documentation prepared
- Batch synchronization support

### Service Layer
- Stubbed ERP service with comprehensive interface
- Error handling and retry mechanisms
- Security and authentication framework

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calculation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:8080 in your browser
   - Use demo credentials to explore different user roles

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

## Workflow Process

1. **Vendor Submission**: Vendor submits calculation using predefined formulas
2. **Level 1 Review**: Initial validation of inputs and basic checks
3. **Level 2 Validation**: Quality assurance and historical data comparison
4. **Level 3 Approval**: Final sign-off and report generation
5. **ERP Flagging**: Approved calculations flagged for future ERP sync

## Security Features

- Role-based access control
- JWT authentication ready
- Secure credential management
- Audit logging for all operations
- ERP integration security framework

## Future Development

### Phase 1: Backend Integration
- Database implementation (MongoDB)
- API development
- Authentication system

### Phase 2: ERP Integration
- Active ERP connectivity
- Real-time synchronization
- Custom field mapping

### Phase 3: Advanced Features
- Advanced reporting and analytics
- Mobile application
- Third-party integrations

## Documentation

- [ERP Integration Guide](./ERP_INTEGRATION.md)
- API documentation (generated via OpenAPI)
- User manuals (in development)

## Contributing

This project follows enterprise development standards:

1. TypeScript for type safety
2. ESLint for code quality
3. Comprehensive testing strategy
4. Git workflow with feature branches
5. Code review requirements

## License

Enterprise License - Contact administrator for details.

---

**Status**: Development Phase 1 Complete - Frontend & Architecture
**Next**: Backend integration and database implementation
**ERP Status**: Staged and ready for integration
