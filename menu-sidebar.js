// Sidebar Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.querySelector('.main-container');
    const pairingModal = document.getElementById('pairingModal');
    const closeModal = document.querySelector('.close-modal');
    const manualPairButton = document.getElementById('manualPair');
    const pairingStatus = document.getElementById('pairingStatus');
    
    // Toggle sidebar
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        mainContainer.classList.add('sidebar-open');
    });
    
    closeMenu.addEventListener('click', function() {
        sidebar.classList.remove('active');
        mainContainer.classList.remove('sidebar-open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
                mainContainer.classList.remove('sidebar-open');
            }
        }
    });
    
    // Menu item click handlers
    document.getElementById('menuAddSender').addEventListener('click', function(e) {
        e.preventDefault();
        pairingModal.classList.add('active');
        sidebar.classList.remove('active');
        mainContainer.classList.remove('sidebar-open');
        
        // Simulate QR generation
        generateQRCode();
    });
    
    document.getElementById('menuDashboard').addEventListener('click', function(e) {
        e.preventDefault();
        sidebar.classList.remove('active');
        mainContainer.classList.remove('sidebar-open');
        showNotification('Dashboard', 'You are already on the dashboard.', 'info');
    });
    
    document.getElementById('menuLogs').addEventListener('click', function(e) {
        e.preventDefault();
        sidebar.classList.remove('active');
        mainContainer.classList.remove('sidebar-open');
        showNotification('Logs', 'Sent logs are displayed in the right panel.', 'info');
    });
    
    document.getElementById('menuUpcoming').addEventListener('click', function(e) {
        e.preventDefault();
        sidebar.classList.remove('active');
        mainContainer.classList.remove('sidebar-open');
        showNotification('Upcoming', 'New features: Multi-target, Scheduled bugs, Auto-exploit.', 'info');
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        pairingModal.classList.remove('active');
    });
    
    pairingModal.addEventListener('click', function(e) {
        if (e.target === pairingModal) {
            pairingModal.classList.remove('active');
        }
    });
    
    // Manual pairing
    manualPairButton.addEventListener('click', function() {
        const pairingCode = document.getElementById('pairingCode').value.trim();
        if (!pairingCode) {
            pairingStatus.textContent = 'Status: Please enter a pairing code.';
            pairingStatus.style.color = '#ff4757';
            return;
        }
        
        pairingStatus.textContent = `Status: Pairing with code ${pairingCode}...`;
        pairingStatus.style.color = '#ffa500';
        
        // Simulate pairing process
        setTimeout(() => {
            pairingStatus.innerHTML = `Status: <span style="color:#25D366">Successfully paired!</span> WhatsApp sender connected.`;
            showNotification('Pairing Successful', `WhatsApp sender is now connected via code: ${pairingCode}`, 'success');
            
            // Close modal after 2 seconds
            setTimeout(() => {
                pairingModal.classList.remove('active');
            }, 2000);
        }, 2000);
    });
    
    // Generate QR code (simulated)
    function generateQRCode() {
        const qrPlaceholder = document.getElementById('qrPlaceholder');
        const tempCode = 'ZX-' + Math.random().toString(36).substr(2, 8).toUpperCase();
        
        // In real implementation, use a QR library like qrcode.js
        qrPlaceholder.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WA_${tempCode}" 
                 alt="Pairing QR">
            <p style="margin-top:10px;color:#25D366;font-weight:bold">${tempCode}</p>
        `;
        
        pairingStatus.textContent = `Status: Scan QR or enter code: ${tempCode}`;
        pairingStatus.style.color = '#ffa500';
    }
    
    // Helper notification function
    function showNotification(title, message, type) {
        console.log(`[Menu] ${title}: ${message}`);
        // Could reuse the main notification system
        if (window.showNotification) {
            window.showNotification(title, message, type);
        }
    }
});