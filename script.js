// ============================================
// FULLSCREEN ENFORCEMENT SCRIPT
// ============================================

function enforceFullscreen() {
    // Remove any scrollbars
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Set viewport height properly
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.height = `${window.innerHeight}px`;
        document.body.style.height = `${window.innerHeight}px`;
    }
    
    // Initial set
    setVH();
    
    // Update on resize
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Prevent pull-to-refresh
    document.body.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) e.preventDefault();
    }, { passive: false });
    
    // Fix for mobile keyboards
    window.addEventListener('focusin', function() {
        setTimeout(() => {
            document.activeElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
    });
    
    // Force layout recalculation
    setTimeout(() => {
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }, 100);
}

// Call on load
document.addEventListener('DOMContentLoaded', enforceFullscreen);
window.addEventListener('load', enforceFullscreen);

// Fix for iOS specifically
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Fix viewport height on iOS
    function iosVH() {
        const doc = document.documentElement;
        doc.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
    
    window.addEventListener('resize', iosVH);
    iosVH();
}

// Emergency overflow killer
setInterval(() => {
    const html = document.documentElement;
    const body = document.body;
    
    if (html.scrollHeight > html.clientHeight || 
        body.scrollHeight > body.clientHeight) {
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        
        // Force hide scrollbars
        html.style.scrollbarWidth = 'none';
        body.style.scrollbarWidth = 'none';
        html.style.msOverflowStyle = 'none';
    }
}, 1000);

// Add CSS dynamically for extra safety
const fullscreenCSS = `
    /* KILL ALL SCROLL */
    * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
    }
    
    *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
    }
    
    /* FIX HEIGHT */
    html, body, .main-container {
        height: 100% !important;
        max-height: 100% !important;
        min-height: 100% !important;
    }
    
    /* PREVENT OVERFLOW */
    .dashboard-content {
        flex: 1 1 auto !important;
        min-height: 0 !important;
    }
    
    /* FIX FOR FIREFOX */
    @-moz-document url-prefix() {
        html, body {
            overflow: hidden !important;
            position: relative !important;
        }
    }
`;

const styleEl = document.createElement('style');
styleEl.textContent = fullscreenCSS;
document.head.appendChild(styleEl);