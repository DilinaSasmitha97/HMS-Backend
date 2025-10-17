const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/authController');
const router = express.Router();

router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

module.exports = router;
