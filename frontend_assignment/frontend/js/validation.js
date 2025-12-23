// Validation Utility Module
// js/validation.js
// Centralized validation functions for all PawHaven forms

// ==================== VALIDATION PATTERNS ====================

const ValidationPatterns = {
    // Email: standard email format (user@domain.ext)
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // Phone: flexible format supporting international numbers
    // Accepts: +1234567890, (123) 456-7890, 123-456-7890, etc.
    phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,

    // Name: alphabetic characters, spaces, hyphens, and apostrophes only
    // Allows: John, Mary-Jane, O'Brien, Jean Pierre
    name: /^[a-zA-Z\s\-']+$/,

    // Alphabetic only (stricter than name)
    alphabetic: /^[a-zA-Z]+$/,

    // Image file extensions
    imageFile: /\.(jpg|jpeg|png|gif|webp)$/i
};

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return ValidationPatterns.email.test(email.trim());
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    // Remove common separators for validation
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    // Must have at least 7 digits after cleaning
    return cleanPhone.length >= 7 && ValidationPatterns.phone.test(phone);
}

/**
 * Validate name field (allows spaces, hyphens, apostrophes)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.trim();
    // Must be at least 2 characters and match pattern
    return trimmedName.length >= 2 && ValidationPatterns.name.test(trimmedName);
}

/**
 * Validate alphabetic-only field (no spaces or special chars)
 * @param {string} text - Text to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateAlphabetic(text) {
    if (!text || typeof text !== 'string') return false;
    return ValidationPatterns.alphabetic.test(text.trim());
}

/**
 * Validate required field (not empty)
 * @param {string} value - Value to validate
 * @returns {boolean} True if not empty, false otherwise
 */
function validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
}

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if meets minimum, false otherwise
 */
function validateMinLength(value, minLength) {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if within maximum, false otherwise
 */
function validateMaxLength(value, maxLength) {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length <= maxLength;
}

/**
 * Validate image file extension
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if valid image extension, false otherwise
 */
function validateImageFile(filename) {
    if (!filename || typeof filename !== 'string') return false;
    return ValidationPatterns.imageFile.test(filename);
}

/**
 * Validate age (must be 18 or older)
 * @param {string} ageRange - Age range value (e.g., "18-25")
 * @returns {boolean} True if 18+, false otherwise
 */
function validateAge(ageRange) {
    if (!ageRange) return false;
    // Extract first number from age range
    const match = ageRange.match(/^(\d+)/);
    if (!match) return false;
    const age = parseInt(match[1]);
    return age >= 18;
}

// ==================== ERROR DISPLAY FUNCTIONS ====================

/**
 * Show error message for a form field
 * @param {HTMLElement} field - Form field element
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
    if (!field) return;

    // Add error class to field
    field.classList.add('error');
    field.classList.remove('valid');
    field.setAttribute('aria-invalid', 'true');

    // Find or create error message element
    let errorElement = field.parentNode.querySelector('.form-error');

    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.setAttribute('role', 'alert');

        // Insert after the field
        field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.add('active');

    // Link error to field for accessibility
    if (!errorElement.id) {
        errorElement.id = `${field.id}-error`;
        field.setAttribute('aria-describedby', errorElement.id);
    }
}

/**
 * Clear error message from a form field
 * @param {HTMLElement} field - Form field element
 */
function clearFieldError(field) {
    if (!field) return;

    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.classList.remove('active');
        errorElement.textContent = '';
    }
}

/**
 * Show success indicator for a form field
 * @param {HTMLElement} field - Form field element
 */
function showFieldSuccess(field) {
    if (!field) return;

    field.classList.add('valid');
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

    // Clear any existing error
    clearFieldError(field);
}

/**
 * Clear all validation states from a field
 * @param {HTMLElement} field - Form field element
 */
function clearFieldValidation(field) {
    if (!field) return;

    field.classList.remove('error', 'valid');
    field.removeAttribute('aria-invalid');
    clearFieldError(field);
}

// ==================== REAL-TIME VALIDATION ====================

/**
 * Attach real-time validation to a form field
 * @param {HTMLElement} field - Form field element
 * @param {Function} validationFn - Validation function to use
 * @param {string} errorMessage - Error message to show on failure
 */
function attachRealtimeValidation(field, validationFn, errorMessage) {
    if (!field || !validationFn) return;

    // Validate on blur (when user leaves the field)
    field.addEventListener('blur', function () {
        const value = field.value;

        if (value.trim() === '' && !field.hasAttribute('required')) {
            // Optional field left empty - clear validation
            clearFieldValidation(field);
            return;
        }

        if (validationFn(value)) {
            showFieldSuccess(field);
        } else {
            showFieldError(field, errorMessage);
        }
    });

    // Clear error on input (as user types)
    field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
            const value = field.value;
            if (validationFn(value)) {
                showFieldSuccess(field);
            }
        }
    });
}

/**
 * Setup validation for email field
 * @param {string|HTMLElement} fieldId - Field ID or element
 */
function setupEmailValidation(fieldId) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    attachRealtimeValidation(field, validateEmail, 'Please enter a valid email address');
}

/**
 * Setup validation for phone field
 * @param {string|HTMLElement} fieldId - Field ID or element
 */
function setupPhoneValidation(fieldId) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    attachRealtimeValidation(field, validatePhone, 'Please enter a valid phone number');
}

/**
 * Setup validation for name field
 * @param {string|HTMLElement} fieldId - Field ID or element
 */
function setupNameValidation(fieldId) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    attachRealtimeValidation(field, validateName, 'Name must contain only letters, spaces, hyphens, and apostrophes');
}

/**
 * Setup validation for required field
 * @param {string|HTMLElement} fieldId - Field ID or element
 * @param {string} fieldName - Human-readable field name for error message
 */
function setupRequiredValidation(fieldId, fieldName = 'This field') {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    attachRealtimeValidation(field, validateRequired, `${fieldName} is required`);
}

// ==================== FORM VALIDATION ====================

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} True if all fields valid, false otherwise
 */
function validateForm(form) {
    if (!form) return false;

    let isValid = true;
    const fields = form.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
        // Skip disabled and hidden fields
        if (field.disabled || field.type === 'hidden') return;

        // Check required fields
        if (field.hasAttribute('required') && !validateRequired(field.value)) {
            showFieldError(field, 'This field is required');
            isValid = false;
            return;
        }

        // Skip validation for empty optional fields
        if (!field.hasAttribute('required') && field.value.trim() === '') {
            return;
        }

        // Type-specific validation
        if (field.type === 'email' && !validateEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        } else if (field.type === 'tel' && !validatePhone(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        } else if (field.classList.contains('validate-name') && !validateName(field.value)) {
            showFieldError(field, 'Please enter a valid name');
            isValid = false;
        }
    });

    return isValid;
}

// ==================== EXPORT FUNCTIONS ====================

// Make functions available globally
window.ValidationPatterns = ValidationPatterns;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateName = validateName;
window.validateAlphabetic = validateAlphabetic;
window.validateRequired = validateRequired;
window.validateMinLength = validateMinLength;
window.validateMaxLength = validateMaxLength;
window.validateImageFile = validateImageFile;
window.validateAge = validateAge;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.showFieldSuccess = showFieldSuccess;
window.clearFieldValidation = clearFieldValidation;
window.attachRealtimeValidation = attachRealtimeValidation;
window.setupEmailValidation = setupEmailValidation;
window.setupPhoneValidation = setupPhoneValidation;
window.setupNameValidation = setupNameValidation;
window.setupRequiredValidation = setupRequiredValidation;
window.validateForm = validateForm;

console.log('Validation module loaded successfully');
