const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuration for AI Provider
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1/chat/completions'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    baseUrl: 'https://api.anthropic.com/v1/messages'
  }
};

// ============================================
// DYNAMIC KNOWLEDGE BASE MANAGEMENT
// ============================================

// In-memory cache for workers knowledge base
let WORKERS_KNOWLEDGE_BASE = [];
let lastKnowledgeBaseUpdate = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Load workers from database into knowledge base
 */
async function loadWorkersKnowledgeBase() {
  try {
    console.log('[AI Service] Loading workers knowledge base from database...');

    const workers = await prisma.user.findMany({
      where: {
        usertype: 'USER',
        skills: { not: null }
      },
      select: {
        id: true,
        fname: true,
        lname: true,
        address: true,
        skills: true,
        about: true,
        jobApplications: {
          where: {
            applicationStatus: 'COMPLETED'
          },
          include: {
            orders: {
              include: {
                reviews: {
                  where: { approvalStatus: 'APPROVED' },
                  select: { rating: true }
                }
              }
            }
          }
        }
      }
    });

    WORKERS_KNOWLEDGE_BASE = workers.map(worker => {
      // Calculate average rating
      const allReviews = worker.jobApplications.flatMap(app =>
        app.orders.flatMap(order => order.reviews)
      );
      const avgRating = allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : null;

      // Parse skills string to array
      const skillsArray = worker.skills
        ? worker.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      // Extract city from address
      const city = extractCityFromAddress(worker.address);

      return {
        id: `W${worker.id.toString().padStart(3, '0')}`,
        odId: worker.id, // Original database ID
        name: `${worker.fname} ${worker.lname}`,
        city: city,
        skills: skillsArray,
        bio: worker.about || `${worker.fname} is a skilled worker.`,
        avgRating: avgRating ? parseFloat(avgRating) : null,
        completedJobs: worker.jobApplications.length
      };
    });

    lastKnowledgeBaseUpdate = Date.now();
    console.log(`[AI Service] Loaded ${WORKERS_KNOWLEDGE_BASE.length} workers into knowledge base`);

    return WORKERS_KNOWLEDGE_BASE;
  } catch (error) {
    console.error('[AI Service] Error loading knowledge base:', error);
    return WORKERS_KNOWLEDGE_BASE; // Return existing cache on error
  }
}

/**
 * Extract city from address string
 */
function extractCityFromAddress(address) {
  if (!address) return 'Unknown';

  const knownCities = [
    'Colombo', 'Gampaha', 'Kandy', 'Galle', 'Negombo',
    'Kalutara', 'Matara', 'Kurunegala', 'Jaffna', 'Batticaloa',
    'Anuradhapura', 'Ratnapura', 'Badulla', 'Trincomalee', 'Ampara',
    'Hambantota', 'Nuwara Eliya', 'Kegalle', 'Puttalam', 'Mannar'
  ];

  const addressLower = address.toLowerCase();
  for (const city of knownCities) {
    if (addressLower.includes(city.toLowerCase())) {
      return city;
    }
  }

  // If no known city found, try to extract last part of address
  const parts = address.split(',').map(p => p.trim());
  return parts[parts.length - 1] || 'Unknown';
}

/**
 * Get knowledge base (with caching)
 */
async function getWorkersKnowledgeBase() {
  const now = Date.now();

  // Reload if cache is stale or empty
  if (WORKERS_KNOWLEDGE_BASE.length === 0 ||
      !lastKnowledgeBaseUpdate ||
      (now - lastKnowledgeBaseUpdate) > CACHE_TTL) {
    await loadWorkersKnowledgeBase();
  }

  return WORKERS_KNOWLEDGE_BASE;
}

/**
 * Add or update a worker in the knowledge base
 * Call this when a user signs up or updates their profile
 */
async function syncWorkerToKnowledgeBase(userId) {
  try {
    const worker = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fname: true,
        lname: true,
        address: true,
        skills: true,
        about: true,
        usertype: true,
        jobApplications: {
          where: { applicationStatus: 'COMPLETED' },
          include: {
            orders: {
              include: {
                reviews: {
                  where: { approvalStatus: 'APPROVED' },
                  select: { rating: true }
                }
              }
            }
          }
        }
      }
    });

    if (!worker || worker.usertype !== 'USER') {
      console.log(`[AI Service] User ${userId} is not a regular user, skipping sync`);
      return;
    }

    // Calculate average rating
    const allReviews = worker.jobApplications.flatMap(app =>
      app.orders.flatMap(order => order.reviews)
    );
    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : null;

    // Parse skills
    const skillsArray = worker.skills
      ? worker.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const city = extractCityFromAddress(worker.address);

    const workerData = {
      id: `W${worker.id.toString().padStart(3, '0')}`,
      odId: worker.id,
      name: `${worker.fname} ${worker.lname}`,
      city: city,
      skills: skillsArray,
      bio: worker.about || `${worker.fname} is a skilled worker.`,
      avgRating: avgRating ? parseFloat(avgRating) : null,
      completedJobs: worker.jobApplications.length
    };

    // Find existing worker in cache
    const existingIndex = WORKERS_KNOWLEDGE_BASE.findIndex(w => w.odbId === userId);

    if (existingIndex >= 0) {
      // Update existing
      WORKERS_KNOWLEDGE_BASE[existingIndex] = workerData;
      console.log(`[AI Service] Updated worker ${userId} in knowledge base`);
    } else {
      // Add new
      WORKERS_KNOWLEDGE_BASE.push(workerData);
      console.log(`[AI Service] Added worker ${userId} to knowledge base`);
    }

    return workerData;
  } catch (error) {
    console.error(`[AI Service] Error syncing worker ${userId}:`, error);
    throw error;
  }
}

/**
 * Remove a worker from the knowledge base
 * Call this when a user is deleted
 */
function removeWorkerFromKnowledgeBase(userId) {
  const index = WORKERS_KNOWLEDGE_BASE.findIndex(w => w.odbId === userId);
  if (index >= 0) {
    WORKERS_KNOWLEDGE_BASE.splice(index, 1);
    console.log(`[AI Service] Removed worker ${userId} from knowledge base`);
  }
}

/**
 * Force refresh the knowledge base
 */
async function refreshKnowledgeBase() {
  lastKnowledgeBaseUpdate = null;
  return await loadWorkersKnowledgeBase();
}

// ============================================
// SYSTEM PROMPT GENERATION
// ============================================

/**
 * Generate system prompt with current knowledge base
 */
async function getSystemPrompt() {
  const workers = await getWorkersKnowledgeBase();

  return `You are an AI assistant for a worker-customer platform called "Wage Worker". Your role is to help users find workers for their tasks or help workers find jobs.

PLATFORM CONTEXT:
- Customers post jobs (painting, plumbing, electrical work, concrete work, tech support, etc.)
- Workers apply for jobs based on their skills and categories
- Each worker has: skills, location/city, and bio describing their expertise
- Each job has: title, description, required skills, location, hourly rate, category

AVAILABLE WORKERS DATABASE (${workers.length} workers):
${JSON.stringify(workers.slice(0, 50), null, 2)}

YOUR CAPABILITIES:
1. SEARCH_WORKERS: Help customers find suitable workers based on skills, location, ratings
2. SEARCH_JOBS: Help workers find jobs matching their skills and preferred location
3. GENERAL: Answer general questions about the platform

IMPORTANT INSTRUCTIONS:
- When users ask for workers, search the AVAILABLE WORKERS DATABASE above
- Match workers based on their skills and city/location
- If a user asks for "painting" match workers with painting-related skills
- If a user asks for "Colombo" match workers in Colombo city
- Return the matching worker IDs in the workerIds array so the system can fetch full details

RESPONSE FORMAT:
You MUST respond with a valid JSON object in this exact format:
{
  "intent": "SEARCH_WORKERS" | "SEARCH_JOBS" | "GENERAL",
  "entities": {
    "skills": ["skill1", "skill2"],
    "location": "extracted location or null",
    "category": "category name or null",
    "minRating": number or null,
    "maxRate": number or null,
    "keywords": ["keyword1", "keyword2"]
  },
  "workerIds": ["W001", "W002"],
  "response": "Your friendly response explaining the matches found. Include worker names and why they match.",
  "needsMoreInfo": false,
  "clarificationQuestion": null
}

MATCHING RULES:
1. For painting requests: match skills containing "Painting", "Wall Painting", "Interior Painting", "Exterior Painting"
2. For plumbing: match "Plumber", "Pipe Repair", "Bathroom Fitting", "Leak Repair"
3. For electrical: match "Electrician", "Wiring", "Lighting Installation"
4. For concrete/masonry: match "Concrete Work", "Masonry", "Brick Work", "Plastering"
5. Location matching: match city field
6. If both skill AND location specified, only return workers matching BOTH criteria

ALWAYS respond with valid JSON only - no markdown, no extra text.`;
}

// ============================================
// LLM API FUNCTIONS
// ============================================

/**
 * Call LLM API (supports both OpenAI and Anthropic)
 */
async function callLLM(messages) {
  const provider = AI_CONFIG.provider;

  try {
    if (provider === 'openai') {
      return await callOpenAI(messages);
    } else if (provider === 'anthropic') {
      return await callAnthropic(messages);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error('LLM API Error:', error);
    throw error;
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(messages) {
  const systemPrompt = await getSystemPrompt();

  const response = await fetch(AI_CONFIG.openai.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic (Claude) API
 */
async function callAnthropic(messages) {
  const systemPrompt = await getSystemPrompt();

  const response = await fetch(AI_CONFIG.anthropic.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.anthropic.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: AI_CONFIG.anthropic.model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API Error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Parse LLM response to JSON
 */
function parseLLMResponse(responseText) {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse LLM response:', responseText);
    return {
      intent: 'GENERAL',
      entities: {},
      workerIds: [],
      response: 'I understand you\'re looking for help. Could you please provide more details about what you\'re looking for?',
      needsMoreInfo: true,
      clarificationQuestion: 'Are you looking for workers to hire or jobs to apply for?'
    };
  }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Get workers from knowledge base by IDs
 */
async function getWorkersFromKnowledgeBase(workerIds) {
  if (!workerIds || workerIds.length === 0) return [];

  const workers = await getWorkersKnowledgeBase();

  return workers.filter(worker =>
    workerIds.includes(worker.id)
  ).map(worker => ({
    id: worker.id,
    dbId: worker.odbId,
    name: worker.name,
    location: worker.city,
    skills: worker.skills.join(', '),
    about: worker.bio,
    avgRating: worker.avgRating,
    totalReviews: 0,
    completedJobs: worker.completedJobs,
    categories: []
  }));
}

/**
 * Search workers from knowledge base using entities
 */
async function searchWorkersFromKnowledgeBase(entities) {
  const { skills, location, keywords } = entities;
  let workers = await getWorkersKnowledgeBase();
  let results = [...workers];

  // Filter by skills
  if (skills && skills.length > 0) {
    results = results.filter(worker => {
      const workerSkillsLower = worker.skills.map(s => s.toLowerCase());
      return skills.some(skill =>
        workerSkillsLower.some(ws =>
          ws.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ws)
        )
      );
    });
  }

  // Filter by keywords
  if (keywords && keywords.length > 0 && results.length === workers.length) {
    results = results.filter(worker => {
      const searchText = (worker.skills.join(' ') + ' ' + worker.bio).toLowerCase();
      return keywords.some(kw => searchText.includes(kw.toLowerCase()));
    });
  }

  // Filter by location
  if (location) {
    results = results.filter(worker =>
      worker.city.toLowerCase().includes(location.toLowerCase())
    );
  }

  return results.map(worker => ({
    id: worker.id,
    dbId: worker.odbId,
    name: worker.name,
    location: worker.city,
    skills: worker.skills.join(', '),
    about: worker.bio,
    avgRating: worker.avgRating,
    totalReviews: 0,
    completedJobs: worker.completedJobs,
    categories: []
  }));
}

/**
 * Search for workers from database
 */
async function searchWorkersFromDB(entities) {
  const { skills, location, minRating, keywords } = entities;

  const where = { usertype: 'USER' };
  const orConditions = [];

  if (skills && skills.length > 0) {
    skills.forEach(skill => {
      orConditions.push({ skills: { contains: skill } });
    });
  }

  if (keywords && keywords.length > 0) {
    keywords.forEach(keyword => {
      orConditions.push({ skills: { contains: keyword } });
      orConditions.push({ about: { contains: keyword } });
    });
  }

  if (location) {
    orConditions.push({ address: { contains: location } });
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  const workers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fname: true,
      lname: true,
      email: true,
      phonenumber: true,
      address: true,
      skills: true,
      about: true,
      jobApplications: {
        where: { applicationStatus: 'COMPLETED' },
        include: {
          job: { select: { category: true } },
          orders: {
            include: {
              reviews: {
                where: { approvalStatus: 'APPROVED' },
                select: { rating: true, comment: true }
              }
            }
          }
        }
      }
    },
    take: 20
  });

  const workersWithStats = workers.map(worker => {
    const allReviews = worker.jobApplications.flatMap(app =>
      app.orders.flatMap(order => order.reviews)
    );

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null;

    const categories = [...new Set(
      worker.jobApplications.map(app => app.job.category?.category).filter(Boolean)
    )];

    return {
      id: worker.id,
      name: `${worker.fname} ${worker.lname}`,
      email: worker.email,
      phone: worker.phonenumber,
      location: worker.address,
      skills: worker.skills,
      about: worker.about,
      avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
      totalReviews: allReviews.length,
      completedJobs: worker.jobApplications.length,
      categories: categories
    };
  });

  let filteredWorkers = workersWithStats;
  if (minRating) {
    filteredWorkers = workersWithStats.filter(w => w.avgRating && w.avgRating >= minRating);
  }

  filteredWorkers.sort((a, b) => {
    if (a.avgRating && !b.avgRating) return -1;
    if (!a.avgRating && b.avgRating) return 1;
    if (a.avgRating && b.avgRating && b.avgRating !== a.avgRating) {
      return b.avgRating - a.avgRating;
    }
    return b.completedJobs - a.completedJobs;
  });

  return filteredWorkers.slice(0, 10);
}

/**
 * Search for jobs
 */
async function searchJobs(entities) {
  const { skills, location, category, maxRate, keywords } = entities;

  const where = {
    status: 'Open',
    approvalStatus: 'APPROVED',
    jobType: 'PUBLIC'
  };

  const orConditions = [];

  if (skills && skills.length > 0) {
    skills.forEach(skill => {
      orConditions.push({ skills: { contains: skill } });
      orConditions.push({ title: { contains: skill } });
      orConditions.push({ description: { contains: skill } });
    });
  }

  if (keywords && keywords.length > 0) {
    keywords.forEach(keyword => {
      orConditions.push({ title: { contains: keyword } });
      orConditions.push({ description: { contains: keyword } });
      orConditions.push({ skills: { contains: keyword } });
    });
  }

  if (location) {
    orConditions.push({ location: { contains: location } });
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  if (category) {
    where.category = { category: { contains: category } };
  }

  if (maxRate) {
    where.hourlyRate = { lte: maxRate };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      category: true,
      createdUser: { select: { id: true, fname: true, lname: true, email: true } },
      _count: { select: { jobApplications: true } }
    },
    orderBy: { postedDate: 'desc' },
    take: 20
  });

  return jobs.map(job => ({
    id: job.id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    location: job.location,
    hourlyRate: job.hourlyRate,
    category: job.category?.category,
    postedDate: job.postedDate,
    postedBy: `${job.createdUser.fname} ${job.createdUser.lname}`,
    applicationsCount: job._count.jobApplications
  }));
}

// ============================================
// LOCAL FALLBACK PROCESSING
// ============================================

/**
 * Local intent detection and entity extraction (fallback when LLM fails)
 */
function localProcessMessage(userMessage) {
  const messageLower = userMessage.toLowerCase();

  let intent = 'GENERAL';
  if (messageLower.includes('find') || messageLower.includes('need') || messageLower.includes('hire') ||
      messageLower.includes('looking for') || messageLower.includes('search') || messageLower.includes('who can')) {
    if (messageLower.includes('job') || messageLower.includes('work') || messageLower.includes('opportunity')) {
      intent = 'SEARCH_JOBS';
    } else {
      intent = 'SEARCH_WORKERS';
    }
  }
  if (messageLower.includes('painter') || messageLower.includes('plumber') || messageLower.includes('electrician') ||
      messageLower.includes('masonry') || messageLower.includes('concrete')) {
    intent = 'SEARCH_WORKERS';
  }

  const skillKeywords = {
    'paint': ['Wall Painting', 'Interior Painting', 'Exterior Painting', 'Painting'],
    'painter': ['Wall Painting', 'Interior Painting', 'Exterior Painting', 'Painting'],
    'plumb': ['Plumber', 'Pipe Repair', 'Bathroom Fitting', 'Plumbing'],
    'plumber': ['Plumber', 'Pipe Repair', 'Plumbing'],
    'electric': ['Electrician', 'Wiring', 'Lighting Installation', 'Electrical'],
    'electrician': ['Electrician', 'Wiring', 'Electrical'],
    'concrete': ['Concrete Work', 'Concrete Repair', 'Slab Repair'],
    'masonry': ['Masonry', 'Brick Work', 'Plastering'],
    'wiring': ['Electrician', 'Wiring'],
    'leak': ['Plumber', 'Leak Repair'],
    'bathroom': ['Plumber', 'Bathroom Fitting'],
    'roof': ['Exterior Painting', 'Roof Painting'],
    'flooring': ['Concrete Work', 'Flooring']
  };

  const skills = [];
  for (const [keyword, mappedSkills] of Object.entries(skillKeywords)) {
    if (messageLower.includes(keyword)) {
      skills.push(...mappedSkills);
    }
  }

  const locations = ['colombo', 'gampaha', 'kandy', 'galle', 'negombo', 'kalutara', 'matara', 'kurunegala'];
  let location = null;
  for (const loc of locations) {
    if (messageLower.includes(loc)) {
      location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  return {
    intent,
    entities: {
      skills: [...new Set(skills)],
      location,
      keywords: skills.length > 0 ? skills : messageLower.split(' ').filter(w => w.length > 3)
    },
    workerIds: []
  };
}

// ============================================
// MAIN PROCESSING FUNCTION
// ============================================

/**
 * Process user message and return AI response with search results
 */
async function processMessage(userId, sessionId, userMessage) {
  try {
    let conversationHistory = [];
    if (sessionId) {
      const previousMessages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 10
      });

      conversationHistory = previousMessages.map(msg => ({
        role: msg.role.toLowerCase(),
        content: msg.content
      }));
    }

    conversationHistory.push({ role: 'user', content: userMessage });

    let parsed;
    let usedFallback = false;

    try {
      const llmResponse = await callLLM(conversationHistory);
      parsed = parseLLMResponse(llmResponse);
      console.log('LLM Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch (llmError) {
      console.error('LLM API failed, using local fallback:', llmError.message);
      usedFallback = true;
      const localResult = localProcessMessage(userMessage);
      parsed = {
        ...localResult,
        response: '',
        needsMoreInfo: false,
        clarificationQuestion: null
      };
    }

    let searchResults = null;

    if (parsed.intent === 'SEARCH_WORKERS' && !parsed.needsMoreInfo) {
      if (parsed.workerIds && parsed.workerIds.length > 0) {
        searchResults = await getWorkersFromKnowledgeBase(parsed.workerIds);
      }

      if (!searchResults || searchResults.length === 0) {
        searchResults = await searchWorkersFromKnowledgeBase(parsed.entities);
      }

      if (searchResults.length === 0) {
        const dbResults = await searchWorkersFromDB(parsed.entities);
        if (dbResults.length > 0) {
          searchResults = dbResults;
        }
      }
    } else if (parsed.intent === 'SEARCH_JOBS' && !parsed.needsMoreInfo) {
      searchResults = await searchJobs(parsed.entities);
    }

    let finalResponse = parsed.response || '';

    if (searchResults && searchResults.length > 0) {
      if (parsed.intent === 'SEARCH_WORKERS') {
        const workerNames = searchResults.slice(0, 5).map(w => w.name).join(', ');
        if (usedFallback || !finalResponse) {
          finalResponse = `I found ${searchResults.length} worker(s) matching your criteria: ${workerNames}.`;
          if (parsed.entities.location) {
            finalResponse += ` These workers are available in ${parsed.entities.location}.`;
          }
        } else if (!finalResponse.includes('found') && !finalResponse.includes('Found')) {
          finalResponse += `\n\nI found ${searchResults.length} worker(s) matching your criteria.`;
        }
      } else if (parsed.intent === 'SEARCH_JOBS') {
        if (usedFallback || !finalResponse) {
          finalResponse = `I found ${searchResults.length} job(s) matching your search criteria.`;
        } else {
          finalResponse += `\n\nI found ${searchResults.length} job(s) matching your criteria.`;
        }
      }
    } else if (parsed.intent !== 'GENERAL' && !parsed.needsMoreInfo) {
      finalResponse = `Unfortunately, I couldn't find any matches for your criteria. Try broadening your search or adjusting the requirements.`;
    } else if (!finalResponse) {
      finalResponse = `I'm here to help you find workers or jobs. Try asking something like "Find painters in Colombo" or "Show me plumbing jobs".`;
    }

    return {
      intent: parsed.intent,
      response: finalResponse,
      searchResults: searchResults,
      entities: parsed.entities,
      needsMoreInfo: parsed.needsMoreInfo || false,
      clarificationQuestion: parsed.clarificationQuestion || null
    };
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      intent: 'GENERAL',
      response: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
      searchResults: null,
      entities: {},
      needsMoreInfo: false,
      clarificationQuestion: null
    };
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

async function createSession(userId, title = null) {
  return await prisma.chatSession.create({
    data: { userId, title: title || 'New Chat' }
  });
}

async function getUserSessions(userId) {
  return await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });
}

async function getSessionMessages(sessionId, userId) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) throw new Error('Session not found');

  return await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  });
}

async function saveMessage(sessionId, role, content, intent = null, metadata = null) {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() }
  });

  return await prisma.chatMessage.create({
    data: { sessionId, role, content, intent, metadata }
  });
}

async function deleteSession(sessionId, userId) {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) throw new Error('Session not found');

  return await prisma.chatSession.delete({ where: { id: sessionId } });
}

async function getCategories() {
  return await prisma.jobCategory.findMany({
    select: { id: true, category: true }
  });
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Main functions
  processMessage,
  createSession,
  getUserSessions,
  getSessionMessages,
  saveMessage,
  deleteSession,
  searchWorkersFromDB,
  searchJobs,
  getCategories,

  // Knowledge base management
  syncWorkerToKnowledgeBase,
  removeWorkerFromKnowledgeBase,
  refreshKnowledgeBase,
  getWorkersKnowledgeBase,
  loadWorkersKnowledgeBase
};
