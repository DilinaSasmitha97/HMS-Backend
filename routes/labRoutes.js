const express = require('express');
const { listLabRequests, createLabRequest, listLabTestTypes, completeLabRequest, verifyLabRequestPin } = require('../controllers/labController');
const router = express.Router();

router.get('/requests', listLabRequests);
router.post('/requests', createLabRequest);
router.patch('/requests/:id/complete', completeLabRequest);
router.post('/requests/:id/verify-pin', verifyLabRequestPin);
router.get('/test-types', listLabTestTypes);

module.exports = router;
