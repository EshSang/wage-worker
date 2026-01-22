const aiService = require('../services/ai.service');

/**
 * Process a chat message
 * POST /api/ai/chat
 */
async function processChat(req, res) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Create session if not provided
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const session = await aiService.createSession(userId);
      activeSessionId = session.id;
    }

    // Save user message
    await aiService.saveMessage(activeSessionId, 'USER', message.trim());

    // Process with AI
    const result = await aiService.processMessage(userId, activeSessionId, message.trim());

    // Save assistant response
    await aiService.saveMessage(
      activeSessionId,
      'ASSISTANT',
      result.response,
      result.intent,
      {
        entities: result.entities,
        resultsCount: result.searchResults?.length || 0,
        needsMoreInfo: result.needsMoreInfo
      }
    );

    res.status(200).json({
      success: true,
      data: {
        sessionId: activeSessionId,
        response: result.response,
        intent: result.intent,
        searchResults: result.searchResults,
        needsMoreInfo: result.needsMoreInfo,
        clarificationQuestion: result.clarificationQuestion
      }
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
}

/**
 * Create a new chat session
 * POST /api/ai/sessions
 */
async function createSession(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    const session = await aiService.createSession(userId, title);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create session'
    });
  }
}

/**
 * Get user's chat sessions
 * GET /api/ai/sessions
 */
async function getSessions(req, res) {
  try {
    const userId = req.user.id;

    const sessions = await aiService.getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get sessions'
    });
  }
}

/**
 * Get messages for a session
 * GET /api/ai/sessions/:sessionId/messages
 */
async function getSessionMessages(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const messages = await aiService.getSessionMessages(parseInt(sessionId), userId);

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    const statusCode = error.message === 'Session not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get messages'
    });
  }
}

/**
 * Delete a chat session
 * DELETE /api/ai/sessions/:sessionId
 */
async function deleteSession(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    await aiService.deleteSession(parseInt(sessionId), userId);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    const statusCode = error.message === 'Session not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete session'
    });
  }
}

/**
 * Quick search for workers (without chat context)
 * POST /api/ai/search/workers
 */
async function searchWorkers(req, res) {
  try {
    const { skills, location, category, minRating, keywords } = req.body;

    const results = await aiService.searchWorkers({
      skills: skills || [],
      location,
      category,
      minRating,
      keywords: keywords || []
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search workers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search workers'
    });
  }
}

/**
 * Quick search for jobs (without chat context)
 * POST /api/ai/search/jobs
 */
async function searchJobs(req, res) {
  try {
    const { skills, location, category, maxRate, keywords } = req.body;

    const results = await aiService.searchJobs({
      skills: skills || [],
      location,
      category,
      maxRate,
      keywords: keywords || []
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search jobs'
    });
  }
}

/**
 * Get available categories
 * GET /api/ai/categories
 */
async function getCategories(req, res) {
  try {
    const categories = await aiService.getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get categories'
    });
  }
}

module.exports = {
  processChat,
  createSession,
  getSessions,
  getSessionMessages,
  deleteSession,
  searchWorkers,
  searchJobs,
  getCategories
};
