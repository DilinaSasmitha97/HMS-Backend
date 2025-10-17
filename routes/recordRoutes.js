const express = require('express');
const { listRecords, createRecord } = require('../controllers/recordController');
const router = express.Router();

router.get('/', listRecords);
router.post('/', createRecord);

module.exports = router;
