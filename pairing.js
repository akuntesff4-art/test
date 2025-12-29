const express = require('express');
const router = express.Router();
const { getCurrentQR, getClientInfo } = require('../whatsapp');

// Get current QR code
router.get('/qr', async (req, res) => {
    try {
        const qr = getCurrentQR();
        
        if (!qr) {
            return res.json({
                success: false,
                message: 'QR not available yet. Please wait.'
            });
        }
        
        res.json({
            success: true,
            data: {
                qr: qr,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get WhatsApp status
router.get('/status', (req, res) => {
    const info = getClientInfo();
    
    res.json({
        success: true,
        data: {
            isReady: global.isWhatsAppReady,
            info: info
        }
    });
});

// Manual pairing (if needed)
router.post('/manual', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({
            success: false,
            error: 'Pairing code required'
        });
    }
    
    // Here you would implement manual pairing logic
    res.json({
        success: true,
        message: 'Manual pairing initiated',
        code: code
    });
});

module.exports = router;