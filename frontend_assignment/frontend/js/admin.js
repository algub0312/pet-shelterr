// Admin Dashboard JavaScript
// js/admin.js

// Initialize admin dashboard once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', function () {
    // Run this script only on the admin page to avoid errors on other pages
    if (!window.location.pathname.includes('admin.html')) return;

    console.log('Initializing admin dashboard...');

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

    // If the user is admin, set up dashboard UI and data
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
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
        showAlert('Welcome to Admin Dashboard!', 'success');
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
                { id: 1, status: 'available' },
                { id: 2, status: 'available' },
                { id: 3, status: 'available' },
                { id: 4, status: 'pending' },
                { id: 5, status: 'adopted' },
                { id: 6, status: 'available' },
                { id: 7, status: 'available' },
                { id: 8, status: 'medical_hold' }
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
            container.innerHTML = '<p class="no-data">No pets found in the system.</p>';
            return;
        }

        // Render each pet as a compact admin list item with actions
        const petsHTML = pets.map(pet => `
            <div class="admin-pet-item" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <img src="${pet.images ? pet.images[0] : 'images/pets/placeholder.jpg'}" alt="${pet.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 1rem;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${pet.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${pet.breed || 'Mixed Breed'} • ${pet.age || 'Unknown age'}</p>
                    <span class="status-badge status-${pet.status}" style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-top: 0.5rem;">
                        ${(pet.status || 'available').toUpperCase()}
                    </span>
                </div>
                <div class="admin-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-outline" onclick="editPet(${pet.id})">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="changePetStatus(${pet.id})">Status</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = petsHTML;
        console.log('Pets list loaded successfully');

    } catch (error) {
        console.error('Error loading pets list:', error);
        container.innerHTML = '<p class="error-message">Error loading pets data.</p>';
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
            container.innerHTML = '<p class="no-data">No adoption applications submitted yet.</p>';
            return;
        }

        // Render each application with status and action controls
        const applicationsHTML = applications.map(app => `
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
                    <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Applied: ${formatDate(app.submittedAt)}</p>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <select onchange="updateApplicationStatus(${app.id}, this.value)" style="padding: 0.25rem 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="approved" ${app.status === 'approved' ? 'selected' : ''}>Approved</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="btn btn-small" onclick="viewApplicationDetails(${app.id})">View Details</button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = applicationsHTML;
        console.log('Applications list loaded successfully');

    } catch (error) {
        console.error('Error loading applications list:', error);
        container.innerHTML = '<p class="error-message">Error loading applications data.</p>';
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
            container.innerHTML = '<p class="no-data">No registered users found.</p>';
            return;
        }

        // Render each user with role badge and admin action
        const usersHTML = usersList.map(user => `
            <div class="admin-user-item" style="display: flex; align-items: center; padding: 1rem; margin-bottom: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div class="user-avatar" style="width: 50px; height: 50px; border-radius: 50%; background: #2E8B57; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 1rem;">
                    ${user.firstName[0]}${user.lastName[0]}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${user.firstName} ${user.lastName}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${user.email}</p>
                    <p style="margin: 0.25rem 0 0 0; color: #999; font-size: 0.8rem;">Joined: ${formatDate(user.joinDate)}</p>
                </div>
                <div class="user-role" style="margin-right: 1rem;">
                    <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${user.role.toUpperCase()}
                    </span>
                </div>
                <div class="admin-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-small btn-outline" onclick="viewUserDetails(${user.id})">View</button>
                    ${user.role !== 'admin' ? `<button class="btn btn-small" onclick="makeAdmin(${user.id})">Make Admin</button>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = usersHTML;
        console.log('Users list loaded successfully');

    } catch (error) {
        console.error('Error loading users list:', error);
        container.innerHTML = '<p class="error-message">Error loading users data.</p>';
    }
}

// ------- Admin action handlers (buttons/controls) -------

function addNewPet() {
    // Create modal overlay
    const modalHTML = `
        <div id="add-pet-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-content" style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: var(--primary-color);">Add New Pet</h2>
                    <button onclick="closeAddPetModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light);">&times;</button>
                </div>
                
                <form id="add-pet-form" class="auth-form">
                    <!-- Pet Name -->
                    <div class="form-group">
                        <label for="petName" class="form-label required">Pet Name</label>
                        <input type="text" id="petName" name="name" class="form-input validate-name" 
                               pattern="[a-zA-Z\\s\\-']+" 
                               minlength="2" 
                               maxlength="50" 
                               required>
                    </div>
                    
                    <!-- Breed -->
                    <div class="form-group">
                        <label for="petBreed" class="form-label required">Breed</label>
                        <input type="text" id="petBreed" name="breed" class="form-input" 
                               minlength="2" 
                               maxlength="100" 
                               required>
                    </div>
                    
                    <!-- Age -->
                    <div class="form-group">
                        <label for="petAge" class="form-label required">Age</label>
                        <input type="text" id="petAge" name="age" class="form-input" 
                               placeholder="e.g., 2 years, 6 months" 
                               required>
                    </div>
                    
                    <!-- Size -->
                    <div class="form-group">
                        <label for="petSize" class="form-label required">Size</label>
                        <select id="petSize" name="size" class="form-select" required>
                            <option value="">Select size</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>
                    </div>
                    
                    <!-- Description -->
                    <div class="form-group">
                        <label for="petDescription" class="form-label required">Description</label>
                        <textarea id="petDescription" name="description" class="form-textarea" 
                                  rows="4" 
                                  minlength="20" 
                                  maxlength="500" 
                                  required 
                                  placeholder="Describe the pet's personality, behavior, and any special needs..."
                                  aria-describedby="petDescription-help"></textarea>
                        <small id="petDescription-help" class="form-help">Minimum 20 characters</small>
                    </div>
                    
                    <!-- Image Upload -->
                    <div class="form-group">
                        <label for="petImage" class="form-label required">Pet Image</label>
                        <input type="file" id="petImage" name="image" class="form-input" 
                               accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                               required
                               aria-describedby="petImage-help">
                        <small id="petImage-help" class="form-help">Accepted formats: JPG, PNG, GIF, WebP</small>
                    </div>
                    
                    <!-- Status -->
                    <div class="form-group">
                        <label for="petStatus" class="form-label required">Status</label>
                        <select id="petStatus" name="status" class="form-select" required>
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="adopted">Adopted</option>
                            <option value="medical_hold">Medical Hold</option>
                        </select>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="form-navigation" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                        <button type="button" onclick="closeAddPetModal()" class="btn btn-outline">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Pet</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup validation for the form
    setupAddPetFormValidation();

    // Handle form submission
    const form = document.getElementById('add-pet-form');
    form.addEventListener('submit', handleAddPetSubmit);

    // Close modal on overlay click
    document.getElementById('add-pet-modal').addEventListener('click', function (e) {
        if (e.target.id === 'add-pet-modal') {
            closeAddPetModal();
        }
    });
}

/**
 * Setup validation for add pet form
 */
function setupAddPetFormValidation() {
    // Name validation
    const nameField = document.getElementById('petName');
    if (nameField) setupNameValidation(nameField);

    // Breed validation
    const breedField = document.getElementById('petBreed');
    if (breedField) {
        setupRequiredValidation(breedField, 'Breed');
        breedField.addEventListener('blur', function () {
            if (breedField.value.trim().length > 0 && breedField.value.trim().length < 2) {
                showFieldError(breedField, 'Breed must be at least 2 characters');
            }
        });
    }

    // Description validation
    const descField = document.getElementById('petDescription');
    if (descField) {
        setupRequiredValidation(descField, 'Description');
        descField.addEventListener('blur', function () {
            const value = descField.value.trim();
            if (value.length > 0 && value.length < 20) {
                showFieldError(descField, 'Description must be at least 20 characters');
            } else if (value.length > 500) {
                showFieldError(descField, 'Description must not exceed 500 characters');
            }
        });
    }

    // Image file validation
    const imageField = document.getElementById('petImage');
    if (imageField) {
        imageField.addEventListener('change', function () {
            if (imageField.files.length > 0) {
                const file = imageField.files[0];
                const filename = file.name;

                if (!validateImageFile(filename)) {
                    showFieldError(imageField, 'Only image files (JPG, PNG, GIF, WebP) are allowed');
                } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showFieldError(imageField, 'Image file must be less than 5MB');
                } else {
                    showFieldSuccess(imageField);
                }
            }
        });
    }
}

/**
 * Handle add pet form submission
 */
function handleAddPetSubmit(e) {
    e.preventDefault();

    // Validate all fields
    let isValid = true;

    const name = document.getElementById('petName');
    if (!validateRequired(name.value) || !validateName(name.value)) {
        showFieldError(name, 'Please enter a valid pet name');
        isValid = false;
    }

    const breed = document.getElementById('petBreed');
    if (!validateRequired(breed.value) || !validateMinLength(breed.value, 2)) {
        showFieldError(breed, 'Breed is required and must be at least 2 characters');
        isValid = false;
    }

    const description = document.getElementById('petDescription');
    if (!validateRequired(description.value) || !validateMinLength(description.value, 20)) {
        showFieldError(description, 'Description is required and must be at least 20 characters');
        isValid = false;
    }

    const image = document.getElementById('petImage');
    if (image.files.length === 0) {
        showFieldError(image, 'Please select an image file');
        isValid = false;
    } else if (!validateImageFile(image.files[0].name)) {
        showFieldError(image, 'Only image files (JPG, PNG, GIF, WebP) are allowed');
        isValid = false;
    }

    if (!isValid) {
        showAlert('Please fix the errors in the form', 'error');
        return;
    }

    // Show success message
    showAlert('Pet added successfully!', 'success');

    // Close modal and refresh pet list
    closeAddPetModal();
    setTimeout(() => {
        loadPetsList();
        loadAdminStats();
    }, 1000);
}

/**
 * Close add pet modal
 */
function closeAddPetModal() {
    const modal = document.getElementById('add-pet-modal');
    if (modal) {
        modal.remove();
    }
}

function editPet(petId) {
    // Placeholder for future edit-pet modal/form
    showAlert(`Edit Pet ${petId} feature is under development!`, 'info');
}

function changePetStatus(petId) {
    // Simple prompt-based status change (demo only)
    const newStatus = prompt('Enter new status (available, pending, adopted, medical_hold):');
    if (newStatus && ['available', 'pending', 'adopted', 'medical_hold'].includes(newStatus)) {
        showAlert(`Pet ${petId} status changed to ${newStatus}!`, 'success');
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

            showAlert(`Application status updated to ${newStatus}!`, 'success');

            // Refresh dependent UI and stats
            setTimeout(() => {
                loadApplicationsList();
                loadAdminStats();
            }, 1000);
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        showAlert('Error updating application status', 'error');
    }
}

function viewApplicationDetails(appId) {
    // Basic detail viewer via alert (can be replaced with a modal)
    const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
    const app = applications.find(app => app.id === appId);

    if (app) {
        const details = `
Application Details:

Pet: ${app.petName}
Applicant: ${app.applicantName}
Email: ${app.applicantEmail}
Status: ${app.status}
Applied: ${formatDate(app.submittedAt)}
Housing: ${app.housingType || 'Not specified'}
Experience: ${app.petExperience || 'Not specified'}
        `;
        alert(details);
    }
}

function viewUserDetails(userId) {
    // Displays basic user info via alert (can be replaced with a modal)
    const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
    const user = users[userId];

    if (user) {
        const details = `
User Details:

Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Role: ${user.role}
Joined: ${formatDate(user.joinDate)}
Address: ${user.address || 'Not provided'}
        `;
        alert(details);
    }
}

function makeAdmin(userId) {
    // Promote a user to admin role after confirmation
    const users = JSON.parse(localStorage.getItem('pawhaven_users') || '{}');
    const user = users[userId];

    if (user && confirm(`Make ${user.firstName} ${user.lastName} an admin?`)) {
        user.role = 'admin';
        localStorage.setItem('pawhaven_users', JSON.stringify(users));

        showAlert(`${user.firstName} is now an admin!`, 'success');

        // Refresh users list to reflect role change
        setTimeout(() => {
            loadUsersList();
        }, 1000);
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
    showAlert(`Generating ${reportType} report...`, 'info');

    setTimeout(() => {
        const reportContent = `
PawHaven Shelter Report - ${new Date().toLocaleDateString()}

STATISTICS SUMMARY:
- Total Pets: ${document.getElementById('total-pets').textContent}
- Available Pets: ${document.getElementById('available-pets').textContent}
- Pending Applications: ${document.getElementById('pending-applications').textContent}
- Registered Users: ${document.getElementById('total-users').textContent}

Report generated on: ${new Date().toLocaleString()}
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

        showAlert('Report downloaded successfully!', 'success');
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
window.closeAddPetModal = closeAddPetModal;

console.log('Admin dashboard JavaScript loaded successfully');
