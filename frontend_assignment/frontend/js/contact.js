//Contact form handling with enhanced validation

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        // Setup real-time validation for each field
        setupFormValidation();

        // Handle form submission
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate all fields before submission
            if (!validateContactForm()) {
                return;
            }

            // Get form data
            const formData = new FormData(contactForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const subject = formData.get('subject');
            const message = formData.get('message');
            const preferredContact = formData.get('preferredContact');

            // Show success notification
            showAlert('Thank you for your message! We will get back to you soon.', 'success');

            // Reset form and clear validation states
            contactForm.reset();
            clearAllValidation();
        });
    }
});

/**
 * Setup real-time validation for all form fields
 */
function setupFormValidation() {
    // Name field validation
    const nameField = document.getElementById('contactFullName');
    if (nameField) {
        setupNameValidation(nameField);
    }

    // Email field validation
    const emailField = document.getElementById('contactEmail');
    if (emailField) {
        setupEmailValidation(emailField);
    }

    // Phone field validation
    const phoneField = document.getElementById('contactPhone');
    if (phoneField) {
        setupPhoneValidation(phoneField);
    }

    // Subject field validation
    const subjectField = document.getElementById('contactSubject');
    if (subjectField) {
        setupRequiredValidation(subjectField, 'Subject');

        // Additional length validation
        subjectField.addEventListener('blur', function () {
            if (subjectField.value.trim().length > 0 && subjectField.value.trim().length < 3) {
                showFieldError(subjectField, 'Subject must be at least 3 characters');
            }
        });
    }

    // Message field validation
    const messageField = document.getElementById('contactMessage');
    if (messageField) {
        setupRequiredValidation(messageField, 'Message');

        // Additional length validation
        messageField.addEventListener('blur', function () {
            const value = messageField.value.trim();
            if (value.length > 0 && value.length < 10) {
                showFieldError(messageField, 'Message must be at least 10 characters');
            } else if (value.length > 1000) {
                showFieldError(messageField, 'Message must not exceed 1000 characters');
            }
        });
    }
}

/**
 * Validate entire contact form
 * @returns {boolean} True if valid, false otherwise
 */
function validateContactForm() {
    let isValid = true;

    // Validate full name
    const fullName = document.getElementById('contactFullName');
    if (!validateRequired(fullName.value)) {
        showFieldError(fullName, 'Full name is required');
        isValid = false;
    } else if (!validateName(fullName.value)) {
        showFieldError(fullName, 'Name must contain only letters, spaces, hyphens, and apostrophes');
        isValid = false;
    } else {
        showFieldSuccess(fullName);
    }

    // Validate email
    const email = document.getElementById('contactEmail');
    if (!validateRequired(email.value)) {
        showFieldError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        showFieldSuccess(email);
    }

    // Validate phone
    const phone = document.getElementById('contactPhone');
    if (!validateRequired(phone.value)) {
        showFieldError(phone, 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone.value)) {
        showFieldError(phone, 'Please enter a valid phone number');
        isValid = false;
    } else {
        showFieldSuccess(phone);
    }

    // Validate subject
    const subject = document.getElementById('contactSubject');
    if (!validateRequired(subject.value)) {
        showFieldError(subject, 'Subject is required');
        isValid = false;
    } else if (!validateMinLength(subject.value, 3)) {
        showFieldError(subject, 'Subject must be at least 3 characters');
        isValid = false;
    } else {
        showFieldSuccess(subject);
    }

    // Validate message
    const message = document.getElementById('contactMessage');
    if (!validateRequired(message.value)) {
        showFieldError(message, 'Message is required');
        isValid = false;
    } else if (!validateMinLength(message.value, 10)) {
        showFieldError(message, 'Message must be at least 10 characters');
        isValid = false;
    } else if (!validateMaxLength(message.value, 1000)) {
        showFieldError(message, 'Message must not exceed 1000 characters');
        isValid = false;
    } else {
        showFieldSuccess(message);
    }

    return isValid;
}

/**
 * Clear all validation states from the form
 */
function clearAllValidation() {
    const fields = document.querySelectorAll('.form-input, .form-textarea');
    fields.forEach(field => {
        clearFieldValidation(field);
    });
}
