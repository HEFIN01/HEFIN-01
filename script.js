 document.addEventListener("DOMContentLoaded", function() {
    const splash = document.getElementById("splash-screen");
    const main = document.getElementById("main-content");

    // After enough time, start fading out splash and show main
    const totalDuration = 3500;

    setTimeout(() => {
        splash.classList.add("fade-out");
    }, 2500);

    setTimeout(() => {
        splash.style.display = "none";
        main.style.display = "block";
        
        // Initialize slider after main content is shown
        initializeImageSlider();
    }, totalDuration);

    // Optionally hide on click too
    splash.addEventListener("click", () => {
        splash.classList.add("fade-out");
        setTimeout(() => {
            splash.style.display = "none";
            main.style.display = "block";
            // Initialize slider after main content is shown
            initializeImageSlider();
        }, 1000);
    });
});

// Website Main Functionality
let currentUser = null;
let isUserDropdownOpen = false;

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#dc2626'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function generateAvatar(email) {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const hash = email.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

// Navigation Functions
function goHome() {
    window.location.href = '#';
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    menu.classList.remove('active');
    overlay.classList.remove('active');
}

// User Dropdown Functions
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    isUserDropdownOpen = !isUserDropdownOpen;
    dropdown.classList.toggle('active', isUserDropdownOpen);
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    isUserDropdownOpen = false;
    dropdown.classList.remove('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userProfile = document.getElementById('userProfile');
    if (isUserDropdownOpen && !userProfile.contains(event.target)) {
        closeUserDropdown();
    }
});

// Modal Functions
function openSignInModal() {
    document.getElementById('signInModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignInModal() {
    document.getElementById('signInModal').classList.remove('active');
    document.body.style.overflow = '';
    clearFormErrors('signInForm');
}

function openSignUpModal() {
    document.getElementById('signUpModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignUpModal() {
    document.getElementById('signUpModal').classList.remove('active');
    document.body.style.overflow = '';
    clearFormErrors('signUpForm');
}

// Form Functions
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    button.innerHTML = isPassword ? 
        `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.014 10.014 0 00-2.142 2.428M9.878 9.878a3 3 0 104.243 4.243m4.242-4.242L19.07 7.05A10.014 10.014 0 0021.542 12c-.494 1.563-1.317 2.935-2.472 4.05m-4.242-4.242a3 3 0 00-4.243-4.243"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"/>
        </svg>` :
        `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>`;
}

function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    const errorElements = form.querySelectorAll('.error-message');
    const inputs = form.querySelectorAll('.form-input');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return {
        hasLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /\d/.test(password)
    };
}

// Password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const signUpPassword = document.getElementById('signUpPassword');
    if (signUpPassword) {
        signUpPassword.addEventListener('input', function() {
            const password = this.value;
            const strengthDiv = document.getElementById('passwordStrength');
            
            if (password) {
                strengthDiv.style.display = 'grid';
                const validation = validatePassword(password);
                
                document.getElementById('lengthCheck').classList.toggle('valid', validation.hasLength);
                document.getElementById('upperCheck').classList.toggle('valid', validation.hasUpper);
                document.getElementById('lowerCheck').classList.toggle('valid', validation.hasLower);
                document.getElementById('numberCheck').classList.toggle('valid', validation.hasNumber);
            } else {
                strengthDiv.style.display = 'none';
            }
        });
    }
});

// Authentication Functions
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const submitBtn = document.getElementById('signInSubmitBtn');
    const btnText = document.getElementById('signInBtnText');
    const spinner = document.getElementById('signInSpinner');
    
    clearFormErrors('signInForm');
    
    if (!email) {
        showError('signInEmail', 'Email is required');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('signInEmail', 'Please enter a valid email');
        return;
    }
    
    if (!password) {
        showError('signInPassword', 'Password is required');
        return;
    }
    
    if (password.length < 6) {
        showError('signInPassword', 'Password must be at least 6 characters');
        return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = {
        id: '1',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email
    };
    
    signInUser(userData);
    closeSignInModal();
    showToast(`Welcome back, ${userData.name}!`);
    
    document.getElementById('signInForm').reset();
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
}

async function handleSignUp(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgree = document.getElementById('termsAgree').checked;
    const submitBtn = document.getElementById('signUpSubmitBtn');
    const btnText = document.getElementById('signUpBtnText');
    const spinner = document.getElementById('signUpSpinner');
    
    clearFormErrors('signUpForm');
    
    let hasErrors = false;
    
    if (!firstName) {
        showError('firstName', 'First name is required');
        hasErrors = true;
    }
    
    if (!lastName) {
        showError('lastName', 'Last name is required');
        hasErrors = true;
    }
    
    if (!email) {
        showError('signUpEmail', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showError('signUpEmail', 'Please enter a valid email');
        hasErrors = true;
    }
    
    if (!password) {
        showError('signUpPassword', 'Password is required');
        hasErrors = true;
    } else {
        const validation = validatePassword(password);
        if (!validation.hasLength || !validation.hasUpper || !validation.hasLower || !validation.hasNumber) {
            showError('signUpPassword', 'Password must contain uppercase, lowercase, number and be 8+ characters');
            hasErrors = true;
        }
    }
    
    if (!confirmPassword) {
        showError('confirmPassword', 'Please confirm your password');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (!termsAgree) {
        showError('terms', 'You must agree to the terms and conditions');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userData = {
        id: Date.now().toString(),
        name: `${firstName} ${lastName}`,
        email: email
    };
    
    signInUser(userData);
    closeSignUpModal();
    showToast(`Welcome, ${userData.name}!`);
    
    document.getElementById('signUpForm').reset();
    document.getElementById('passwordStrength').style.display = 'none';
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
}

function signInUser(userData) {
    currentUser = userData;
    updateUserInterface();
}

function signOut() {
    currentUser = null;
    updateUserInterface();
    showToast('Successfully signed out');
}

function updateUserInterface() {
    const authSection = document.getElementById('authSection');
    const userProfile = document.getElementById('userProfile');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const ctaButtons = document.getElementById('ctaButtons');
    
    const mobileAuthSection = document.getElementById('mobileAuthSection');
    const mobileUserInfo = document.getElementById('mobileUserInfo');
    const mobileUserActions = document.getElementById('mobileUserActions');
    
    if (currentUser) {
        authSection.style.display = 'none';
        userProfile.style.display = 'block';
        
        const initials = getInitials(currentUser.name);
        const avatarColor = generateAvatar(currentUser.email);
        
        document.getElementById('userInitials').textContent = initials;
        document.getElementById('userAvatar').style.backgroundColor = avatarColor;
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        
        document.getElementById('mobileUserInitials').textContent = initials;
        document.getElementById('mobileUserAvatar').style.backgroundColor = avatarColor;
        document.getElementById('mobileUserName').textContent = currentUser.name;
        document.getElementById('mobileUserEmail').textContent = currentUser.email;
        
        mobileAuthSection.style.display = 'none';
        mobileUserInfo.style.display = 'block';
        mobileUserActions.style.display = 'block';
        
        welcomeTitle.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
        ctaButtons.style.display = 'none';
        
    } else {
        authSection.style.display = 'flex';
        userProfile.style.display = 'none';
        
        mobileAuthSection.style.display = 'block';
        mobileUserInfo.style.display = 'none';
        mobileUserActions.style.display = 'none';
        
        welcomeTitle.textContent = 'Welcome to HealthFinance';
        ctaButtons.style.display = 'flex';
        
        closeUserDropdown();
    }
}

function viewProfile() {
    showToast('Profile page would open here');
    closeUserDropdown();
}

function viewSettings() {
    showToast('Settings page would open here');
    closeUserDropdown();
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const signInModal = document.getElementById('signInModal');
    const signUpModal = document.getElementById('signUpModal');
    
    if (event.target === signInModal) {
        closeSignInModal();
    }
    
    if (event.target === signUpModal) {
        closeSignUpModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSignInModal();
        closeSignUpModal();
        closeMobileMenu();
        closeUserDropdown();
    }
});

// IMAGE SLIDER IMPLEMENTATION
class ImageCarouselSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Image Slider: Container element not found');
            return;
        }
        
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.dots = this.container.querySelectorAll('.nav-dot');
        this.currentSlideIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAutoPlaying = true;
        this.autoPlayTimer = null;
        this.isUserInteracting = false;
        
        // Configuration
        this.settings = {
            autoPlayInterval: options.autoPlayInterval || 6000,
            animationDuration: 600,
            pauseOnHover: options.pauseOnHover !== false,
            enableKeyboard: options.enableKeyboard !== false,
            enableTouch: options.enableTouch !== false,
            ...options
        };
        
        // DOM Elements
        this.prevButton = document.getElementById('carouselPrev');
        this.nextButton = document.getElementById('carouselNext');
        this.playToggleButton = document.getElementById('carouselPlayPause');
        this.currentSlideDisplay = document.getElementById('currentSlideNum');
        this.totalSlidesDisplay = document.getElementById('totalSlidesNum');
        this.progressBar = document.getElementById('carouselProgressBar');
        this.playIcon = this.playToggleButton?.querySelector('.play-icon');
        this.pauseIcon = this.playToggleButton?.querySelector('.pause-icon');
        
        this.initialize();
    }
    
    initialize() {
        if (this.totalSlides === 0) {
            console.error('Image Slider: No slides found');
            return;
        }
        
        this.setupEventListeners();
        this.updateSlideDisplay();
        this.displaySlide(0);
        this.startAutoPlay();
        
        console.log('Image Carousel Slider initialized with', this.totalSlides, 'slides');
    }
    
    setupEventListeners() {
        // Navigation buttons
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.goToPreviousSlide());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.goToNextSlide());
        }
        
        // Play/Pause button
        if (this.playToggleButton) {
            this.playToggleButton.addEventListener('click', () => this.toggleAutoPlay());
        }
        
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard controls
        if (this.settings.enableKeyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        }
        
        // Touch/Swipe support
        if (this.settings.enableTouch) {
            this.setupTouchControls();
        }
        
        // Hover pause functionality
        if (this.settings.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => {
                this.isUserInteracting = true;
                this.pauseAutoPlay();
            });
            this.container.addEventListener('mouseleave', () => {
                this.isUserInteracting = false;
                this.resumeAutoPlay();
            });
        }
        
        // Visibility change (pause when tab is inactive)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.isAutoPlaying && !this.isUserInteracting) {
                this.resumeAutoPlay();
            }
        });
        
        // CTA button handlers
        this.setupCTAHandlers();
    }
    
    setupCTAHandlers() {
        const ctaButtons = this.container.querySelectorAll('.content-button');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const ctaText = e.target.textContent.trim();
                console.log('CTA clicked:', ctaText);
                this.handleCTAAction(ctaText);
            });
        });
    }
    
    handleCTAAction(ctaText) {
        const actions = {
            'Explore Solutions': () => console.log('Navigate to solutions page'),
            'Join Network': () => console.log('Open network registration'),
            'View Analytics': () => console.log('Open analytics dashboard'),
            'Learn More': () => console.log('Navigate to information page'),
            'Start Consultation': () => console.log('Open consultation booking')
        };
        
        if (actions[ctaText]) {
            actions[ctaText]();
        } else {
            console.log('CTA action not defined for:', ctaText);
        }
    }
    
    setupTouchControls() {
        let startX = 0;
        let endX = 0;
        let startY = 0;
        let endY = 0;
        let isScrolling = null;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = null;
        }, { passive: true });
        
        this.container.addEventListener('touchmove', (e) => {
            endX = e.touches[0].clientX;
            endY = e.touches[0].clientY;
            
            if (isScrolling === null) {
                isScrolling = Math.abs(endY - startY) > Math.abs(endX - startX);
            }
            
            if (!isScrolling) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.container.addEventListener('touchend', () => {
            if (isScrolling) return;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.goToNextSlide();
                } else {
                    this.goToPreviousSlide();
                }
            }
        }, { passive: true });
    }
    
    handleKeyboardInput(e) {
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.goToPreviousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.goToNextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoPlay();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
        }
    }
    
    displaySlide(index, direction = 'next') {
        if (index < 0 || index >= this.totalSlides) {
            console.warn('Image Slider: Invalid slide index:', index);
            return;
        }
        
        // Remove active classes from all slides and dots
        this.slides.forEach(slide => {
            slide.classList.remove('carousel-active', 'carousel-prev');
        });
        this.dots.forEach(dot => dot.classList.remove('dot-active'));
        
        // Add direction class to current slide
        const currentSlideElement = this.slides[this.currentSlideIndex];
        const newSlideElement = this.slides[index];
        
        if (direction === 'prev') {
            currentSlideElement?.classList.add('carousel-prev');
        }
        
        // Activate new slide and dot
        newSlideElement.classList.add('carousel-active');
        if (this.dots[index]) {
            this.dots[index].classList.add('dot-active');
        }
        
        // Update current slide index
        this.currentSlideIndex = index;
        
        // Update display counter
        this.updateSlideDisplay();
        
        // Restart content animations
        this.restartContentAnimations(newSlideElement);
        
        // Reset progress bar
        this.resetProgressBar();
    }
    
    restartContentAnimations(slideElement) {
        const animatedElements = slideElement.querySelectorAll(
            '.content-badge, .content-title, .content-description, .content-button'
        );
        
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = null;
        });
    }
    
    goToNextSlide() {
        const nextIndex = (this.currentSlideIndex + 1) % this.totalSlides;
        this.displaySlide(nextIndex, 'next');
        this.resetAutoPlayTimer();
    }
    
    goToPreviousSlide() {
        const prevIndex = (this.currentSlideIndex - 1 + this.totalSlides) % this.totalSlides;
        this.displaySlide(prevIndex, 'prev');
        this.resetAutoPlayTimer();
    }
    
    goToSlide(index) {
        if (index === this.currentSlideIndex || index < 0 || index >= this.totalSlides) {
            return;
        }
        
        const direction = index > this.currentSlideIndex ? 'next' : 'prev';
        this.displaySlide(index, direction);
        this.resetAutoPlayTimer();
    }
    
    startAutoPlay() {
        if (!this.isAutoPlaying || this.isUserInteracting) return;
        
        this.resetProgressBar();
        
        this.autoPlayTimer = setInterval(() => {
            this.goToNextSlide();
        }, this.settings.autoPlayInterval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            this.progressBar.style.transition = 'none';
        }
    }
    
    pauseAutoPlay() {
        this.stopAutoPlay();
    }
    
    resumeAutoPlay() {
        if (this.isAutoPlaying && !this.isUserInteracting) {
            this.startAutoPlay();
        }
    }
    
    resetAutoPlayTimer() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
            setTimeout(() => {
                if (this.isAutoPlaying && !this.isUserInteracting) {
                    this.startAutoPlay();
                }
            }, 100);
        }
    }
    
    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        if (this.isAutoPlaying) {
            this.startAutoPlay();
            this.showPlayIcon(false);
        } else {
            this.stopAutoPlay();
            this.showPlayIcon(true);
        }
        
        console.log('Auto-play', this.isAutoPlaying ? 'enabled' : 'disabled');
    }
    
    showPlayIcon(show) {
        if (!this.playIcon || !this.pauseIcon) return;
        
        if (show) {
            this.pauseIcon.classList.add('slider-hidden');
            this.playIcon.classList.remove('slider-hidden');
        } else {
            this.playIcon.classList.add('slider-hidden');
            this.pauseIcon.classList.remove('slider-hidden');
        }
    }
    
    updateSlideDisplay() {
        if (this.currentSlideDisplay) {
            this.currentSlideDisplay.textContent = String(this.currentSlideIndex + 1).padStart(2, '0');
        }
        if (this.totalSlidesDisplay) {
            this.totalSlidesDisplay.textContent = String(this.totalSlides).padStart(2, '0');
        }
    }
    
    resetProgressBar() {
        if (!this.isAutoPlaying || !this.progressBar) return;
        
        this.progressBar.style.transition = 'none';
        this.progressBar.style.width = '0%';
        
        this.progressBar.offsetHeight; // Force reflow
        
        requestAnimationFrame(() => {
            if (this.progressBar) {
                this.progressBar.style.transition = `width ${this.settings.autoPlayInterval}ms linear`;
                this.progressBar.style.width = '100%';
            }
        });
    }
    
    // Public API methods
    play() {
        if (!this.isAutoPlaying) {
            this.toggleAutoPlay();
        }
    }
    
    pause() {
        if (this.isAutoPlaying) {
            this.toggleAutoPlay();
        }
    }
    
    next() {
        this.goToNextSlide();
    }
    
    previous() {
        this.goToPreviousSlide();
    }
    
    goto(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.goToSlide(index);
        }
    }
    
    getCurrentSlide() {
        return this.currentSlideIndex;
    }
    
    getTotalSlides() {
        return this.totalSlides;
    }
    
    isPlaying() {
        return this.isAutoPlaying;
    }
    
    destroy() {
        this.stopAutoPlay();
        console.log('Image Carousel Slider destroyed');
    }
}

// Initialize Image Slider Function
function initializeImageSlider() {
    console.log('Initializing Image Carousel Slider...');
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        const imageSlider = new ImageCarouselSlider('imageCarousel', {
            autoPlayInterval: 6000,
            pauseOnHover: true,
            enableKeyboard: true,
            enableTouch: true
        });
        
        // Performance optimizations
        let scrollTicking = false;
        
        function handleScroll() {
            scrollTicking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(handleScroll);
                scrollTicking = true;
            }
        }, { passive: true });
        
        // Preload images for better performance
        function preloadSliderImages() {
            const images = document.querySelectorAll('.carousel-bg-image');
            images.forEach(img => {
                if (img.src) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = img.src;
                    link.as = 'image';
                    document.head.appendChild(link);
                }
            });
        }
        
        // Preload images after initialization
        setTimeout(preloadSliderImages, 500);
        
        // Make slider globally accessible for external control
        window.imageCarouselSlider = imageSlider;
        
        console.log('Image Carousel Slider setup complete');
    }, 100);
}

// Initialize on page load if main content is already visible
document.addEventListener('DOMContentLoaded', function() {
    updateUserInterface();
    
    // Check if main content is already visible (in case splash was disabled)
    const mainContent = document.getElementById('main-content');
    if (mainContent && mainContent.style.display !== 'none') {
        initializeImageSlider();
    }
});
// Healthcare Features JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize animations
    initializeAnimations();
    
    // Add enhanced interactions
    addCardInteractions();
    
    // Add scroll animations for better performance on mobile
    addScrollAnimations();
});

function initializeAnimations() {
    const cards = document.querySelectorAll('.feature-card');
    
    // Staggered animation for cards
    cards.forEach((card, index) => {
        const delay = index * 200; // 200ms delay between each card
        card.style.animationDelay = `${delay}ms`;
    });
}

function addCardInteractions() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach(card => {
        const cardContent = card.querySelector('.card-content');
        const icon = card.querySelector('.icon-container');
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            // Add ripple effect
            createRippleEffect(cardContent, event);
            
            // Slight rotation on icon
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset icon transform
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
        
        // Touch support for mobile
        card.addEventListener('touchstart', function(e) {
            e.preventDefault();
            card.classList.add('touch-active');
            createRippleEffect(cardContent, e.touches[0]);
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                card.classList.remove('touch-active');
            }, 300);
        });
        
        // Keyboard navigation support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.add('keyboard-active');
                setTimeout(() => {
                    card.classList.remove('keyboard-active');
                }, 200);
            }
        });
    });
}

function createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (event?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function addScrollAnimations() {
    // Intersection Observer for scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Trigger staggered animation for cards
                const cards = entry.target.querySelectorAll('.feature-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 150);
                });
            }
        });
    }, observerOptions);
    
    const container = document.querySelector('.healthcare-container');
    if (container) {
        observer.observe(container);
    }
}

// Add CSS for additional animations
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Ripple animation */
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        /* Touch active state */
        .feature-card.touch-active .card-content {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
        
        /* Keyboard active state */
        .feature-card.keyboard-active .card-content {
            transform: scale(1.02);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        /* Scroll animation classes */
        .healthcare-container:not(.in-view) .feature-card {
            opacity: 0;
            transform: translateY(50px);
        }
        
        .feature-card.animate-in {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Parallax effect for icons on scroll */
        @media (min-width: 768px) {
            .feature-card.animate-in .icon-container {
                animation: floatIcon 3s ease-in-out infinite;
            }
        }
        
        @keyframes floatIcon {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-3px);
            }
        }
        
        /* Enhanced mobile interactions */
        @media (max-width: 768px) {
            .feature-card:active .card-content {
                transform: scale(0.98);
            }
        }
    `;
    document.head.appendChild(style);
}

// Performance optimization for animations
function optimizeAnimations() {
    // Disable animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        return;
    }
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', function() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            if (document.hidden) {
                card.style.animationPlayState = 'paused';
            } else {
                card.style.animationPlayState = 'running';
            }
        });
    });
}

// Initialize additional features
addDynamicStyles();
optimizeAnimations();

// Expose functions for external use
window.HealthcareFeatures = {
    reinitialize: initializeAnimations,
    addRipple: createRippleEffect
};