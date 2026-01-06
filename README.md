# SAP CAP Purchase Approval

A hands-on SAP CAP (Node.js) project that implements a **multi-step purchase approval workflow**
using **CDS domain modeling, OData V4 services, custom actions, and rule-driven approval routing**.

This project is built as a **learning + portfolio showcase** following real-world SAP BTP best practices.

---

## 🚀 Key Features

- SAP CAP (Node.js) backend with CDS domain modeling
- OData V4 service with custom actions
- Purchase Request lifecycle management
- Multi-step approval workflow (Manager → Finance → Procurement)
- Rule-based approval routing (amount-based)
- Designed for SAP Fiori / UI5 consumption

---

## 🧱 Domain Model

### Entities
- **PurchaseRequests**
  - requesterEmail
  - costCenter
  - category
  - amount
  - currency
  - supplier
  - justification
  - status (DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED)

- **ApprovalTasks**
  - step (MANAGER, FINANCE, PROCUREMENT)
  - approverEmail
  - decision (PENDING, APPROVED, REJECTED)
  - comments
  - association to PurchaseRequest

---

## 🔧 Service Layer (CatalogService)

### Exposed Entities
- `PurchaseRequests`
- `ApprovalTasks`

### Custom Actions
- `submitPurchaseRequest(ID)`
- `approveTask(taskID, comment)`
- `rejectTask(taskID, comment)`

---

## 🔄 Workflow Logic

1. User creates a **Purchase Request** (DRAFT)
2. User submits request → status changes to `IN_APPROVAL`
3. Approval tasks are created based on **business rules**
4. Approvers approve/reject tasks
5. Final request status updates automatically

---

## 🧪 Local Testing

This project includes a `test.http` file for quick testing inside SAP Business Application Studio.

### Sample Flow
1. Create Purchase Request (POST)
2. Submit Purchase Request (action)
3. Read Approval Tasks (GET)
4. Approve / Reject Task (action)

---

## 🛠 Tech Stack

- SAP CAP (Node.js)
- CDS (Core Data Services)
- OData V4
- SAP Business Application Studio
- GitHub (version control)

---

## 📌 Current Status

- ✅ CDS domain model completed
- ✅ OData service & custom actions implemented
- ✅ Local test flow working
- ⏳ Business Rules integration (in progress)
- ⏳ Sequential approval workflow
- ⏳ SAP Fiori UI / My Inbox integration

---

## 📚 Learning Goals

- Build real-world SAP CAP services
- Implement approval workflows without hardcoding
- Prepare backend for SAP Fiori Elements & custom UI5 apps
- Follow clean Git and CAP project structure

---

## 👩‍💻 Author

**Rakshitha Prakash**  
SAP CAP / SAP UI5 Developer  

