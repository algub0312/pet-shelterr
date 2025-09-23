// Authentication System for PawHaven
// js/auth.js

// ------------------ Storage keys (localStorage) ------------------
const USERS_KEY = 'pawhaven_users';
const CURRENT_USER_KEY = 'pawhaven_current_user';
const APPLICATIONS_KEY = 'pawhaven_applications';

// ------------------ Demo users seeded into storage on first load ------------------
const DEMO_USERS = {
    1: {
        id: 1,
        email: 'user@pawhaven.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '(555) 123-4567',
        address: '123 Pet Street, Animal City, AC 12345',
        role: 'user',
        joinDate: '2024-09-01',
        preferences: {
            petType: 'dog',
            newsletter: true
        }
    },
    2: {
        id: 2,
        email: 'admin@pawhaven.com',
        password: 'admin123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '(555) 987-6543',
        address: '456 Shelter Ave, Animal City, AC 12345',
        role: 'admin',
        joinDate: '2024-01-01',
        preferences: {
            newsletter: true
        }
    }
};

// ------------------ Bootstrapping on DOM ready ------------------
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth system loading...');
    initializeAuth();      // seed demo users if needed, check session
    updateNavigation();    // show login/register or user controls in nav
    
    // Page-aware initialization (profile/admin redirects & setup)
    const currentPage = getCurrentPageType();
    const currentUser = getCurrentUser();
    
    if (currentPage === 'profile' && currentUser) {
        if (currentUser.role === 'admin') {
            // Admins don't have a regular profile page; send to admin dashboard
            window.location.href = 'admin.html';
        } else {
            // Regular user profile: set up tabs and load data
            initializeTabs();
            initializeProfilePage();
        }
    } else if (currentPage === 'admin' && currentUser) {
        if (currentUser.role !== 'admin') {
            // Non-admins trying to access admin: send them back to profile
            window.location.href = 'profile.html';
        } else {
            // Admin dashboard setup (basic)
            initializeAdminDashboard();
        }
    }
});

// ------------------ Determine current page context ------------------
function getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('profile.html')) return 'profile';
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('login.html')) return 'login';
    if (path.includes('register.html')) return 'register';
    return 'home';
}

// ------------------ Minimal admin dashboard init (auth-side) ------------------
function initializeAdminDashboard() {
    console.log('Initializing admin dashboard...');
    
    // If a tab UI exists, set it up
    initializeTabs();
    
    // Compute and show admin stats (placeholder numbers)
    loadAdminStats();
    
    // Greet the admin
    showAlert('Welcome to Admin Dashboard!', 'success');
}

// ------------------ Compute & display admin stats (auth-side) ------------------
function loadAdminStats() {
    console.log('Loading admin statistics...');
    
    // Read persisted data
    const applications = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    // Basic counters; demo accounts (2) are excluded from totalUsers
    const stats = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        totalUsers: Math.max(0, Object.keys(users).length - 2) // Exclude demo accounts
    };
    
    console.log('Admin stats:', stats);
    
    // Push numbers into any matching DOM counters if present
    updateStatDisplay('total-applications', stats.totalApplications);
    updateStatDisplay('pending-applications', stats.pendingApplications);
    updateStatDisplay('approved-applications', stats.approvedApplications);
    updateStatDisplay('total-users', stats.totalUsers);
}

// ------------------ Helper to set a stat number in DOM ------------------
function updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// ------------------ Generic tab system (button + panel) ------------------
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    console.log('Initializing tabs:', tabButtons.length, 'buttons found');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            console.log('Switching to tab:', targetTab);
            
            // Deactivate all buttons & panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Activate clicked button
            this.classList.add('active');
            
            // Show the corresponding panel by id
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
                console.log('Activated panel:', targetTab);
            } else {
                console.error('Panel not found:', targetTab);
            }
        });
    });
}

// ------------------ Profile page init: load user envelope & apps ------------------
function initializeProfilePage() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No user logged in, redirecting...');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Loading profile for:', currentUser.email);
    
    // Fill header and form with user data
    loadUserProfile(currentUser);
    // Load & render user's adoption applications
    loadUserApplications(currentUser);
}

// ------------------ Fill profile header & form fields ------------------
function loadUserProfile(user) {
    console.log('Loading profile data for:', user.firstName);
    
    // Profile header (avatar initials, name, email)
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-info h1');
    const profileEmail = document.querySelector('.profile-info p');
    
    if (profileAvatar) {
        profileAvatar.textContent = user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
    }
    if (profileName) {
        profileName.textContent = `${user.firstName} ${user.lastName}`;
    }
    if (profileEmail) {
        profileEmail.textContent = user.email;
    }
    
    // Editable profile form fields
    const form = document.getElementById('profile-form');
    if (form) {
        const firstNameInput = form.querySelector('#firstName');
        const lastNameInput = form.querySelector('#lastName');
        const emailInput = form.querySelector('#email');
        const phoneInput = form.querySelector('#phone');
        const addressInput = form.querySelector('#address');
        
        if (firstNameInput) firstNameInput.value = user.firstName || '';
        if (lastNameInput) lastNameInput.value = user.lastName || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (addressInput) addressInput.value = user.address || '';
        
        console.log('Profile form filled with user data');
    }
}

// ------------------ Render list of current user's applications ------------------
function loadUserApplications(user) {
    const applications = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    const userApplications = applications.filter(app => app.userId === user.id);
    
    const container = document.getElementById('user-applications');
    if (!container) return;
    
    console.log('Loading applications:', userApplications.length, 'found');
    
    if (userApplications.length === 0) {
        container.innerHTML = '<p class="no-data">You haven\'t submitted any adoption applications yet. <a href="pets.html">Browse our available pets</a> to get started!</p>';
        return;
    }
    
    // Create compact cards for each application
    container.innerHTML = userApplications.map(app => `
        <div class="application-card">
            <div class="application-header">
                <div class="application-pet">
                    <img src="${app.petImage || 'images/pets/placeholder.jpg'}" alt="${app.petName}" class="pet-thumb" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                    <div class="pet-details">
                        <h4>${app.petName}</h4>
                        <p>${app.petBreed || 'Mixed Breed'}</p>
                    </div>
                </div>
                <span class="application-status status-${app.status}" style="padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                    ${app.status.toUpperCase()}
                </span>
            </div>
            <div class="application-body" style="padding: 16px;">
                <p class="application-date" style="color: #666; font-size: 14px;">Applied on ${formatDate(app.submittedAt)}</p>
                <p>Status: ${getStatusDescription(app.status)}</p>
                ${app.notes ? `<p><strong>Notes:</strong> ${app.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// ------------------ Formatting helpers ------------------
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusDescription(status) {
    const descriptions = {
        pending: 'Your application is being reviewed by our team.',
        approved: 'Congratulations! Your application has been approved.',
        rejected: 'Unfortunately, your application was not approved at this time.'
    };
    return descriptions[status] || 'Status unknown';
}

// ------------------ Auth initialization (seed & session check) ------------------
function initializeAuth() {
    // Seed demo users if USERS_KEY is empty
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
        console.log('Demo users initialized');
    }
    
    // Log current session state (if any)
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log('User logged in:', currentUser.email);
    } else {
        console.log('No user logged in');
    }
}

// ------------------ Session management ------------------
function getCurrentUser() {
    const sessionData = localStorage.getItem(CURRENT_USER_KEY);
    if (!sessionData) return null;
    
    try {
        const user = JSON.parse(sessionData);
        
        // Session expiry: 24h if "remember me", else 2h
        const maxAge = user.remember ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
        if (Date.now() - user.sessionStart > maxAge) {
            logout();
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error parsing user session:', error);
        logout();
        return null;
    }
}

// ------------------ Update header nav according to auth state ------------------
function updateNavigation() {
    const currentUser = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) {
        console.error('Nav menu not found');
        return;
    }
    
    // Remove any previously added auth-related links to avoid duplicates
    const existingAuthLinks = navMenu.querySelectorAll('.auth-nav-link');
    existingAuthLinks.forEach(link => link.remove());
    
    if (currentUser) {
        console.log('Adding user navigation for:', currentUser.firstName);
        
        if (currentUser.role === 'admin') {
            // Admin sees a gear icon + link to admin dashboard
            const adminLink = document.createElement('li');
            adminLink.innerHTML = `<a href="admin.html" class="nav-link auth-nav-link">⚙️ Admin</a>`;
            navMenu.appendChild(adminLink);
        } else {
            // Regular user sees a profile shortcut with their name
            const profileLink = document.createElement('li');
            profileLink.innerHTML = `<a href="profile.html" class="nav-link auth-nav-link">👤 ${currentUser.firstName}</a>`;
            navMenu.appendChild(profileLink);
        }
        
        // Logout link (always available when logged in)
        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = `<a href="#" class="nav-link auth-nav-link" onclick="logout()">Logout</a>`;
        navMenu.appendChild(logoutLink);
    } else {
        console.log('Adding guest navigation');
        
        // Show Login/Sign Up when no session is present
        const loginLink = document.createElement('li');
        loginLink.innerHTML = `<a href="login.html" class="nav-link auth-nav-link">Login</a>`;
        navMenu.appendChild(loginLink);
        
        const registerLink = document.createElement('li');
        registerLink.innerHTML = `<a href="register.html" class="nav-link auth-nav-link btn-adopt">Sign Up</a>`;
        navMenu.appendChild(registerLink);
    }
}

// ------------------ Demo login shortcuts (user/admin) ------------------
function loginDemo(userType) {
    // Pick a demo user by their role
    const demoUser = Object.values(DEMO_USERS).find(user => user.role === userType);
    if (!demoUser) return;
    
    // Create session (not "remember me" for demo)
    storeUserSession(demoUser, false);
    
    // Feedback + nav refresh
    showAlert('Welcome, ' + demoUser.firstName + '!', 'success');
    updateNavigation();
    
    // Route to the right dashboard/profile
    setTimeout(() => {
        if (demoUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }
    }, 1500);
}

// ------------------ Quick admin link (checks role) ------------------
function quickAdminAccess() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        showAlert('Access denied. Admin privileges required.', 'error');
    }
}

// ------------------ Persist session in localStorage ------------------
function storeUserSession(user, remember) {
    const sessionData = {
        ...user,
        sessionStart: Date.now(),
        remember: remember
    };
    delete sessionData.password; // Never keep the password in the session object
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
}

// ------------------ Logout: clear session, refresh nav, redirect home ------------------
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    updateNavigation();
    showAlert('You have been logged out', 'info');
    
    // Redirect to homepage unless we're already there
    if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ------------------ Lightweight alert/toast system ------------------
function showAlert(message, type = 'info') {
    console.log('Alert:', type, message);
    
    // Remove any existing alerts to prevent stacking
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Color coding per type
    switch(type) {
        case 'success':
            alertDiv.style.backgroundColor = '#28a745';
            break;
        case 'error':
            alertDiv.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            alertDiv.style.backgroundColor = '#ffc107';
            alertDiv.style.color = '#000';
            break;
        default:
            alertDiv.style.backgroundColor = '#17a2b8';
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    // Fade out and remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateX(100%)';
            alertDiv.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }
    }, 3000);
}

// ------------------ Expose selected functions to global scope ------------------
window.loginDemo = loginDemo;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.showAlert = showAlert;

console.log('Auth system loaded successfully');
