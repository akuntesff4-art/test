// Music Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const musicStatus = document.getElementById('musicStatus');
    const bgMusic = document.getElementById('bgMusic');
    
    // Load saved state
    const savedState = localStorage.getItem('zixxv1_music');
    if (savedState !== null) {
        const isOn = savedState === 'true';
        musicToggle.checked = isOn;
        updateMusicState(isOn);
    }
    
    // Toggle event
    musicToggle.addEventListener('change', function() {
        const isOn = this.checked;
        updateMusicState(isOn);
        localStorage.setItem('zixxv1_music', isOn);
        
        // Show notification
        const notifTitle = isOn ? 'Music Enabled' : 'Music Disabled';
        const notifMsg = isOn ? 'Background music is now playing.' : 'Background music is turned off.';
        showNotification(notifTitle, notifMsg, 'info');
    });
    
    function updateMusicState(isOn) {
        if (isOn) {
            bgMusic.play().catch(e => {
                console.log("Auto-play prevented. User interaction required.");
                musicToggle.checked = false;
                musicStatus.textContent = 'OFF';
                musicStatus.style.color = '#ff4757';
            });
            musicStatus.textContent = 'ON';
            musicStatus.style.color = '#25D366';
        } else {
            bgMusic.pause();
            musicStatus.textContent = 'OFF';
            musicStatus.style.color = '#ff4757';
        }
    }
    
    // Auto-play with user interaction
    document.body.addEventListener('click', function initMusic() {
        if (musicToggle.checked && bgMusic.paused) {
            bgMusic.play();
        }
        document.body.removeEventListener('click', initMusic);
    }, { once: true });
    
    // Helper notification function
    function showNotification(title, message, type) {
        // Reuse notification function from main script or create simple alert
        console.log(`[Music] ${title}: ${message}`);
    }
});