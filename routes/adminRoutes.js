// Require an administrator for all admin routes
const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validateBody, required } = require('../middleware/validate');

const router = express.Router();

// TicketService requires shippedIn only when marking a ticket as Shipped
const statusFields = validateBody({
  status: [required('Choose the new status.')],
  shippedIn: [],
});

router.get('/admin', requireAdmin, adminController.showAdmin);
router.post('/admin/tickets/:ticketId/status', requireAdmin, statusFields, adminController.moveTicket);

module.exports = router;
