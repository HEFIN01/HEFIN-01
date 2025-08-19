// HEFIN Health & Finance Intelligence - JavaScript

// Global state
let calculatorData = {
    population: 250000,
    budget: 10000000,
    coverage: 80,
    results: {
        costSavings: 2300000,
        coverageImprovement: 15,
        additionalPeople: 37500,
        efficiencyMetrics: {
            administrativeEfficiency: 85,
            resourceAllocation: 92,
            providerPerformance: 78
        }
    }
};

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    } else {
        return num.toString();
    }
}

function formatCurrency(num) {
    if (num >= 1000000) {
        return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return '$' + (num / 1000).toFixed(0) + 'K';
    } else {
        return '$' + num.toString();
    }
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

// Navigation functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    } else {
        console.warn(`Element with ID "${sectionId}" not found`);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Calculator functions
function updateCalculator() {
    const population = parseInt(document.getElementById('population').value);
    const budget = parseInt(document.getElementById('budget').value);
    const coverage = parseInt(document.getElementById('coverage').value);

    // Update display values
    document.getElementById('population-value').textContent = formatNumber(population);
    document.getElementById('budget-value').textContent = formatCurrency(budget);
    document.getElementById('coverage-value').textContent = coverage + '%';

    // Store values
    calculatorData.population = population;
    calculatorData.budget = budget;
    calculatorData.coverage = coverage;

    // Auto-calculate with debouncing
    debouncedCalculate();
}

const debouncedCalculate = debounce(calculateOptimization, 500);

async function calculateOptimization() {
    const loadingElement = document.getElementById('loading');
    
    try {
        // Show loading state
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }

        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                population: calculatorData.population,
                budget: calculatorData.budget,
                coverage: calculatorData.coverage
            })
        });

        const data = await response.json();

        if (data.success) {
            calculatorData.results = data.results;
            updateCalculatorResults();
            showToast('Calculation Complete', 'Your health financing optimization results are ready.');
        } else {
            showToast('Calculation Failed', data.message || 'Unable to process calculation', 'error');
        }
    } catch (error) {
        console.error('Calculation error:', error);
        showToast('Error', 'Failed to calculate optimization. Please try again.', 'error');
    } finally {
        // Hide loading state
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
    }
}

function updateCalculatorResults() {
    const results = calculatorData.results;

    // Update summary values
    const costSavingsEl = document.getElementById('cost-savings');
    const coverageImprovementEl = document.getElementById('coverage-improvement');
    
    if (costSavingsEl) {
        costSavingsEl.textContent = formatCurrency(results.costSavings);
    }
    
    if (coverageImprovementEl) {
        coverageImprovementEl.textContent = '+' + results.coverageImprovement + '%';
    }

    // Update efficiency metrics
    const adminEfficiencyEl = document.getElementById('admin-efficiency');
    const resourceAllocationEl = document.getElementById('resource-allocation');
    const providerPerformanceEl = document.getElementById('provider-performance');
    
    if (adminEfficiencyEl) {
        adminEfficiencyEl.textContent = results.efficiencyMetrics.administrativeEfficiency + '%';
    }
    
    if (resourceAllocationEl) {
        resourceAllocationEl.textContent = results.efficiencyMetrics.resourceAllocation + '%';
    }
    
    if (providerPerformanceEl) {
        providerPerformanceEl.textContent = results.efficiencyMetrics.providerPerformance + '%';
    }

    // Update progress bars with animation
    const progressBars = document.querySelectorAll('.progress-fill');
    if (progressBars.length >= 3) {
        progressBars[0].style.width = results.efficiencyMetrics.administrativeEfficiency + '%';
        progressBars[1].style.width = results.efficiencyMetrics.resourceAllocation + '%';
        progressBars[2].style.width = results.efficiencyMetrics.providerPerformance + '%';
    }

    // Update additional people count
    const additionalPeopleEl = document.getElementById('additional-people');
    if (additionalPeopleEl) {
        additionalPeopleEl.textContent = formatNumber(results.additionalPeople);
    }
}

// Contact form handling
async function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const contactData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        organization: formData.get('organization') || '',
        message: formData.get('message')
    };

    // Get submit button for loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton.innerHTML;
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<svg class="animate-spin" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="32" stroke-dashoffset="32" opacity="0.3"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';

        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Message Sent Successfully!', 'Thank you for your interest in HEFIN. We\'ll get back to you soon.');
            form.reset();
        } else {
            showToast('Submission Failed', data.message || 'Unable to send message', 'error');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        showToast('Error', 'Failed to send message. Please try again.', 'error');
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
    }
}

// Toast notification system
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;

    // Update icon based on type
    if (toastIcon && type === 'error') {
        toastIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
        toastIcon.style.color = '#dc2626';
    } else if (toastIcon) {
        toastIcon.innerHTML = '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        toastIcon.style.color = '#16a34a';
    }

    // Show toast
    toast.classList.remove('hidden');
    toast.classList.add('show');

    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 5000);
}

// Animation observers for scroll effects
function setupScrollAnimations() {
    // Create intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.function-card, .stat-card, .flow-step');
    animatedElements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Smooth scrolling polyfill for older browsers
function polyfillSmoothScrolling() {
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Add smooth scrolling polyfill for older browsers
        const links = document.querySelectorAll('button[onclick*="scrollToSection"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// Keyboard accessibility
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Allow Escape key to close mobile menu
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        }

        // Allow Enter key on nav buttons
        if (e.key === 'Enter' && e.target.classList.contains('nav-link')) {
            e.target.click();
        }
    });
}

// Performance optimization - lazy loading for images and heavy content
function setupLazyLoading() {
    // Add lazy loading attributes to images if not already present
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
}

// Error handling for failed API requests
function setupGlobalErrorHandling() {
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showToast('Error', 'Something went wrong. Please refresh the page and try again.', 'error');
        event.preventDefault();
    });

    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });
}

// Patient Management Functions
let currentPatient = null;
let allPatients = [];

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data based on tab
    if (tabName === 'search') {
        loadPatientStats();
    }
}

// Patient registration form submission
async function submitPatientForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const patientData = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            patientData[key] = value;
        }
    }
    
    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showToast('Success', 'Patient registered successfully!', 'success');
            form.reset();
            loadPatientStats();
            
            // Switch to search tab to show the new patient
            setTimeout(() => {
                switchTab('search');
                searchPatients();
            }, 1000);
        } else {
            const error = await response.json();
            showToast('Error', error.message || 'Failed to register patient', 'error');
        }
    } catch (error) {
        console.error('Error registering patient:', error);
        showToast('Error', 'Network error. Please try again.', 'error');
    }
}

// Search patients
async function searchPatients() {
    const searchTerm = document.getElementById('patient-search').value.trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (!searchTerm) {
        try {
            const response = await fetch('/api/patients');
            if (response.ok) {
                allPatients = await response.json();
                displaySearchResults(allPatients);
            } else {
                console.error('Failed to fetch patients');
                displayNoResults('Failed to load patients');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            displayNoResults('Network error');
        }
        return;
    }
    
    try {
        const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
            const patients = await response.json();
            displaySearchResults(patients);
        } else {
            displayNoResults('No patients found');
        }
    } catch (error) {
        console.error('Error searching patients:', error);
        displayNoResults('Search failed');
    }
}

// Display search results
function displaySearchResults(patients) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!patients || patients.length === 0) {
        displayNoResults('No patients found');
        return;
    }
    
    const resultsHTML = patients.map(patient => `
        <div class="patient-card" onclick="selectPatient('${patient.id}')">
            <div class="patient-card-header">
                <div class="patient-name">${patient.firstName} ${patient.lastName}</div>
                <div class="patient-id">ID: ${patient.id.slice(0, 8)}</div>
            </div>
            <div class="patient-info">
                <div>Phone: ${patient.phone || 'N/A'}</div>
                <div>DOB: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                <div>Email: ${patient.email || 'N/A'}</div>
                <div>Gender: ${patient.gender || 'N/A'}</div>
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = resultsHTML;
}

// Display no results message
function displayNoResults(message) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <i data-lucide="users"></i>
            <p>${message}</p>
        </div>
    `;
    lucide.createIcons();
}

// Select a patient and show their records
async function selectPatient(patientId) {
    try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (response.ok) {
            currentPatient = await response.json();
            switchTab('records');
            displayPatientRecords(currentPatient);
        } else {
            showToast('Error', 'Failed to load patient details', 'error');
        }
    } catch (error) {
        console.error('Error loading patient:', error);
        showToast('Error', 'Network error loading patient', 'error');
    }
}

// Display patient records
function displayPatientRecords(patient) {
    const recordsContainer = document.getElementById('patient-records');
    
    const recordsHTML = `
        <div class="patient-header">
            <h3>${patient.firstName} ${patient.lastName}</h3>
            <p>Patient ID: ${patient.id}</p>
        </div>
        
        <div class="patient-details-grid">
            <div class="detail-section">
                <h4>Personal Information</h4>
                <div class="detail-item">
                    <strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Gender:</strong> ${patient.gender || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> ${patient.phone || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Email:</strong> ${patient.email || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Address:</strong> ${patient.address || 'N/A'}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Emergency Contact</h4>
                <div class="detail-item">
                    <strong>Name:</strong> ${patient.emergencyContactName || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> ${patient.emergencyContactPhone || 'N/A'}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Medical Information</h4>
                <div class="detail-item">
                    <strong>Blood Type:</strong> ${patient.bloodType || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Height:</strong> ${patient.height ? patient.height + ' cm' : 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Weight:</strong> ${patient.weight ? patient.weight + ' kg' : 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Allergies:</strong> ${patient.allergies || 'None reported'}
                </div>
                <div class="detail-item">
                    <strong>Current Medications:</strong> ${patient.currentMedications || 'None reported'}
                </div>
                <div class="detail-item">
                    <strong>Chronic Conditions:</strong> ${patient.chronicConditions || 'None reported'}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Insurance Information</h4>
                <div class="detail-item">
                    <strong>Provider:</strong> ${patient.insuranceProvider || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Policy Number:</strong> ${patient.policyNumber || 'N/A'}
                </div>
            </div>
        </div>
        
        <div class="patient-actions">
            <button class="btn btn-primary" onclick="editPatient('${patient.id}')">
                <i data-lucide="edit"></i>
                Edit Patient
            </button>
            <button class="btn btn-outline" onclick="addMedicalRecord('${patient.id}')">
                <i data-lucide="file-plus"></i>
                Add Record
            </button>
            <button class="btn btn-outline" onclick="generatePatientReport('${patient.id}')">
                <i data-lucide="printer"></i>
                Print Report
            </button>
        </div>
    `;
    
    recordsContainer.innerHTML = recordsHTML;
    lucide.createIcons();
}

// Load patient statistics
async function loadPatientStats() {
    try {
        const response = await fetch('/api/patients/stats');
        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
        }
    } catch (error) {
        console.error('Error loading patient stats:', error);
    }
}

// Update statistics display
function updateStatsDisplay(stats) {
    document.getElementById('total-patients').textContent = stats.totalPatients || 0;
    document.getElementById('new-registrations').textContent = stats.newRegistrations || 0;
    document.getElementById('avg-age').textContent = stats.averageAge || 0;
    document.getElementById('coverage-rate').textContent = `${stats.coverageRate || 0}%`;
}

// Quick action functions
function editPatient(patientId) {
    switchTab('register');
    showToast('Info', 'Edit functionality - populate form with patient data', 'info');
}

function addMedicalRecord(patientId) {
    showToast('Info', 'Medical record functionality would open here', 'info');
}

function generatePatientReport(patientId) {
    showToast('Info', 'Patient report generation would start here', 'info');
}

function exportPatients() {
    showToast('Info', 'Patient data export would start here', 'info');
}

function generateReport() {
    showToast('Info', 'Statistical report generation would start here', 'info');
}

// Initialize application
function initializeApp() {
    // Setup scroll effects
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Setup form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Setup calculator input listeners
    const populationSlider = document.getElementById('population');
    const budgetSlider = document.getElementById('budget');
    const coverageSlider = document.getElementById('coverage');
    
    if (populationSlider) populationSlider.addEventListener('input', updateCalculator);
    if (budgetSlider) budgetSlider.addEventListener('input', updateCalculator);
    if (coverageSlider) coverageSlider.addEventListener('input', updateCalculator);
    
    // Setup initial calculator display
    updateCalculator();
    
    // Setup animations
    setupScrollAnimations();
    
    // Setup accessibility
    setupKeyboardNavigation();
    polyfillSmoothScrolling();
    
    // Setup performance optimizations
    setupLazyLoading();
    
    // Setup error handling
    setupGlobalErrorHandling();
    
    // Setup patient management
    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', submitPatientForm);
    }
    
    // Setup search input
    const searchInput = document.getElementById('patient-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPatients();
            }
        });
    }
    
    // Load initial patient stats
    loadPatientStats();
    
    // Handle mobile menu clicks outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (mobileMenu && mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
    
    console.log('HEFIN application initialized successfully');
}

// DOM Content Loaded event
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// Export functions for global access (if needed)
window.HEFIN = {
    scrollToSection,
    toggleMobileMenu,
    updateCalculator,
    calculateOptimization,
    showToast,
    formatNumber,
    formatCurrency
};

// Make patient functions globally available
window.switchTab = switchTab;
window.searchPatients = searchPatients;
window.selectPatient = selectPatient;
window.editPatient = editPatient;
window.addMedicalRecord = addMedicalRecord;
window.generatePatientReport = generatePatientReport;
window.exportPatients = exportPatients;
window.generateReport = generateReport;