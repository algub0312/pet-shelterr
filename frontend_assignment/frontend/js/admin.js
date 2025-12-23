// Admin Dashboard JavaScript
// js/admin.js

// Initialize admin dashboard once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', function() {
    // Run this script only on the admin page to avoid errors on other pages
    if (!window.location.pathname.includes('admin.html')) return;
    
    console.log('Initializing admin dashboard...');
    
    // Wait for i18n to be ready before initializing admin dashboard
    if (window.i18n && window.i18n.translations && window.i18n.translations[window.i18n.currentLanguage]) {
        // i18n is already loaded
        initializeAdminDashboardContent();
    } else {
        // Wait for i18n to be ready
        const checkI18n = setInterval(() => {
            if (window.i18n && window.i18n.translations && window.i18n.translations[window.i18n.currentLanguage]) {
                clearInterval(checkI18n);
                initializeAdminDashboardContent();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkI18n);
            initializeAdminDashboardContent();
        }, 5000);
    }
    
    // Get the currently logged-in user (function expected from auth.js or similar)
    const currentUser = getCurrentUser();
    // Guard: redirect non-admins away from the page
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Listen for language changes and reload content
    document.addEventListener('languageChanged', function() {
        console.log('Language changed, reloading admin content...');
        loadPetsList();
        loadApplicationsList();
        loadUsersList();
    });
});

function initializeAdminDashboardContent() {
    console.log('Loading admin dashboard...');
    
    // Set up tab switching (shared helper, likely defined in auth.js)
    initializeTabs();
    
    // Populate all admin areas
    loadAdminStats();
    loadPetsList();
    loadApplicationsList();
    loadUsersList();
    
    // Friendly toast after a short delay
    setTimeout(() => {
        const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.welcome_admin') : 'Welcome to Admin Dashboard!';
        showAlert(msg, 'success');
    }, 500);
}

// ------- Statistics (top cards) -------

function loadAdminStats() {
    console.log('Loading admin statistics...');
    
    try {
        // Pull applications and users from localStorage
        const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
        const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
        
        // Try to load pets from localStorage; fall back to defaults if not present
        let pets = [];
        try {
            const petsData = localStorage.getItem('pets_data');
            if (petsData) {
                const data = JSON.parse(petsData);
                pets = data.pets || [];
            }
        } catch (error) {
            console.log('Using default pet data');
            // Fallback sample statuses to keep the dashboard functional
            pets = [
                {id: 1, status: 'available'},
                {id: 2, status: 'available'},
                {id: 3, status: 'available'},
                {id: 4, status: 'pending'},
                {id: 5, status: 'adopted'},
                {id: 6, status: 'available'},
                {id: 7, status: 'available'},
                {id: 8, status: 'medical_hold'}
            ];
        }
        
        // Compute metrics for the stat cards
        const stats = {
            totalPets: pets.length,
            availablePets: pets.filter(pet => pet.status === 'available').length,
            pendingApplications: applications.filter(app => app.status === 'pending').length,
            // Subtract demo accounts (assumes 2 demo entries with ids <= 2)
            totalUsers: Math.max(0, Object.keys(users).length - 2)
        };
        
        console.log('Admin stats calculated:', stats);
        
        // Animate counters to their target values
        updateStatCounter('total-pets', stats.totalPets);
        updateStatCounter('available-pets', stats.availablePets);
        updateStatCounter('pending-applications', stats.pendingApplications);
        updateStatCounter('total-users', stats.totalUsers);
        
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Animate a numeric element from its current value to targetValue
function updateStatCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 1000; // animation total duration in ms
    const stepTime = duration / Math.abs(targetValue - currentValue);
    
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        // Stop when we reach or pass the target depending on direction
        if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
            element.textContent = targetValue;
            clearInterval(timer);
        }
    }, stepTime);
}

// ------- Pets management list -------

function loadPetsList() {
    console.log('Loading pets list...');
    
    const container = document.getElementById('admin-pets-list');
    if (!container) return;
    
    try {
        // Attempt to pull persisted pets; otherwise, use sample data
        let pets = [];
        const petsData = localStorage.getItem('pets_data');
        
        if (petsData) {
            const data = JSON.parse(petsData);
            pets = data.pets || [];
        } else {
            pets = getSamplePetsData();
        }
        
        // Empty state
        if (pets.length === 0) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.no_pets_found') : 'No pets found in the system.';
            container.innerHTML = `<p class="no-data">${msg}</p>`;
            return;
        }
        
        // Render each pet as a compact admin list item with actions
        const petsHTML = pets.map(pet => {
            const breed = pet.breed || ((window.i18n && window.i18n.t) ? window.i18n.t('admin.mixed_breed') : 'Mixed Breed');
            const age = pet.age || ((window.i18n && window.i18n.t) ? window.i18n.t('admin.unknown_age') : 'Unknown age');
            const editTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.edit') : 'Edit';
            const statusTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.status') : 'Status';
            return `
            <div class="admin-pet-item" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <img src="${pet.images ? pet.images[0] : 'images/pets/placeholder.jpg'}" alt="${pet.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 1rem;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${pet.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${breed} • ${age}</p>
                    <span class="status-badge status-${pet.status}" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-top: 0.5rem;">
                        ${(pet.status || 'available').toUpperCase()}
                    </span>
                </div>
                <div class="admin-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-outline" onclick="editPet(${pet.id})">${editTxt}</button>
                    <button class="btn btn-small btn-secondary" onclick="changePetStatus(${pet.id})">${statusTxt}</button>
                </div>
            </div>
        `;
        }).join('');
        
        container.innerHTML = petsHTML;
        console.log('Pets list loaded successfully');
        
    } catch (error) {
        console.error('Error loading pets list:', error);
        const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.error_loading_pets') : 'Error loading pets data.';
        container.innerHTML = `<p class="error-message">${msg}</p>`;
    }
}

// ------- Applications management list -------

function loadApplicationsList() {
    console.log('Loading applications list...');
    
    const container = document.getElementById('admin-applications-list');
    if (!container) return;
    
    try {
        // Retrieve all submitted applications
        const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
        
        // Empty state
        if (applications.length === 0) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.no_applications_yet') : 'No adoption applications submitted yet.';
            container.innerHTML = `<p class="no-data">${msg}</p>`;
            return;
        }
        
        // Render each application with status and action controls
        const applicationsHTML = applications.map(app => {
            const appliedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.applied') : 'Applied:';
            const pendingTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.pending') : 'Pending';
            const approvedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.approved') : 'Approved';
            const rejectedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.rejected') : 'Rejected';
            const detailsTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.view_details') : 'View Details';
            return `
            <div class="admin-application-item" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem; overflow: hidden;">
                <div style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #f1f1f1;">
                    <img src="${app.petImage || 'images/pets/placeholder.jpg'}" alt="${app.petName}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 1rem;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.25rem 0;">${app.petName} - ${app.applicantName}</h4>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">${app.applicantEmail}</p>
                    </div>
                    <span class="status-badge status-${app.status}" style="padding: 4px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                        ${app.status.toUpperCase()}
                    </span>
                </div>
                <div style="padding: 1rem;">
                    <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">${appliedTxt} ${formatDate(app.submittedAt)}</p>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <select onchange="updateApplicationStatus(${app.id}, this.value)" style="padding: 0.25rem 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>${pendingTxt}</option>
                            <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>${approvedTxt}</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>${rejectedTxt}</option>
                        </select>
                        <button class="btn btn-small" onclick="viewApplicationDetails(${app.id})">${detailsTxt}</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        container.innerHTML = applicationsHTML;
        console.log('Applications list loaded successfully');
        
    } catch (error) {
        console.error('Error loading applications list:', error);
        const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.error_loading_applications') : 'Error loading applications data.';
        container.innerHTML = `<p class="error-message">${msg}</p>`;
    }
}

// ------- Users management list -------

function loadUsersList() {
    console.log('Loading users list...');
    
    const container = document.getElementById('admin-users-list');
    if (!container) return;
    
    try {
        // Get user dictionary keyed by id
        const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
        // Filter out demo accounts (ids <= 2)
        const usersList = Object.values(users).filter(user => user.id > 2);
        
        // Empty state
        if (usersList.length === 0) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.no_users_found') : 'No registered users found.';
            container.innerHTML = `<p class="no-data">${msg}</p>`;
            return;
        }
        
        // Render each user with role badge and admin action
        const usersHTML = usersList.map(user => {
            const joinedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.joined') : 'Joined:';
            const viewTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.view') : 'View';
            const makeAdminTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.make_admin') : 'Make Admin';
            return `
            <div class="admin-user-item" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div class="user-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: #2E8B57; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 1rem;">
                    ${user.firstName[0]}${user.lastName[0]}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${user.firstName} ${user.lastName}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${user.email}</p>
                    <p style="margin: 0.25rem 0 0 0; color: #999; font-size: 0.8rem;">${joinedTxt} ${formatDate(user.joinDate)}</p>
                </div>
                <div class="user-role" style="margin-right: 1rem;">
                    <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${user.role.toUpperCase()}
                    </span>
                </div>
                <div class="admin-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-outline" onclick="viewUserDetails(${user.id})">${viewTxt}</button>
                    ${user.role !== 'admin' ? `<button class="btn btn-small" onclick="makeAdmin(${user.id})">${makeAdminTxt}</button>` : ''}
                </div>
            </div>
        `;
        }).join('');
        
        container.innerHTML = usersHTML;
        console.log('Users list loaded successfully');
        
    } catch (error) {
        console.error('Error loading users list:', error);
        const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.error_loading_users') : 'Error loading users data.';
        container.innerHTML = `<p class="error-message">${msg}</p>`;
    }
}

// ------- Admin action handlers (buttons/controls) -------

function addNewPet() {
    // Placeholder for future create-pet flow
    const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.add_new_pet_dev') : 'Add New Pet feature is under development!';
    showAlert(msg, 'info');
}

function editPet(petId) {
    // Placeholder for future edit-pet modal/form
    const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.edit_pet_dev', {id: petId}) : `Edit Pet ${petId} feature is under development!`;
    showAlert(msg, 'info');
}

function changePetStatus(petId) {
    // Simple prompt-based status change (demo only)
    const promptMsg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.enter_pet_status') : 'Enter new status (available, pending, adopted, medical_hold):';
    const newStatus = prompt(promptMsg);
    if (newStatus && ['available', 'pending', 'adopted', 'medical_hold'].includes(newStatus)) {
        const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.pet_status_changed', {id: petId, status: newStatus}) : `Pet ${petId} status changed to ${newStatus}!`;
        showAlert(msg, 'success');
        // Refresh lists and stats so UI reflects the change
        setTimeout(() => {
            loadPetsList();
            loadAdminStats();
        }, 1000);
    }
}

function updateApplicationStatus(appId, newStatus) {
    try {
        // Locate the application by id and mutate its status
        const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
        const appIndex = applications.findIndex(app => app.id === appId);
        
        if (appIndex !== -1) {
            applications[appIndex].status = newStatus;
            applications[appIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('pawhaven_applications', JSON.stringify(applications));
            
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.status_updated', {status: newStatus}) : `Application status updated to ${newStatus}!`;
            showAlert(msg, 'success');
            
            // Refresh dependent UI and stats
            setTimeout(() => {
                loadApplicationsList();
                loadAdminStats();
            }, 1000);
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        const errMsg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.error_updating_status') : 'Error updating application status';
        showAlert(errMsg, 'error');
    }
}

function viewApplicationDetails(appId) {
    // Basic detail viewer via alert (can be replaced with a modal)
    const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
    const app = applications.find(app => app.id === appId);
    
    if (app) {
        const petColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.pet_colon') : 'Pet:';
        const applicantColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.applicant_colon') : 'Applicant:';
        const emailColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.email_colon') : 'Email:';
        const statusColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.status_colon') : 'Status:';
        const appliedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.applied') : 'Applied:';
        const housingColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.housing_colon') : 'Housing:';
        const experienceColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.experience_colon') : 'Experience:';
        const notSpecified = (window.i18n && window.i18n.t) ? window.i18n.t('admin.not_specified') : 'Not specified';
        
        const details = `
${petColon} ${app.petName}
${applicantColon} ${app.applicantName}
${emailColon} ${app.applicantEmail}
${statusColon} ${app.status}
${appliedTxt} ${formatDate(app.submittedAt)}
${housingColon} ${app.housingType || notSpecified}
${experienceColon} ${app.petExperience || notSpecified}
        `;
        alert(details);
    }
}

function viewUserDetails(userId) {
    // Displays basic user info via alert (can be replaced with a modal)
    const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
    const user = users[userId];
    
    if (user) {
        const nameColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.pet_colon') : 'Name:';
        const emailColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.email_colon') : 'Email:';
        const phoneColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.phone_colon') : 'Phone:';
        const roleColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.role_colon') : 'Role:';
        const joinedTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.joined') : 'Joined:';
        const addressColon = (window.i18n && window.i18n.t) ? window.i18n.t('admin.address_colon') : 'Address:';
        const notProvided = (window.i18n && window.i18n.t) ? window.i18n.t('admin.not_provided') : 'Not provided';
        
        const details = `
${nameColon} ${user.firstName} ${user.lastName}
${emailColon} ${user.email}
${phoneColon} ${user.phone || notProvided}
${roleColon} ${user.role}
${joinedTxt} ${formatDate(user.joinDate)}
${addressColon} ${user.address || notProvided}
        `;
        alert(details);
    }
}

function makeAdmin(userId) {
    // Promote a user to admin role after confirmation
    const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
    const user = users[userId];
    
    if (user) {
        const confirmMsg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.confirm_make_admin', {name: `${user.firstName} ${user.lastName}`}) : `Make ${user.firstName} ${user.lastName} an admin?`;
        if (confirm(confirmMsg)) {
            user.role = 'admin';
            localStorage.setItem('pawhaven_users', JSON.stringify(users));
            
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.now_admin', {name: `${user.firstName}`}) : `${user.firstName} is now an admin!`;
            showAlert(msg, 'success');
            
            // Refresh users list to reflect role change
            setTimeout(() => {
                loadUsersList();
            }, 1000);
        }
    }
}

function reviewApplications() {
    // Shortcut to switch to the Applications tab in the admin UI
    const applicationsTab = document.querySelector('[data-tab="applications-management"]');
    if (applicationsTab) {
        applicationsTab.click();
    }
}

function generateReport(reportType = 'general') {
    // Simple text report generator; triggers a file download (.txt)
    const generatingMsg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.generating_report', {type: reportType}) : `Generating ${reportType} report...`;
    showAlert(generatingMsg, 'info');
    
    setTimeout(() => {
        const reportTxt = (window.i18n && window.i18n.t) ? window.i18n.t('admin.generate_report') : 'Report';
        const statsSummary = (window.i18n && window.i18n.t) ? window.i18n.t('admin.statistics_summary') : 'STATISTICS SUMMARY:';
        const totalPets = (window.i18n && window.i18n.t) ? window.i18n.t('admin.total_pets') : '- Total Pets:';
        const availablePets = (window.i18n && window.i18n.t) ? window.i18n.t('admin.available_pets') : '- Available Pets:';
        const pendingApps = (window.i18n && window.i18n.t) ? window.i18n.t('admin.pending_applications') : '- Pending Applications:';
        const registeredUsers = (window.i18n && window.i18n.t) ? window.i18n.t('admin.registered_users') : '- Registered Users:';
        const reportGen = (window.i18n && window.i18n.t) ? window.i18n.t('admin.report_generated') : 'Report generated on:';
        
        const reportContent = `
PawHaven Shelter ${reportTxt} - ${new Date().toLocaleDateString()}

${statsSummary}
${totalPets} ${document.getElementById('total-pets').textContent}
${availablePets} ${document.getElementById('available-pets').textContent}
${pendingApps} ${document.getElementById('pending-applications').textContent}
${registeredUsers} ${document.getElementById('total-users').textContent}

${reportGen} ${new Date().toLocaleString()}
        `;
        
        // Create a blob, generate an object URL, and auto-click an <a> to download
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pawhaven-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const downloadMsg = (window.i18n && window.i18n.t) ? window.i18n.t('admin.report_downloaded') : 'Report downloaded successfully!';
        showAlert(downloadMsg, 'success');
    }, 2000);
}

// ------- Utilities & helpers -------

// Static sample pets for local/dev environments without stored data
function getSamplePetsData() {
    return [
        { id: 1, name: 'Bella', breed: 'Golden Retriever', age: '3 years', status: 'available', images: ['images/pets/bella.jpg'] },
        { id: 2, name: 'Whiskers', breed: 'Tabby Cat', age: '5 years', status: 'available', images: ['images/pets/whiskers.jpg'] },
        { id: 3, name: 'Rocky', breed: 'Mixed Breed', age: '2 years', status: 'available', images: ['images/pets/rocky.jpg'] },
        { id: 4, name: 'Luna', breed: 'Siamese', age: '1 year', status: 'pending', images: ['images/pets/luna.jpg'] },
        { id: 5, name: 'Max', breed: 'Labrador', age: '4 years', status: 'adopted', images: ['images/pets/max.jpg'] }
    ];
}

// Format a date string as "Mon DD, YYYY" (US locale); returns 'N/A' if missing
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Expose functions on window so inline onclick handlers in HTML can call them
window.addNewPet = addNewPet;
window.editPet = editPet;
window.changePetStatus = changePetStatus;
window.updateApplicationStatus = updateApplicationStatus;
window.viewApplicationDetails = viewApplicationDetails;
window.viewUserDetails = viewUserDetails;
window.makeAdmin = makeAdmin;
window.reviewApplications = reviewApplications;
window.generateReport = generateReport;

console.log('Admin dashboard JavaScript loaded successfully');
