// Adoption Form JavaScript
// js/adoption.js

// Tracks which step (1–4) of the multi-step form the user is on
let currentStep = 1;
// Total number of steps in the form
const totalSteps = 4;
// Will hold the full pet object chosen by the user
let selectedPet = null;

// Initialize adoption form when the page is ready
document.addEventListener('DOMContentLoaded', function () {
    // Only run this script on pages that actually have the adoption form
    if (!document.getElementById('adoption-form')) return;

    initializeAdoptionForm();
});

function initializeAdoptionForm() {
    // Require authentication before proceeding
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAlert('Please log in to submit an adoption application.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Auto-fill form fields with the user's profile data
    prefillUserInfo(currentUser);

    // Populate the pet dropdown with available pets
    loadAvailablePets();

    // If the page was opened with a specific petId in the URL, preselect that pet
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('petId');
    if (petId) {
        preselectPet(parseInt(petId));
    }

    // Wire up change/submit handlers, etc.
    setupFormEventListeners();

    // Show the correct step and update stepper UI
    updateStepDisplay();

    // Listen for language changes and regenerate review
    document.addEventListener('languageChanged', async function () {
        // Save current selection to restore after reload
        const petSelect = document.getElementById('petSelect');
        const currentVal = petSelect ? petSelect.value : '';

        // Refresh dropdown options with new language
        await loadAvailablePets();

        // Restore value
        if (petSelect) {
            petSelect.value = currentVal;
        }

        // If a pet is selected, update its display (to translate labels etc.)
        if (selectedPet) {
            displaySelectedPet(selectedPet);
        }

        if (currentStep === 4 && selectedPet) {
            generateApplicationReview();
        }
    });
}

function prefillUserInfo(user) {
    // Pre-fill fields from the logged-in user's profile, if available
    const firstNameInput = document.getElementById('applicantFirstName');
    const lastNameInput = document.getElementById('applicantLastName');
    const emailInput = document.getElementById('applicantEmail');
    const phoneInput = document.getElementById('applicantPhone');
    const addressInput = document.getElementById('applicantAddress');

    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
}

async function loadAvailablePets() {
    try {
        // Prefer cached pets in localStorage; otherwise fetch from JSON and cache
        let petsData = localStorage.getItem('pets_data');
        let pets = [];

        if (petsData) {
            const data = JSON.parse(petsData);
            pets = data.pets || [];
        } else {
            // Fetch from static JSON file (first run / cache miss)
            const response = await fetch('data/pets.json');
            if (response.ok) {
                const data = await response.json();
                pets = data.pets || [];
                localStorage.setItem('pets_data', JSON.stringify(data));
            }
        }

        // Only show pets that are currently available
        const availablePets = pets.filter(pet => pet.status === 'available');

        // Populate the <select> with available pets
        const petSelect = document.getElementById('petSelect');
        if (petSelect) {
            const defaultText = (window.i18n && window.i18n.t) ? window.i18n.t('adoption.select_pet_default') : 'Choose a pet to adopt';
            petSelect.innerHTML = `<option value="">${defaultText}</option>`;

            availablePets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;

                // Translate age if possible (e.g., "3 years" -> "3 år")
                let ageDisplay = pet.age;
                if (window.i18n && window.i18n.t) {
                    ageDisplay = ageDisplay.replace(/(\d+)\s*years?/i, (match, num) => {
                        return `${num} ${window.i18n.t('pets.years')}`;
                    });
                }

                option.textContent = `${pet.name} - ${pet.breed} (${ageDisplay})`;
                // Store the full pet object on the option for easy retrieval
                option.dataset.petData = JSON.stringify(pet);
                petSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error('Error loading pets:', error);
        showAlert(window.i18n.t('search.error_message'), 'error');
    }
}

function preselectPet(petId) {
    // Programmatically choose a pet in the dropdown and trigger the selection handler
    const petSelect = document.getElementById('petSelect');
    if (petSelect) {
        petSelect.value = petId;
        handlePetSelection();
    }
}

function setupFormEventListeners() {
    // When user changes the selected pet
    const petSelect = document.getElementById('petSelect');
    if (petSelect) {
        petSelect.addEventListener('change', handlePetSelection);
    }

    // Form submit handler
    const adoptionForm = document.getElementById('adoption-form');
    if (adoptionForm) {
        adoptionForm.addEventListener('submit', handleFormSubmission);
    }

    // Optional reaction to housing type changes (placeholder)
    const housingTypeSelect = document.getElementById('housingType');
    if (housingTypeSelect) {
        housingTypeSelect.addEventListener('change', handleHousingTypeChange);
    }

    // Optional reaction to own/rent changes (placeholder)
    const ownRentSelect = document.getElementById('ownRent');
    if (ownRentSelect) {
        ownRentSelect.addEventListener('change', handleOwnRentChange);
    }
}

function handlePetSelection() {
    // Read the selected option and parse the embedded pet data
    const petSelect = document.getElementById('petSelect');
    const selectedOption = petSelect.options[petSelect.selectedIndex];

    if (selectedOption.value && selectedOption.dataset.petData) {
        selectedPet = JSON.parse(selectedOption.dataset.petData);
        displaySelectedPet(selectedPet);
    } else {
        selectedPet = null;
        hideSelectedPet();
    }
}

function displaySelectedPet(pet) {
    // Swap the dropdown for a compact summary card of the chosen pet
    const selectedPetDisplay = document.getElementById('selected-pet-display');
    const petSelectionGroup = document.getElementById('pet-selection-group');
    const petImage = document.getElementById('selected-pet-image');
    const petName = document.getElementById('selected-pet-name');
    const petDetails = document.getElementById('selected-pet-details');

    if (selectedPetDisplay && petSelectionGroup) {
        petImage.src = pet.images[0] || 'images/pets/placeholder.jpg';
        petImage.alt = `${pet.name} - ${pet.breed}`;
        petName.textContent = pet.name;
        // Use i18n for breed, age, size labels
        // Use safely accessible i18n helper
        const t = (key) => (window.i18n && window.i18n.t) ? window.i18n.t(key) : null;

        const breedLabel = t('pet_detail.breed') || 'Breed';
        const ageLabel = t('pet_detail.age') || 'Age';
        const sizeLabel = t('pet_detail.size') || 'Size';

        // Translate age if possible
        let ageDisplay = pet.age;
        if (t('pets.years')) {
            ageDisplay = ageDisplay.replace(/(\d+)\s*years?/i, (match, num) => {
                return `${num} ${t('pets.years')}`;
            });
        }

        petDetails.textContent = `${breedLabel}: ${pet.breed} • ${ageLabel}: ${ageDisplay} • ${sizeLabel}: ${pet.size}`;

        selectedPetDisplay.style.display = 'block';
        petSelectionGroup.style.display = 'none';
    }
}

function hideSelectedPet() {
    // Revert to showing the dropdown if the user clears the selection
    const selectedPetDisplay = document.getElementById('selected-pet-display');
    const petSelectionGroup = document.getElementById('pet-selection-group');

    if (selectedPetDisplay && petSelectionGroup) {
        selectedPetDisplay.style.display = 'none';
        petSelectionGroup.style.display = 'block';
    }
}

function changePetSelection() {
    // Button on the summary card to re-open the dropdown selection
    hideSelectedPet();
    document.getElementById('petSelect').value = '';
    selectedPet = null;
}

function handleHousingTypeChange() {
    // Placeholder: plug in any dynamic logic tied to housing type
    const housingType = document.getElementById('housingType').value;
    console.log('Housing type changed to:', housingType);
}

function handleOwnRentChange() {
    // Placeholder: e.g., require landlord permission if renting
    const ownRent = document.getElementById('ownRent').value;
    console.log('Own/Rent changed to:', ownRent);
}

// -------------------- Step navigation --------------------

function nextStep() {
    // Validate current step before moving forward
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();

            // If we just entered the final step, build the review summary
            if (currentStep === totalSteps) {
                generateApplicationReview();
            }
        }
    }
}

function previousStep() {
    // Navigate backwards without validation
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // 1) Update the stepper header (mark completed/current steps)
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // 2) Show only the current step's form section
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
            step.style.display = 'block';
        } else {
            step.classList.remove('active');
            step.style.display = 'none';
        }
    });

    // 3) Toggle navigation buttons appropriately
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    }

    if (nextBtn) {
        nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
    }

    if (submitBtn) {
        submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    }

    // 4) Scroll the card into view so users see the new step
    document.querySelector('.auth-card').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function validateCurrentStep() {
    // Validate only the fields that belong to the current step
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    // Clear previous errors on this step
    currentStepElement.querySelectorAll('.form-error.active').forEach(error => {
        error.classList.remove('active');
    });
    currentStepElement.querySelectorAll('.form-input.error').forEach(input => {
        input.classList.remove('error');
    });

    // Generic validation for required/email/phone fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('forms.validation.required') : 'This field is required';
            showFieldError(field, msg);
            isValid = false;
        } else if (field.type === 'email' && !validateEmail(field.value)) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('forms.validation.email_invalid') : 'Please enter a valid email address';
            showFieldError(field, msg);
            isValid = false;
        } else if (field.type === 'tel' && !validatePhone(field.value)) {
            const msg = (window.i18n && window.i18n.t) ? window.i18n.t('forms.validation.phone_invalid') : 'Please enter a valid phone number';
            showFieldError(field, msg);
            isValid = false;
        }
    });

    // Step-specific rules
    switch (currentStep) {
        case 1:
            // Step 1 must have a selected pet
            if (!selectedPet) {
                showAlert('Please select a pet to adopt', 'error');
                isValid = false;
            }
            break;
        case 3:
            // Placeholder: extra housing validations could go here
            break;
        case 4:
            // Final step requires agreeing to all required checkboxes
            const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"][required]');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    showFieldError(checkbox.parentNode, 'You must agree to this requirement');
                    isValid = false;
                }
            });
            break;
    }

    return isValid;
}

function generateApplicationReview() {
    // Build a read-only summary of all collected answers for confirmation
    const reviewContainer = document.getElementById('application-review');
    if (!reviewContainer) return;

    const formData = new FormData(document.getElementById('adoption-form'));

    const t = (key) => {
        if (window.i18n && window.i18n.t) {
            return window.i18n.t(key);
        }
        return key;
    };

    const reviewHTML = `
        <div class="review-section">
            <h5>${t('adoption.review.selected_pet')}</h5>
            <div class="review-item">
                <img src="${selectedPet.images[0]}" alt="${selectedPet.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div>
                    <strong>${selectedPet.name}</strong><br>
                    ${selectedPet.breed} • ${selectedPet.age} • ${selectedPet.size}
                </div>
            </div>
        </div>
        
        <div class="review-section">
            <h5>${t('adoption.review.applicant_info')}</h5>
            <p><strong>${t('adoption.review.name')}:</strong> ${formData.get('firstName')} ${formData.get('lastName')}</p>
            <p><strong>${t('adoption.review.email')}:</strong> ${formData.get('email')}</p>
            <p><strong>${t('adoption.review.phone')}:</strong> ${formData.get('phone')}</p>
            <p><strong>${t('adoption.review.age')}:</strong> ${formData.get('age')}</p>
        </div>
        
        <div class="review-section">
            <h5>${t('adoption.review.housing_info')}</h5>
            <p><strong>${t('adoption.review.housing_type')}:</strong> ${formData.get('housingType')}</p>
            <p><strong>${t('adoption.review.own_rent')}:</strong> ${formData.get('ownRent')}</p>
            <p><strong>${t('adoption.review.household_members')}:</strong> ${formData.get('householdMembers')}</p>
        </div>
        
        <div class="review-section">
            <h5>${t('adoption.review.adoption_reason')}</h5>
            <p>${formData.get('adoptionReason')}</p>
        </div>
    `;

    reviewContainer.innerHTML = reviewHTML;
}

async function handleFormSubmission(e) {
    // Intercept default submission to perform validation and local persistence
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showAlert('Please log in to submit your application', 'error');
        return;
    }

    // Show a small loading state on the submit button
    const submitButton = document.getElementById('submit-btn');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
        // Simulate a network request latency
        await new Promise(resolve => setTimeout(resolve, 2000));

        const formData = new FormData(e.target);

        // Construct an application record from form fields + selected pet + user
        const application = {
            id: Date.now(),
            userId: currentUser.id,
            petId: selectedPet.id,
            petName: selectedPet.name,
            petBreed: selectedPet.breed,
            petImage: selectedPet.images[0],
            applicantName: `${formData.get('firstName')} ${formData.get('lastName')}`,
            applicantEmail: formData.get('email'),
            applicantPhone: formData.get('phone'),
            applicantAge: formData.get('age'),
            address: formData.get('address'),
            housingType: formData.get('housingType'),
            ownRent: formData.get('ownRent'),
            householdMembers: parseInt(formData.get('householdMembers')),
            petExperience: formData.get('petExperience'),
            currentPets: formData.get('currentPets'),
            veterinarian: formData.get('veterinarian'),
            adoptionReason: formData.get('adoptionReason'),
            additionalComments: formData.get('additionalComments'),
            homeVisitAgree: formData.get('homeVisitAgree') === 'on',
            accurateInfo: formData.get('accurateInfo') === 'on',
            adoptionTerms: formData.get('adoptionTerms') === 'on',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Persist the application to localStorage (mock backend)
        const applications = JSON.parse(localStorage.getItem('pawhaven_applications') || '[]');
        applications.push(application);
        localStorage.setItem('pawhaven_applications', JSON.stringify(applications));

        // If the pet was available, mark it as pending (to prevent conflicting apps)
        updatePetStatusToPending(selectedPet.id);

        showAlert(window.i18n.t('forms.success.adoption_submitted'), 'success');

        // Send the user to their profile to see application status
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 3000);

    } catch (error) {
        console.error('Error submitting application:', error);
        showAlert(window.i18n.t('forms.error.submit_failed'), 'error');
    } finally {
        // Restore submit button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function updatePetStatusToPending(petId) {
    // Update the cached pet's status to "pending" if it was "available"
    try {
        const petsData = localStorage.getItem('pets_data');
        if (petsData) {
            const data = JSON.parse(petsData);
            const pet = data.pets.find(p => p.id === petId);
            if (pet && pet.status === 'available') {
                pet.status = 'pending';
                localStorage.setItem('pets_data', JSON.stringify(data));
            }
        }
    } catch (error) {
        console.error('Error updating pet status:', error);
    }
}

// -------------------- Validation helpers --------------------

function validateEmail(email) {
    // Simple email pattern check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // E.164-like pattern; strips spaces, dashes, parentheses before testing
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function showFieldError(field, message) {
    // Mark an input as invalid and show an inline error message
    field.classList.add('error');
    field.classList.remove('valid');

    let errorElement = field.parentNode.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.add('active');
}

// -------------------- Expose functions to global scope --------------------
// So inline onclick/onsubmit attributes in HTML can call them
window.nextStep = nextStep;
window.previousStep = previousStep;
window.changePetSelection = changePetSelection;
