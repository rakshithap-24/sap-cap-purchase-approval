const cds = require('@sap/cds');

const STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_APPROVAL: 'IN_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const DECISION = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

module.exports = cds.service.impl(function () {
  const { PurchaseRequests, ApprovalTasks } = this.entities;

  /**
   * Action: submitPurchaseRequest(ID)
   * - sets request status to SUBMITTED
   * - creates first approval task (mocked workflow for now)
   */
  this.on('submitPurchaseRequest', async (req) => {
    const { ID } = req.data;
    if (!ID) return req.reject(400, 'ID is required');

    const tx = cds.tx(req);

    // Fetch request
    const pr = await tx.run(SELECT.one.from(PurchaseRequests).where({ ID }));
    if (!pr) return req.reject(404, `PurchaseRequest not found for ID ${ID}`);

    // Basic validation
    if (!pr.amount || pr.amount <= 0) return req.reject(400, 'Amount must be > 0');
    if (!pr.requesterEmail) return req.reject(400, 'requesterEmail is required');

    // Prevent re-submit
    if (pr.status && pr.status !== STATUS.DRAFT) {
      return req.reject(400, `Only DRAFT requests can be submitted. Current status: ${pr.status}`);
    }

    // Update status
    await tx.run(
      UPDATE(PurchaseRequests)
        .set({ status: STATUS.SUBMITTED })
        .where({ ID })
    );

    // Mock rules/workflow for now:
    // Create 1st approver task as MANAGER for a fixed email (replace later with rules engine)
    await tx.run(
      INSERT.into(ApprovalTasks).entries({
        request_ID: ID,
        step: 'MANAGER',
        approverEmail: 'manager@example.com',
        decision: DECISION.PENDING,
        comments: null,
      })
    );

    // Move request into IN_APPROVAL
    await tx.run(
      UPDATE(PurchaseRequests)
        .set({ status: STATUS.IN_APPROVAL })
        .where({ ID })
    );

    return tx.run(SELECT.one.from(PurchaseRequests).where({ ID }));
  });

  /**
   * Action: approveTask(taskId, comment)
   * - marks task APPROVED
   * - if no pending tasks remain -> set request APPROVED
   */
  this.on('approveTask', async (req) => {
    const { taskId, comment } = req.data;
    if (!taskId) return req.reject(400, 'taskId is required');

    const tx = cds.tx(req);

    const task = await tx.run(SELECT.one.from(ApprovalTasks).where({ ID: taskId }));
    if (!task) return req.reject(404, `ApprovalTask not found for ID ${taskId}`);

    if (task.decision !== DECISION.PENDING) {
      return req.reject(400, `Task already decided: ${task.decision}`);
    }

    await tx.run(
      UPDATE(ApprovalTasks)
        .set({ decision: DECISION.APPROVED, comments: comment || null })
        .where({ ID: taskId })
    );

    // Check if any pending tasks remain for the request
    const pending = await tx.run(
      SELECT.from(ApprovalTasks)
        .columns('ID')
        .where({ request_ID: task.request_ID, decision: DECISION.PENDING })
    );

    if (pending.length === 0) {
      await tx.run(
        UPDATE(PurchaseRequests)
          .set({ status: STATUS.APPROVED })
          .where({ ID: task.request_ID })
      );
    }

    return tx.run(SELECT.one.from(PurchaseRequests).where({ ID: task.request_ID }));
  });

  /**
   * Action: rejectTask(taskId, comment)
   * - marks task REJECTED
   * - sets request REJECTED immediately
   */
  this.on('rejectTask', async (req) => {
    const { taskId, comment } = req.data;
    if (!taskId) return req.reject(400, 'taskId is required');

    const tx = cds.tx(req);

    const task = await tx.run(SELECT.one.from(ApprovalTasks).where({ ID: taskId }));
    if (!task) return req.reject(404, `ApprovalTask not found for ID ${taskId}`);

    if (task.decision !== DECISION.PENDING) {
      return req.reject(400, `Task already decided: ${task.decision}`);
    }

    await tx.run(
      UPDATE(ApprovalTasks)
        .set({ decision: DECISION.REJECTED, comments: comment || null })
        .where({ ID: taskId })
    );

    await tx.run(
      UPDATE(PurchaseRequests)
        .set({ status: STATUS.REJECTED })
        .where({ ID: task.request_ID })
    );

    return tx.run(SELECT.one.from(PurchaseRequests).where({ ID: task.request_ID }));
  });
});
