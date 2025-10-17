const express = require('express');
const { listHospitals, createHospital } = require('../controllers/hospitalController');
const router = express.Router();

router.get('/', listHospitals);
router.post('/', createHospital);

module.exports = router;
