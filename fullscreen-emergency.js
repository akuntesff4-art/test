// NUKES ALL SCROLLBARS FOREVER
(function() {
    'use strict';
    
    // Nuclear option
    const nukeScroll = () => {
        // Kill all scroll events
        document.addEventListener('scroll', (e) => {
            e.preventDefault();
            window.scrollTo(0, 0);
        }, { passive: false });
        
        // Kill wheel events
        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) return;
            e.preventDefault();
        }, { passive: false });
        
        // Kill touch events
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) return;
            e.preventDefault();
        }, { passive: false });
        
        // Force position
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Hide scrollbars with extreme prejudice
        const styles = `
            html, body {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
            }
            
            * {
                overflow: visible !important;
                max-height: 100vh !important;
            }
            
            /* KILL SCROLLBARS IN ALL BROWSERS */
            ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                background: transparent !important;
            }
            
            /* FIREFOX */
            * {
                scrollbar-width: none !important;
            }
            
            /* IE */
            body {
                -ms-overflow-style: none !important;
            }
        `;
        
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        console.log('🔥 SCROLLBARS NUKED - FULLSCREEN ENFORCED');
    };
    
    // Run on every possible event
    ['DOMContentLoaded', 'load', 'resize', 'orientationchange'].forEach(event => {
        window.addEventListener(event, nukeScroll);
    });
    
    // Run now
    setTimeout(nukeScroll, 100);
    setInterval(nukeScroll, 5000); // Keep nuking every 5 seconds
})();