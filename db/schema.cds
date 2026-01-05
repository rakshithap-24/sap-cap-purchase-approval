namespace spas.db;

using {cuid, managed} from '@sap/cds/common';

entity PurchaseRequests : cuid, managed{
    requesterEmail: String(255);
    costCenter : String(20);
    category: String(50);
    amount: Decimal(15,2);
    currency: String(3);
    supplier: String(255);
    justification: String(1000);
    status: String(20); //DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED
    approvals: Composition of many ApprovalTasks on approvals.request =$self;
}

entity ApprovalTasks: cuid, managed{
    request: Association to PurchaseRequests;
    step: String(30); //MANAGER, FINANCE, PROCUREMENT
    approverEmail: String(255);
    decision: String(20); //PENDING, APPROVED, REJECTED
    comments: String(500);

}