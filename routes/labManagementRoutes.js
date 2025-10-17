const express = require('express');
const { listLabs, createLab, updateLabSlots, patientScheduleLab, loginLab, setDayAvailability, getDayAvailability, searchLabsByDateAndTest } = require('../controllers/labManagementController');
const { requireAdmin: _requireAdmin, requireDoctor: _requireDoctor, requirePatient } = require('../middleware/auth');
// We'll add a simple lab auth check using role: 'lab' similar to doctor
const jwt = require('jsonwebtoken');
const config = require('../config');
function requireLab(req, res, next) {
	const h = req.headers.authorization || '';
	const token = h.startsWith('Bearer ') ? h.slice(7) : null;
	if (!token) {
		return res.status(401).json({ message: 'Missing token' });
	}
	try {
		const payload = jwt.verify(token, config.jwtSecret);
		if (payload.role !== 'lab') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		req.user = payload;
		next();
	} catch (_e) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}
const router = express.Router();

router.get('/labs', listLabs);
router.post('/labs', createLab);
router.put('/labs/:id/slots', updateLabSlots);
router.post('/requests/:labRequestId/schedule-by-patient', requirePatient, patientScheduleLab);
// Lab auth routes
router.post('/login', loginLab);
// Lab day availability management
router.post('/labs/:id/day-availability', requireLab, setDayAvailability);
router.get('/labs/:id/day-availability', requireLab, getDayAvailability);
// Public search for labs by date and test type (patients use this)
router.get('/search-availability', searchLabsByDateAndTest);

module.exports = router;
