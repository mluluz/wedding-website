// Contemporary Moroccan Wedding Website JavaScript

// Configuration - Choose ONE integration method
const CONFIG = {
    // Google Sheets Integration (skip this - has security issues)
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    USE_GOOGLE_SHEETS: false,
    
    // Formspree Integration
    FORMSPREE_URL: 'https://formspree.io/f/xqadwqap',
    USE_FORMSPREE: true,
    
    // Google Forms Integration (CURRENT METHOD) - Using window.open method
    GOOGLE_FORM_BASE_URL: 'https://docs.google.com/forms/d/1jxP3y8WkO1zArXchnHaFjz-rp7UMVdWs-swcxBqmyZY/viewform',
    USE_GOOGLE_FORM: false,
    
    // Entry IDs from your Google Form (extracted automatically)
    FORM_ENTRIES: {
        name: 'entry.2046365531',      // Full Name
        email: 'entry.1603106130',     // Email Address
        partner: 'entry.2075552217',   // Will you be bringing a partner?
        partnerName: 'entry.725726397', // Partner's Full Name
        partnerEmail: 'entry.1231688777', // Partner's Email Address
        friday: 'entry.463410502',     // Friday - Welcome Drinks
        saturday: 'entry.1022025180',  // Saturday - Wedding Ceremony
        sunday: 'entry.1175204969',    // Sunday - Farewell Party
        dietary: 'entry.1483420764',   // Dietary Requirements
        kids: 'entry.75756871',        // Number of Children Attending
        nannies: 'entry.741249082',    // Will you need nanny services
        comments: 'entry.2114450058'   // Additional Comments
    },
    
    // Netlify Forms (if hosting on Netlify)
    USE_NETLIFY_FORMS: false
};

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a navigation link
    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background opacity on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(254, 252, 243, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(196, 93, 71, 0.15)';
        } else {
            navbar.style.background = 'rgba(254, 252, 243, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(196, 93, 71, 0.1)';
        }
    });

    // Partner Details Conditional Visibility
    const partnerYes = document.getElementById('partnerYes');
    const partnerNo = document.getElementById('partnerNo');
    const partnerDetails = document.getElementById('partnerDetails');
    const partnerNameField = document.getElementById('partnerName');
    const partnerEmailField = document.getElementById('partnerEmail');
    
    if (partnerYes && partnerNo && partnerDetails) {
        partnerYes.addEventListener('change', function() {
            if (this.checked) {
                partnerDetails.style.display = 'block';
                partnerDetails.style.animation = 'slideInUp 0.5s ease-out forwards';
                // Make partner fields required when visible
                partnerNameField.required = true;
                partnerEmailField.required = true;
            }
        });
        
        partnerNo.addEventListener('change', function() {
            if (this.checked) {
                partnerDetails.style.display = 'none';
                // Clear partner fields and remove required attribute
                partnerNameField.value = '';
                partnerEmailField.value = '';
                partnerNameField.required = false;
                partnerEmailField.required = false;
            }
        });
    }

    // RSVP Form Handling
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(rsvpForm);
            const data = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Validate required fields
            if (!data.name || !data.email) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Validate partner fields if partner is selected
            if (data.partner === 'yes') {
                if (!data.partnerName || !data.partnerEmail) {
                    showNotification('Please fill in your partner\'s details.', 'error');
                    return;
                }
                // Validate partner email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.partnerEmail)) {
                    showNotification('Please enter a valid email address for your partner.', 'error');
                    return;
                }
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Check if at least one event is selected
            if (!data.friday && !data.saturday && !data.sunday) {
                showNotification('Please select at least one event to attend.', 'error');
                return;
            }
            
            // Submit form data
            showLoadingState();
            
            // Choose integration method
            if (CONFIG.USE_GOOGLE_SHEETS && CONFIG.GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                submitToGoogleSheets(data);
            } else if (CONFIG.USE_FORMSPREE && CONFIG.FORMSPREE_URL !== 'YOUR_FORMSPREE_URL_HERE') {
                submitToFormspree(data);
            } else if (CONFIG.USE_GOOGLE_FORM) {
                submitToGoogleForm(data);
            } else if (CONFIG.USE_NETLIFY_FORMS) {
                // Netlify forms handle submission automatically, just show success
                hideLoadingState();
                showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
                resetForm();
            } else {
                // Simulate form submission for testing
                setTimeout(() => {
                    hideLoadingState();
                    showNotification('Thank you! Your RSVP has been submitted successfully. (Test Mode)', 'success');
                    resetForm();
                    console.log('RSVP Submission (Test Mode):', data);
                }, 2000);
            }
        });
    }

    // Submit data to Google Sheets
    function submitToGoogleSheets(data) {
        fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            hideLoadingState();
            if (result.status === 'success') {
                showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
                resetForm();
            } else {
                showNotification(result.message || 'There was an error submitting your RSVP. Please try again.', 'error');
            }
        })
        .catch(error => {
            hideLoadingState();
            console.error('Error submitting RSVP:', error);
            showNotification('There was an error submitting your RSVP. Please check your internet connection and try again.', 'error');
        });
    }

    // Submit data to Formspree
    function submitToFormspree(data) {
        const formData = new FormData();
        
        // Add all form fields
        formData.append('name', data.name || '');
        formData.append('email', data.email || '');
        formData.append('partner', data.partner || 'no');
        formData.append('partnerName', data.partnerName || '');
        formData.append('partnerEmail', data.partnerEmail || '');
        formData.append('friday', data.friday || 'not selected');
        formData.append('saturday', data.saturday || 'not selected');
        formData.append('sunday', data.sunday || 'not selected');
        formData.append('dietary', data.dietary || '');
        formData.append('kids', data.kids || '0');
        formData.append('nannies', data.nannies || 'not selected');
        formData.append('comments', data.comments || '');
        
        fetch(CONFIG.FORMSPREE_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                hideLoadingState();
                showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
                resetForm();
                return response.json();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error || 'Submission failed');
                });
            }
        })
        .catch(error => {
            hideLoadingState();
            console.error('Error submitting RSVP:', error);
            showNotification('There was an error submitting your RSVP. Please check your internet connection and try again.', 'error');
        });
    }

    // Submit data to Google Form
    function submitToGoogleForm(data) {
        console.log('=== GOOGLE FORM SUBMISSION DEBUG ===');
        console.log('Form data received:', data);
        
        const formData = new FormData();
        
        // Map form data to Google Form entries with debugging
        console.log('Mapping form data to Google Form entries...');
        
        formData.append(CONFIG.FORM_ENTRIES.name, data.name || '');
        console.log(`Name: "${data.name}" → ${CONFIG.FORM_ENTRIES.name}`);
        
        formData.append(CONFIG.FORM_ENTRIES.email, data.email || '');
        console.log(`Email: "${data.email}" → ${CONFIG.FORM_ENTRIES.email}`);
        
        // Partner field - need to match exact Google Form options
        const partnerValue = data.partner === 'yes' ? 'Yes' : 'No';
        formData.append(CONFIG.FORM_ENTRIES.partner, partnerValue);
        console.log(`Partner: "${data.partner}" → "${partnerValue}" → ${CONFIG.FORM_ENTRIES.partner}`);
        
        formData.append(CONFIG.FORM_ENTRIES.partnerName, data.partnerName || '');
        console.log(`Partner Name: "${data.partnerName}" → ${CONFIG.FORM_ENTRIES.partnerName}`);
        
        formData.append(CONFIG.FORM_ENTRIES.partnerEmail, data.partnerEmail || '');
        console.log(`Partner Email: "${data.partnerEmail}" → ${CONFIG.FORM_ENTRIES.partnerEmail}`);
        
        // Event attendance - need to match exact Google Form options
        const fridayValue = data.friday === 'yes' ? 'Attending' : 'Not Attending';
        formData.append(CONFIG.FORM_ENTRIES.friday, fridayValue);
        console.log(`Friday: "${data.friday}" → "${fridayValue}" → ${CONFIG.FORM_ENTRIES.friday}`);
        
        const saturdayValue = data.saturday === 'yes' ? 'Attending' : 'Not Attending';
        formData.append(CONFIG.FORM_ENTRIES.saturday, saturdayValue);
        console.log(`Saturday: "${data.saturday}" → "${saturdayValue}" → ${CONFIG.FORM_ENTRIES.saturday}`);
        
        const sundayValue = data.sunday === 'yes' ? 'Attending' : 'Not Attending';
        formData.append(CONFIG.FORM_ENTRIES.sunday, sundayValue);
        console.log(`Sunday: "${data.sunday}" → "${sundayValue}" → ${CONFIG.FORM_ENTRIES.sunday}`);
        
        formData.append(CONFIG.FORM_ENTRIES.dietary, data.dietary || '');
        console.log(`Dietary: "${data.dietary}" → ${CONFIG.FORM_ENTRIES.dietary}`);
        
        formData.append(CONFIG.FORM_ENTRIES.kids, data.kids || '0');
        console.log(`Kids: "${data.kids}" → ${CONFIG.FORM_ENTRIES.kids}`);
        
        const nanniesValue = data.nannies === 'yes' ? 'Yes' : 'No';
        formData.append(CONFIG.FORM_ENTRIES.nannies, nanniesValue);
        console.log(`Nannies: "${data.nannies}" → "${nanniesValue}" → ${CONFIG.FORM_ENTRIES.nannies}`);
        
        formData.append(CONFIG.FORM_ENTRIES.comments, data.comments || '');
        console.log(`Comments: "${data.comments}" → ${CONFIG.FORM_ENTRIES.comments}`);
        
        console.log('Submitting to:', CONFIG.GOOGLE_FORM_URL);
        
        // Also try URL-encoded submission as backup method
        const urlParams = new URLSearchParams();
        formData.forEach((value, key) => {
            urlParams.append(key, value);
        });
        console.log('URL parameters:', urlParams.toString());
        
        // Create prefilled form URL
        const prefilledUrl = CONFIG.GOOGLE_FORM_BASE_URL + '?' + urlParams.toString();
        console.log('🔗 PREFILLED FORM URL:', prefilledUrl);
        
        // Use window.open method (most reliable)
        submitViaWindowOpen(prefilledUrl, data);
    }

    // Submit via window.open (opens prefilled form)
    function submitViaWindowOpen(prefilledUrl, originalData) {
        console.log('Using window.open method...');
        console.log('Prefilled URL:', prefilledUrl);
        
        // Open prefilled form in new window
        const popup = window.open(prefilledUrl, '_blank', 'width=800,height=600');
        
        hideLoadingState();
        showNotification('A prefilled form has opened. Please click "Submit" to complete your RSVP.', 'success');
        resetForm();
        
        console.log('Opened prefilled form for user to submit:', originalData);
        
        // Focus on the popup
        if (popup) {
            popup.focus();
        }
    }

    // Alternative: Submit silently via hidden iframe (backup method)
    function submitViaSilentMethod(prefilledUrl, originalData) {
        console.log('Using silent submission method...');
        
        // Create temporary iframe for silent submission
        const tempIframe = document.createElement('iframe');
        tempIframe.style.display = 'none';
        tempIframe.src = prefilledUrl;
        document.body.appendChild(tempIframe);
        
        // Clean up after a few seconds
        setTimeout(() => {
            document.body.removeChild(tempIframe);
            hideLoadingState();
            showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
            resetForm();
            console.log('Silent submission completed:', originalData);
        }, 3000);
    }

    // Alternative: Submit via hidden image (pixel tracking method)
    function submitViaPixelTracking(submitUrl, originalData) {
        console.log('Using pixel tracking submission method...');
        
        const img = new Image();
        img.onload = () => {
            console.log('Pixel tracking submission completed');
            hideLoadingState();
            showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
            resetForm();
        };
        img.onerror = () => {
            console.log('Pixel submission error (but likely succeeded)');
            hideLoadingState();
            showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
            resetForm();
        };
        img.src = submitUrl;
    }

    // Reset form and hide partner details
    function resetForm() {
        rsvpForm.reset();
        // Hide partner details section after reset
        if (partnerDetails) {
            partnerDetails.style.display = 'none';
        }
    }

    // Show notification function
    function showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Loading state functions
    function showLoadingState() {
        const submitButton = document.querySelector('.btn-primary');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Submitting... ⏳';
            submitButton.style.opacity = '0.7';
        }
    }

    function hideLoadingState() {
        const submitButton = document.querySelector('.btn-primary');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit RSVP';
            submitButton.style.opacity = '1';
        }
    }

    // Add animation classes to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.schedule-card, .stay-card, .venue-card, .tip-card, .faq-item');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // Add sparkle effect to hero pattern on mouse move
    const heroPattern = document.querySelector('.hero-pattern');
    if (heroPattern) {
        document.addEventListener('mousemove', function(e) {
            const rect = heroPattern.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                createSparkle(x, y, heroPattern);
            }
        });
    }

    function createSparkle(x, y, container) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        container.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentElement) {
                sparkle.remove();
            }
        }, 1000);
    }

    // Form field focus effects
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on page load
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });

    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn-primary, .schedule-card, .venue-card');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for animations and effects
const style = document.createElement('style');
style.textContent = `
    /* Animation keyframes */
    @keyframes slideInUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes sparkle {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    /* Animation classes */
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }

    .schedule-card, .stay-card, .venue-card, .tip-card, .faq-item {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease-out;
    }

    /* Sparkle effect */
    .sparkle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #D4AF37, #C65D47);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkle 1s ease-out forwards;
        z-index: 1;
    }

    /* Notification styles */
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease-out;
    }

    .notification-success {
        border-left: 5px solid #2B7A7B;
    }

    .notification-error {
        border-left: 5px solid #C65D47;
    }

    .notification-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 0.5rem;
    }

    .notification-icon {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .notification-success .notification-icon {
        color: #2B7A7B;
    }

    .notification-error .notification-icon {
        color: #C65D47;
    }

    .notification-message {
        flex: 1;
        color: #1A1A1A;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6C757D;
        padding: 0;
        margin-left: 0.5rem;
    }

    .notification-close:hover {
        color: #C65D47;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Form focus effects */
    .form-group.focused label {
        color: #C65D47;
        transform: translateY(-2px);
    }

    /* Ripple effect */
    .schedule-card, .venue-card, .btn-primary {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }

    /* Mobile hamburger animation */
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;

document.head.appendChild(style);