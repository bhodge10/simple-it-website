// Google Analytics 4 - Event Tracking for Simple IT
// Tracks key conversion events

// Track Lead Magnet Form Submission
document.addEventListener('DOMContentLoaded', function() {
    // Lead Magnet Form
    const leadForm = document.getElementById('leadMagnetForm');
    if (leadForm) {
        leadForm.addEventListener('submit', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Lead Generation',
                    'event_label': 'IT Security Checklist Download',
                    'value': 1
                });
                console.log('GA4: Lead magnet submission tracked');
            }
        });
    }

    // Ticket Submission Form
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'submit_ticket', {
                    'event_category': 'Support',
                    'event_label': 'Ticket Submission',
                    'value': 1
                });
                console.log('GA4: Ticket submission tracked');
            }
        });
    }

    // Phone Number Clicks
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'phone_call', {
                    'event_category': 'Contact',
                    'event_label': 'Phone Click',
                    'phone_number': this.getAttribute('href').replace('tel:', ''),
                    'value': 5
                });
                console.log('GA4: Phone click tracked');
            }
        });
    });

    // Email Clicks
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'email_click', {
                    'event_category': 'Contact',
                    'event_label': 'Email Click',
                    'value': 2
                });
                console.log('GA4: Email click tracked');
            }
        });
    });

    // Remote Support Download
    const remoteSupportBtn = document.querySelector('button[onclick*="startDownload"]');
    if (remoteSupportBtn) {
        // Override the startDownload function to track
        const originalStartDownload = window.startDownload;
        window.startDownload = function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'Support',
                    'event_label': 'Remote Support Tool Download',
                    'value': 3
                });
                console.log('GA4: Remote support download tracked');
            }
            if (originalStartDownload) {
                originalStartDownload();
            }
        };
    }

    // CTA Button Clicks (Get Started, Schedule Assessment, etc.)
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-cta, a[href*="contact"], button[type="submit"]');
    ctaButtons.forEach(function(button) {
        // Skip if already has event listener (ticket form, lead form)
        if (button.id !== 'ticketForm' && !button.closest('#lead-magnet-form')) {
            button.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    const buttonText = this.textContent.trim().substring(0, 50);
                    gtag('event', 'cta_click', {
                        'event_category': 'Engagement',
                        'event_label': buttonText,
                        'value': 1
                    });
                    console.log('GA4: CTA button click tracked -', buttonText);
                }
            });
        }
    });

    // Service Page Views (track which services get most interest)
    const servicePaths = [
        'managed-it-services',
        'cybersecurity-solutions',
        'cloud-solutions',
        'business-continuity',
        'emergency-it-support'
    ];
    
    servicePaths.forEach(function(service) {
        if (window.location.pathname.includes(service)) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'view_service', {
                    'event_category': 'Services',
                    'event_label': service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    'page_path': window.location.pathname
                });
                console.log('GA4: Service page view tracked -', service);
            }
        }
    });

    // Scroll Depth Tracking (for engagement)
    let scrollDepth = 0;
    const trackScrollDepth = function() {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
        
        if (scrollPercent > scrollDepth) {
            scrollDepth = scrollPercent;
            
            // Track at 25%, 50%, 75%, 100%
            if ([25, 50, 75, 100].includes(scrollPercent)) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth', {
                        'event_category': 'Engagement',
                        'event_label': scrollPercent + '% Scrolled',
                        'value': scrollPercent
                    });
                    console.log('GA4: Scroll depth tracked -', scrollPercent + '%');
                }
            }
        }
    };
    
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(trackScrollDepth, 100);
    });

    console.log('GA4 Event Tracking initialized for Simple IT');
});
