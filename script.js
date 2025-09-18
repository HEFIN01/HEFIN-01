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