const express = require('express');
const router = express.Router();
const { queryAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/query', queryAI);

module.exports = router;
