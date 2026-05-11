const express = require('express');
const { param } = require('express-validator');

const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const controller = require('../controllers/admin.controller');

const router = express.Router();

router.use(auth, requireRole('admin'));

const idParam = [param('id').isInt({ min: 1 }).withMessage('Invalid id')];

router.get('/stats', controller.getStats);
router.get('/users', controller.getAllUsers);
router.patch('/users/:id', idParam, validate, controller.updateUser);
router.delete('/users/:id', idParam, validate, controller.deleteUser);
router.delete('/trips/:id', idParam, validate, controller.deleteTrip);
router.delete('/bookings/:id', idParam, validate, controller.deleteBooking);

module.exports = router;
