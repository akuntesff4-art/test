const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

let client = null;
let qrCodeData = null;

async function initWhatsAppClient(io) {
    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "zixxv1-client"
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
        }
    });

    // QR Code generation
    client.on('qr', async (qr) => {
        console.log('📱 WhatsApp QR received');
        qrCodeData = qr;
        
        // Generate QR image
        const qrImage = await qrcode.toDataURL(qr);
        
        // Emit to all connected clients
        io.emit('whatsapp_qr', {
            qr: qr,
            image: qrImage,
            timestamp: Date.now()
        });
        
        // Save QR to file (for backup)
        await fs.writeFile(
            path.join(__dirname, '../temp/qr.txt'),
            qr
        );
    });

    // When ready
    client.on('ready', () => {
        console.log('✅ WhatsApp Client is READY!');
        io.emit('whatsapp_status', {
            status: 'ready',
            message: 'WhatsApp connected successfully',
            phone: client.info.me.user
        });
        
        // Store client globally
        global.whatsappClient = client;
        global.isWhatsAppReady = true;
    });

    // Authentication failure
    client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp Auth Failure:', msg);
        io.emit('whatsapp_status', {
            status: 'auth_failed',
            message: msg
        });
    });

    // Disconnected
    client.on('disconnected', (reason) => {
        console.log('🔌 WhatsApp disconnected:', reason);
        io.emit('whatsapp_status', {
            status: 'disconnected',
            message: reason
        });
        global.isWhatsAppReady = false;
        
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
            console.log('🔄 Attempting WhatsApp reconnect...');
            client.initialize();
        }, 5000);
    });

    // Initialize client
    await client.initialize();
    
    return client;
}

// Send message function
async function sendWhatsAppMessage(to, message, options = {}) {
    if (!client || !global.isWhatsAppReady) {
        throw new Error('WhatsApp client not ready');
    }
    
    // Format number
    const formattedNumber = to.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;
    
    try {
        const result = await client.sendMessage(chatId, message, options);
        return {
            success: true,
            messageId: result.id.id,
            timestamp: result.timestamp,
            to: formattedNumber
        };
    } catch (error) {
        console.error('Error sending message:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Send media/file
async function sendMedia(to, filePath, caption = '') {
    if (!client || !global.isWhatsAppReady) {
        throw new Error('WhatsApp client not ready');
    }
    
    const formattedNumber = to.replace(/\D/g, '');
    const chatId = `${formattedNumber}@c.us`;
    
    try {
        const media = MessageMedia.fromFilePath(filePath);
        const result = await client.sendMessage(chatId, media, { caption });
        return {
            success: true,
            messageId: result.id.id
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Get current QR
function getCurrentQR() {
    return qrCodeData;
}

// Check if WhatsApp is ready
function isReady() {
    return global.isWhatsAppReady;
}

// Get client info
function getClientInfo() {
    if (!client) return null;
    return {
        phone: client.info?.me?.user,
        platform: client.info?.platform,
        pushname: client.info?.pushname
    };
}

module.exports = {
    initWhatsAppClient,
    sendWhatsAppMessage,
    sendMedia,
    getCurrentQR,
    isReady,
    getClientInfo
};