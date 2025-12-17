const express = require('express');
const router = express.Router();
const workerreview = require('../controllers/workerreview.controller');
const verifyToken = require('../middleware/auth');



// Get all reviews for a worker
router.get('/', jobController.getAllJobs);