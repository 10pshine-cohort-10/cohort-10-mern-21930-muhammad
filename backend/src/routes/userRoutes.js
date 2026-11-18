const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { handleGetCurrentUser } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authMiddleware, handleGetCurrentUser);

module.exports = router;
