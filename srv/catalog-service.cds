using spas.db as db from '../db/schema';


service CatalogService{
    @readonly
    entity PurchaseRequests as projection on db.PurchaseRequests
    excluding {approvals};

    entity ApprovalTasks as projection on db.ApprovalTasks;

    //Submit a  request -> triggers evaluation + creates approval tasks (next step)
    action submitPurchaseRequest(ID: UUID) returns PurchaseRequests;

    //Approver actions
    action approveTask(taskId: UUID, comment:String) returns PurchaseRequests;
    action rejectTask(taskId: UUID, comment:String) returns PurchaseRequests;
}