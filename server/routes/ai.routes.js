const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');

// All AI routes require authentication
router.use(authMiddleware);

// Chat routes
router.post('/chat', aiController.processChat);

// Session management
router.post('/sessions', aiController.createSession);
router.get('/sessions', aiController.getSessions);
router.get('/sessions/:sessionId/messages', aiController.getSessionMessages);
router.delete('/sessions/:sessionId', aiController.deleteSession);

// Direct search routes (without chat context)
router.post('/search/workers', aiController.searchWorkers);
router.post('/search/jobs', aiController.searchJobs);

// Utility routes
router.get('/categories', aiController.getCategories);

module.exports = router;
