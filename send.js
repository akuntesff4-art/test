const express = require('express');
const router = express.Router();
const bugEngine = require('../bug-engine');
const database = require('../database');

// Send bug endpoint
router.post('/bug', async (req, res) => {
    try {
        const { target, bugType, payload } = req.body;
        
        if (!target || !bugType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const result = await bugEngine.sendBug(target, bugType, payload);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Send bug error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get bug status
router.get('/status/:bugId', async (req, res) => {
    try {
        // This would query database for bug status
        res.json({
            success: true,
            data: {
                status: 'completed',
                sent: 50,
                failed: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get available bug types
router.get('/bug-types', (req, res) => {
    const types = bugEngine.getBugTypes();
    res.json({
        success: true,
        data: types
    });
});

module.exports = router;