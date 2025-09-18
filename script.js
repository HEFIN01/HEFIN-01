// Global Variables
let currentUser = null;
let isUserDropdownOpen = false;
let currentSlide = 0;
let totalSlides = 5;
let isAutoPlaying = true;
let autoPlayInterval = null;
let progressInterval = null;

// DOM Loaded Event
document.addEventListener("DOMContentLoaded", function() {
    initializeSplashScreen();
    loadUserFromStorage();
    initializeIntersectionObservers();
});

// Splash Screen Functions
function initializeSplashScreen() {
    const splash = document.getElementById("splash-screen");
    const main = document.getElementById("main-content");

    // Auto hide splash after delay
    setTimeout(() => {
        hideSplash();
    }, 3500);

    // Click to hide splash
    splash.addEventListener("click", () => {
        hideSplash();
    });

    function hideSplash() {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = "none";
            main.style.display = "block";
            initializeImageSlider();
        }, 1000);
    }
}

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
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
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
    window.location.href = '#home';
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
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (isUserDropdownOpen && userProfile && !userProfile.contains(event.target)) {
        closeUserDropdown();
    }
    
    // Close mobile menu when clicking overlay
    if (event.target === mobileOverlay) {
        closeMobileMenu();
    }
});

// Modal Functions
function openSignInModal() {
    const modal = document.getElementById('signInModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignInModal() {
    const modal = document.getElementById('signInModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearFormErrors('signInForm');
}

function openSignUpModal() {
    const modal = document.getElementById('signUpModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignUpModal() {
    const modal = document.getElementById('signUpModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearFormErrors('signUpForm');
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

// Form Functions
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
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
                
                const lengthCheck = document.getElementById('lengthCheck');
                const upperCheck = document.getElementById('upperCheck');
                const lowerCheck = document.getElementById('lowerCheck');
                const numberCheck = document.getElementById('numberCheck');
                
                if (lengthCheck) lengthCheck.classList.toggle('valid', validation.hasLength);
                if (upperCheck) upperCheck.classList.toggle('valid', validation.hasUpper);
                if (lowerCheck) lowerCheck.classList.toggle('valid', validation.hasLower);
                if (numberCheck) numberCheck.classList.toggle('valid', validation.hasNumber);
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
    spinner.classList.remove('hidden');
    
    // Simulate API call
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
    spinner.classList.add('hidden');
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
    spinner.classList.remove('hidden');
    
    // Simulate API call
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
    const passwordStrength = document.getElementById('passwordStrength');
    if (passwordStrength) passwordStrength.style.display = 'none';
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    spinner.classList.add('hidden');
}

function signInUser(userData) {
    currentUser = userData;
    updateUserInterface();
    saveUserToStorage();
}

function signOut() {
    currentUser = null;
    updateUserInterface();
    removeUserFromStorage();
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
        // Desktop
        if (authSection) authSection.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        
        const initials = getInitials(currentUser.name);
        const avatarColor = generateAvatar(currentUser.email);
        
        const userInitials = document.getElementById('userInitials');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userInitials) userInitials.textContent = initials;
        if (userAvatar) userAvatar.style.backgroundColor = avatarColor;
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;
        
        // Mobile
        const mobileUserInitials = document.getElementById('mobileUserInitials');
        const mobileUserAvatar = document.getElementById('mobileUserAvatar');
        const mobileUserName = document.getElementById('mobileUserName');
        const mobileUserEmail = document.getElementById('mobileUserEmail');
        
        if (mobileUserInitials) mobileUserInitials.textContent = initials;
        if (mobileUserAvatar) mobileUserAvatar.style.backgroundColor = avatarColor;
        if (mobileUserName) mobileUserName.textContent = currentUser.name;
        if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;
        
        if (mobileAuthSection) mobileAuthSection.style.display = 'none';
        if (mobileUserInfo) mobileUserInfo.style.display = 'block';
        if (mobileUserActions) mobileUserActions.style.display = 'block';
        
        if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
        if (ctaButtons) ctaButtons.style.display = 'none';
        
    } else {
        // Desktop
        if (authSection) authSection.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        
        // Mobile
        if (mobileAuthSection) mobileAuthSection.style.display = 'block';
        if (mobileUserInfo) mobileUserInfo.style.display = 'none';
        if (mobileUserActions) mobileUserActions.style.display = 'none';
        
        if (welcomeTitle) welcomeTitle.textContent = 'Welcome to HealthFinance';
        if (ctaButtons) ctaButtons.style.display = 'flex';
        
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

// Local Storage Functions
function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
        }
    }
}

function removeUserFromStorage() {
    localStorage.removeItem('currentUser');
}

// Image Slider Functions
function initializeImageSlider() {
    console.log('Initializing Image Slider...');
    updateSlideDisplay();
    goToSlide(0);
    startAutoPlay();
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleSliderKeyboard);
    
    // Add touch event listeners for mobile
    const carousel = document.getElementById('imageCarousel');
    if (carousel) {
        let startX = 0;
        let startY = 0;
        let isScrolling = null;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = null;
        }, { passive: true });
        
        carousel.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            if (isScrolling === null) {
                isScrolling = Math.abs(currentY - startY) > Math.abs(currentX - startX);
            }
            
            if (!isScrolling) {
                e.preventDefault();
            }
        }, { passive: false });
        
        carousel.addEventListener('touchend', (e) => {
            if (isScrolling) return;
            
            const endX = e.changedTouches[0].clientX;
            const deltaX = startX - endX;
            
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, { passive: true });
    }
}

function handleSliderKeyboard(e) {
    // Don't handle keyboard if user is typing in an input
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            prevSlide();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextSlide();
            break;
        case ' ':
            e.preventDefault();
            toggleAutoPlay();
            break;
    }
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
    resetAutoPlayTimer();
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
    resetAutoPlayTimer();
}

function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Remove active classes from all slides and dots
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.nav-dot');
    
    slides.forEach(slide => {
        slide.classList.remove('carousel-active', 'carousel-prev');
    });
    
    dots.forEach(dot => {
        dot.classList.remove('dot-active');
    });
    
    // Add direction class to current slide
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('carousel-prev');
    }
    
    // Activate new slide and dot
    if (slides[index]) {
        slides[index].classList.add('carousel-active');
    }
    
    if (dots[index]) {
        dots[index].classList.add('dot-active');
    }
    
    currentSlide = index;
    updateSlideDisplay();
    resetProgressBar();
}

function updateSlideDisplay() {
    const currentSlideNum = document.getElementById('currentSlideNum');
    const totalSlidesNum = document.getElementById('totalSlidesNum');
    
    if (currentSlideNum) {
        currentSlideNum.textContent = String(currentSlide + 1).padStart(2, '0');
    }
    if (totalSlidesNum) {
        totalSlidesNum.textContent = String(totalSlides).padStart(2, '0');
    }
}

function startAutoPlay() {
    if (!isAutoPlaying) return;
    
    resetProgressBar();
    
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 6000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    const progressBar = document.getElementById('carouselProgressBar');
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'none';
    }
}

function resetAutoPlayTimer() {
    if (isAutoPlaying) {
        stopAutoPlay();
        setTimeout(() => {
            if (isAutoPlaying) {
                startAutoPlay();
            }
        }, 100);
    }
}

function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    if (isAutoPlaying) {
        startAutoPlay();
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
    } else {
        stopAutoPlay();
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
    }
    
    console.log('Auto-play', isAutoPlaying ? 'enabled' : 'disabled');
}

function resetProgressBar() {
    if (!isAutoPlaying) return;
    
    const progressBar = document.getElementById('carouselProgressBar');
    if (!progressBar) return;
    
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    
    // Force reflow
    progressBar.offsetHeight;
    
    setTimeout(() => {
        if (progressBar && isAutoPlaying) {
            progressBar.style.transition = 'width 6000ms linear';
            progressBar.style.width = '100%';
        }
    }, 100);
}

function handleCTAClick(cta) {
    console.log(`CTA clicked: ${cta}`);
    showToast(`${cta} clicked!`);
    
    // Handle different CTA actions
    const actions = {
        'Explore Solutions': () => console.log('Navigate to solutions page'),
        'Join Network': () => console.log('Open network registration'),
        'View Analytics': () => console.log('Open analytics dashboard'),
        'Learn More': () => console.log('Navigate to information page'),
        'Start Consultation': () => console.log('Open consultation booking')
    };
    
    if (actions[cta]) {
        actions[cta]();
    }
}

// Intersection Observer for Animations
function initializeIntersectionObservers() {
    // Observer for Why Choose section
    const whyChooseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    // Observer for Services section
    const servicesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                // Trigger decorative animations
                setTimeout(() => {
                    animateServiceDecorations();
                }, 800);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observer for Feature cards
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, delay);
            }
        });
    }, { threshold: 0.2 });

    // Observe sections
    const whyChooseSection = document.getElementById('whyChooseSection');
    const servicesSection = document.getElementById('servicesSection');
    const featureCards = document.querySelectorAll('.feature-card');

    if (whyChooseSection) {
        whyChooseObserver.observe(whyChooseSection);
    }

    if (servicesSection) {
        servicesObserver.observe(servicesSection);
    }

    featureCards.forEach(card => {
        featureObserver.observe(card);
    });
}

function animateServiceDecorations() {
    const decorations = document.querySelectorAll('.services-decoration');
    const dots = document.querySelectorAll('.services-pattern-dot');
    
    decorations.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate');
        }, index * 200);
    });
    
    dots.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animate');
        }, index * 100 + 500);
    });
}

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

// Visibility change (pause when tab is inactive)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoPlay();
    } else if (isAutoPlaying) {
        startAutoPlay();
    }
});

// Pause auto-play on hover
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('imageCarousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            if (isAutoPlaying) {
                stopAutoPlay();
            }
        });
        
        carousel.addEventListener('mouseleave', () => {
            if (isAutoPlaying) {
                startAutoPlay();
            }
        });
    }
});

console.log('HealthFinance application loaded successfully!');

// Vanilla JavaScript for Healthcare & Financial Services Animation
(function() {
    'use strict';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Early return if user prefers reduced motion
    if (prefersReducedMotion) {
        // Make all elements visible immediately
        document.addEventListener('DOMContentLoaded', function() {
            const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-feature');
            animatedElements.forEach(element => {
                element.classList.add('animate-in');
            });
        });
        return;
    }

    // Intersection Observer options
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '-50px 0px -50px 0px'
    };

    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = parseInt(element.getAttribute('data-delay')) || 0;
                
                setTimeout(() => {
                    element.classList.add('animate-in');
                    
                    // Animate icon wrapper after card animation
                    const iconWrapper = element.querySelector('.vanilla-service-icon-wrapper');
                    if (iconWrapper) {
                        setTimeout(() => {
                            iconWrapper.classList.add('animate-in');
                        }, 300);
                    }
                    
                    // Animate features with staggered delays
                    const features = element.querySelectorAll('.animate-feature');
                    features.forEach((feature, index) => {
                        const featureDelay = parseInt(feature.getAttribute('data-delay')) || 0;
                        setTimeout(() => {
                            feature.classList.add('animate-in');
                        }, 500 + featureDelay);
                    });
                    
                }, delay);
                
                // Stop observing this element
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Enhanced hover effects
    function addHoverEffects() {
        const serviceCards = document.querySelectorAll('.vanilla-service-card-container');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const iconWrapper = this.querySelector('.vanilla-service-icon-wrapper');
                if (iconWrapper) {
                    iconWrapper.style.transform = 'scale(1.1)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const iconWrapper = this.querySelector('.vanilla-service-icon-wrapper');
                if (iconWrapper && iconWrapper.classList.contains('animate-in')) {
                    iconWrapper.style.transform = 'scale(1)';
                }
            });
        });

        // Feature item hover effects
        const featureItems = document.querySelectorAll('.vanilla-service-feature-item');
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                if (this.classList.contains('animate-in')) {
                    this.style.transform = 'translateX(4px)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (this.classList.contains('animate-in')) {
                    this.style.transform = 'translateX(0)';
                }
            });
        });
    }

    // Initialize animations when DOM is ready
    function initializeAnimations() {
        // Observe elements for scroll animations
        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });

        // Add hover effects
        addHoverEffects();

        // Animate elements already in viewport on load
        setTimeout(() => {
            const viewportHeight = window.innerHeight;
            elementsToAnimate.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isInViewport = rect.top < viewportHeight && rect.bottom > 0;
                
                if (isInViewport && !element.classList.contains('animate-in')) {
                    const delay = parseInt(element.getAttribute('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-in');
                        
                        // Animate icon wrapper
                        const iconWrapper = element.querySelector('.vanilla-service-icon-wrapper');
                        if (iconWrapper) {
                            setTimeout(() => {
                                iconWrapper.classList.add('animate-in');
                            }, 300);
                        }
                        
                        // Animate features
                        const features = element.querySelectorAll('.animate-feature');
                        features.forEach((feature, index) => {
                            const featureDelay = parseInt(feature.getAttribute('data-delay')) || 0;
                            setTimeout(() => {
                                feature.classList.add('animate-in');
                            }, 500 + featureDelay);
                        });
                        
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, 100);
    }

    // Smooth scroll behavior for any internal links (optional enhancement)
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Performance optimization: throttle scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add scroll event listener for additional effects (if needed)
    const handleScroll = throttle(function() {
        // Additional scroll-based animations can be added here
        // Currently handled by Intersection Observer
    }, 16); // ~60fps

    // Initialize everything when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeAnimations();
            initSmoothScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });
        });
    } else {
        // DOM already loaded
        initializeAnimations();
        initSmoothScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Handle window resize for responsive animations
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Reinitialize hover effects after resize
            addHoverEffects();
        }, 250);
    });

    // Cleanup function (if needed for SPAs)
    window.vanillaServicesCleanup = function() {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
    };

})();

// Healthcare & Financial Planning Consultation and Calculator
(function() {
    'use strict';

    // DOM Elements
    const popupOverlay = document.getElementById('popupOverlay');
    const consultationPopup = document.getElementById('consultationPopup');
    const calculatorPopup = document.getElementById('calculatorPopup');
    const consultationForm = document.getElementById('consultationForm');

    // Initialize the application
    function initializeApp() {
        setupEventListeners();
        setupFormValidation();
        setupCalculatorTabs();
        setupDateConstraints();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // CTA Button clicks
        document.querySelectorAll('[data-popup]').forEach(button => {
            button.addEventListener('click', function() {
                const popupType = this.getAttribute('data-popup');
                openPopup(popupType);
            });
        });

        // Close button clicks
        document.querySelectorAll('[data-close]').forEach(button => {
            button.addEventListener('click', function() {
                const popupType = this.getAttribute('data-close');
                closePopup(popupType);
            });
        });

        // Overlay click to close
        popupOverlay.addEventListener('click', closeAllPopups);

        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllPopups();
            }
        });

        // Form submission
        consultationForm.addEventListener('submit', handleFormSubmission);

        // Calculator input changes
        document.querySelectorAll('.calc-input').forEach(input => {
            input.addEventListener('input', debounce(function() {
                const panel = this.closest('.calc-panel');
                if (panel && panel.classList.contains('active')) {
                    const panelId = panel.id;
                    if (panelId === 'savingsPanel') calculateHSA();
                    else if (panelId === 'insurancePanel') calculateInsurance();
                    else if (panelId === 'retirementPanel') calculateRetirement();
                }
            }, 500));
        });
    }

    // Open Popup
    function openPopup(type) {
        popupOverlay.classList.add('active');
        
        if (type === 'consultation') {
            consultationPopup.classList.add('active');
            // Focus first input and ensure proper scrolling
            setTimeout(() => {
                const firstInput = consultationPopup.querySelector('input');
                if (firstInput) firstInput.focus();
                
                // Ensure scroll container is properly set
                const scrollContainer = consultationPopup.querySelector('.consultation-form');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }, 300);
        } else if (type === 'calculator') {
            calculatorPopup.classList.add('active');
            // Trigger initial calculation and reset scroll
            setTimeout(() => {
                calculateHSA();
                
                // Ensure scroll container is properly set
                const scrollContainer = calculatorPopup.querySelector('.calculator-content');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }, 300);
        }
        
        // Prevent body scroll but allow popup content scroll
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
    }

    // Close Popup
    function closePopup(type) {
        if (type === 'consultation') {
            consultationPopup.classList.remove('active');
        } else if (type === 'calculator') {
            calculatorPopup.classList.remove('active');
        }
        
        // Check if any popup is still open
        const anyPopupOpen = document.querySelector('.popup-modal.active');
        if (!anyPopupOpen) {
            popupOverlay.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }

    // Close All Popups
    function closeAllPopups() {
        document.querySelectorAll('.popup-modal').forEach(popup => {
            popup.classList.remove('active');
        });
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    // Setup Form Validation
    function setupFormValidation() {
        const inputs = consultationForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }

    // Validate Individual Field
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        
        // Remove existing error state
        field.classList.remove('error');
        removeErrorMessage(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation
        if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }
        
        return true;
    }

    // Show Field Error
    function showFieldError(field, message) {
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Add error styles if not already defined
        if (!document.querySelector('style[data-form-errors]')) {
            const style = document.createElement('style');
            style.setAttribute('data-form-errors', '');
            style.textContent = `
                .form-input.error, .form-select.error, .form-textarea.error {
                    border-color: #ef4444 !important;
                }
                .field-error {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 4px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Remove Error Message
    function removeErrorMessage(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Handle Form Submission
    function handleFormSubmission(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = consultationForm.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Focus first error field
            const firstError = consultationForm.querySelector('.error');
            if (firstError) firstError.focus();
            return;
        }
        
        // Show loading state
        const submitBtn = consultationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // In a real application, you would send this data to your server
            const formData = new FormData(consultationForm);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Form submitted:', data);
            
            // Show success message
            showSuccessMessage('Thank you! Your consultation request has been submitted. We will contact you within 24 hours.');
            
            // Reset form and close popup
            consultationForm.reset();
            closePopup('consultation');
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        }, 2000);
    }

    // Show Success Message
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;
        
        // Add styles
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 400px;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation
        if (!document.querySelector('style[data-success-toast]')) {
            const style = document.createElement('style');
            style.setAttribute('data-success-toast', '');
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(successDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 5000);
    }

    // Setup Date Constraints
    function setupDateConstraints() {
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            // Set minimum date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            
            // Set maximum date to 3 months from today
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }

    // Setup Calculator Tabs
    function setupCalculatorTabs() {
        const tabs = document.querySelectorAll('.calc-tab');
        const panels = document.querySelectorAll('.calc-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetPanel = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding panel
                this.classList.add('active');
                document.getElementById(targetPanel + 'Panel').classList.add('active');
                
                // Trigger calculation for the active panel
                setTimeout(() => {
                    if (targetPanel === 'savings') calculateHSA();
                    else if (targetPanel === 'insurance') calculateInsurance();
                    else if (targetPanel === 'retirement') calculateRetirement();
                }, 100);
            });
        });
    }

    // HSA Calculator
    window.calculateHSA = function() {
        const currentAge = parseInt(document.getElementById('currentAge').value) || 30;
        const retirementAge = parseInt(document.getElementById('retirementAge').value) || 65;
        const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 300;
        const currentBalance = parseFloat(document.getElementById('currentBalance').value) || 5000;
        const annualReturn = parseFloat(document.getElementById('annualReturn').value) / 100 || 0.07;
        
        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;
        const monthlyReturn = annualReturn / 12;
        
        // Calculate future value of current balance
        const futureValueCurrent = currentBalance * Math.pow(1 + annualReturn, yearsToRetirement);
        
        // Calculate future value of monthly contributions (annuity)
        const futureValueContributions = monthlyContribution * 
            ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
        
        const totalAtRetirement = futureValueCurrent + futureValueContributions;
        const totalContributions = currentBalance + (monthlyContribution * monthsToRetirement);
        const investmentGrowth = totalAtRetirement - totalContributions;
        
        // Update UI
        document.getElementById('totalAtRetirement').textContent = formatCurrency(totalAtRetirement);
        document.getElementById('totalContributions').textContent = formatCurrency(totalContributions);
        document.getElementById('investmentGrowth').textContent = formatCurrency(investmentGrowth);
    };

    // Insurance Calculator
    window.calculateInsurance = function() {
        const familySize = parseInt(document.getElementById('familySize').value) || 1;
        const planType = document.getElementById('planType').value || 'silver';
        const monthlyPremium = parseFloat(document.getElementById('monthlyPremium').value) || 500;
        const deductible = parseFloat(document.getElementById('deductible').value) || 3000;
        const expectedMedical = parseFloat(document.getElementById('expectedMedical').value) || 2000;
        
        const annualPremium = monthlyPremium * 12;
        
        // Calculate out-of-pocket maximum based on plan type and family size
        const outOfPocketMaximums = {
            bronze: familySize === 1 ? 8700 : 17400,
            silver: familySize === 1 ? 8700 : 17400,
            gold: familySize === 1 ? 7000 : 14000,
            platinum: familySize === 1 ? 5000 : 10000
        };
        
        const outOfPocket = outOfPocketMaximums[planType];
        const actualOutOfPocket = Math.min(expectedMedical, Math.max(0, expectedMedical - deductible));
        const totalAnnualCost = annualPremium + actualOutOfPocket;
        
        // Update UI
        document.getElementById('annualPremium').textContent = formatCurrency(annualPremium);
        document.getElementById('outOfPocket').textContent = formatCurrency(outOfPocket);
        document.getElementById('totalAnnualCost').textContent = formatCurrency(totalAnnualCost);
    };

    // Retirement Healthcare Calculator
    window.calculateRetirement = function() {
        const retireAge = parseInt(document.getElementById('retireAge').value) || 65;
        const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value) || 85;
        const currentHealthSpending = parseFloat(document.getElementById('currentHealthSpending').value) || 4000;
        const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100 || 0.05;
        
        const yearsInRetirement = lifeExpectancy - retireAge;
        let totalCost = 0;
        
        // Calculate total healthcare costs with inflation
        for (let year = 0; year < yearsInRetirement; year++) {
            const yearCost = currentHealthSpending * Math.pow(1 + inflationRate, year);
            totalCost += yearCost;
        }
        
        const avgAnnualCost = totalCost / yearsInRetirement;
        const savingsTarget = totalCost * 1.2; // 20% buffer
        
        // Update UI
        document.getElementById('totalRetirementCost').textContent = formatCurrency(totalCost);
        document.getElementById('avgAnnualCost').textContent = formatCurrency(avgAnnualCost);
        document.getElementById('savingsTarget').textContent = formatCurrency(savingsTarget);
    };

    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Accessibility improvements
    function setupAccessibility() {
        // Trap focus within popups
        document.querySelectorAll('.popup-modal').forEach(popup => {
            popup.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    trapFocus(e, this);
                }
            });
        });
    }

    function trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            setupAccessibility();
            enableTouchScrolling();
            handleMobileViewport();
        });
    } else {
        initializeApp();
        setupAccessibility();
        enableTouchScrolling();
        handleMobileViewport();
    }

    // Get scrollbar width to prevent layout shift
    function getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        
        const inner = document.createElement('div');
        outer.appendChild(inner);
        
        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        
        return scrollbarWidth;
    }

    // Improve touch scrolling on iOS
    function enableTouchScrolling() {
        const scrollContainers = document.querySelectorAll('.consultation-form, .calculator-content');
        scrollContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.overflowScrolling = 'touch';
        });
    }

    // Handle mobile viewport height issues
    function handleMobileViewport() {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    }

    // Cleanup function for SPAs
    window.consultationCalculatorCleanup = function() {
        closeAllPopups();
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

})();