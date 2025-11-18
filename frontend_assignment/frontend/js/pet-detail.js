// Pet Detail Page JavaScript
// js/pet-detail.js

// Global variables to store current pet data and state
let currentPet = null;
let currentImageIndex = 0;
let allPets = [];

// Initialize the pet detail page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on pet detail page to avoid errors on other pages
    if (!window.location.pathname.includes('pet-detail.html')) return;
    
    console.log('Initializing pet detail page...');
    initializePetDetailPage();
});

/**
 * Main initialization function that coordinates all setup tasks
 */
async function initializePetDetailPage() {
    try {
        // Extract pet ID from URL parameters (e.g., pet-detail.html?id=1)
        const petId = getPetIdFromUrl();
        
        if (!petId) {
            console.error('No pet ID found in URL');
            showErrorState('Invalid pet ID');
            return;
        }
        
        console.log('Loading pet with ID:', petId);
        
        // Load pet data and display it
        await loadPetData(petId);
        
        // Set up interactive features
        setupImageGallery();
        setupShareFunctionality();
        
        // Load similar pets for recommendations
        await loadSimilarPets();
        
    } catch (error) {
        console.error('Error initializing pet detail page:', error);
        showErrorState('Failed to load pet information');
    }
}

/**
 * Extract the pet ID from the URL query parameters
 * Example: pet-detail.html?id=5 returns "5"
 */
function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');
    return petId ? parseInt(petId) : null;
}

/**
 * Load pet data from JSON file or localStorage cache
 */
async function loadPetData(petId) {
    try {
        // Try to get cached pets data first
        let petsData = localStorage.getItem('pets_data');
        
        if (petsData) {
            const data = JSON.parse(petsData);
            allPets = data.pets || [];
        } else {
            // Fetch from JSON file if not cached
            const response = await fetch('data/pets.json');
            if (response.ok) {
                const data = await response.json();
                allPets = data.pets || [];
                // Cache the data for future use
                localStorage.setItem('pets_data', JSON.stringify(data));
            } else {
                throw new Error('Failed to fetch pets data');
            }
        }
        
        // Find the specific pet by ID
        currentPet = allPets.find(pet => pet.id === petId);
        
        if (!currentPet) {
            throw new Error(`Pet with ID ${petId} not found`);
        }
        
        console.log('Pet loaded:', currentPet);
        
        // Display the pet information
        displayPetInformation();
        
        // Hide loading state and show content
        hideLoadingState();
        
    } catch (error) {
        console.error('Error loading pet data:', error);
        showErrorState('Pet not found or failed to load');
    }
}

/**
 * Display all pet information in the DOM
 */
function displayPetInformation() {
    if (!currentPet) return;
    
    // Update page title and breadcrumb
    document.title = `${currentPet.name} - PawHaven Pet Shelter`;
    document.getElementById('breadcrumb-pet-name').textContent = currentPet.name;
    
    // Display basic information
    displayBasicInfo();
    
    // Display images
    displayImages();
    
    // Display personality traits
    displayPersonalityTraits();
    
    // Display medical information
    displayMedicalInfo();
    
    // Display adoption information
    displayAdoptionInfo();
    
    // Update action buttons based on pet status
    updateActionButtons();
}

/**
 * Display basic pet information (name, breed, age, etc.)
 */
function displayBasicInfo() {
    document.getElementById('pet-name').textContent = currentPet.name;
    document.getElementById('about-pet-name').textContent = currentPet.name;
    document.getElementById('pet-breed').textContent = currentPet.breed;
    document.getElementById('pet-age').textContent = currentPet.age || 'Unknown';
    document.getElementById('pet-size').textContent = currentPet.size || 'Unknown';
    document.getElementById('pet-gender').textContent = currentPet.gender || 'Unknown';
    document.getElementById('pet-color').textContent = currentPet.color || 'Unknown';
    
    // Display description
    const descriptionElement = document.getElementById('pet-description');
    descriptionElement.innerHTML = `<p>${currentPet.description || 'No description available.'}</p>`;
    
    // Display status badge
    const statusBadge = document.getElementById('pet-status-badge');
    statusBadge.textContent = (currentPet.status || 'Available').toUpperCase();
    statusBadge.className = `status-badge ${currentPet.status || 'available'}`;
}

/**
 * Display pet images and set up the main image
 */
function displayImages() {
    const mainImage = document.getElementById('main-pet-image');
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    
    if (!currentPet.images || currentPet.images.length === 0) {
        // Use placeholder if no images
        mainImage.src = 'images/pets/placeholder.jpg';
        mainImage.alt = `${currentPet.name} - ${currentPet.breed}`;
        return;
    }
    
    // Set main image to first image
    currentImageIndex = 0;
    mainImage.src = currentPet.images[0];
    mainImage.alt = `${currentPet.name} - ${currentPet.breed}`;
    
    // Create thumbnails if there are multiple images
    if (currentPet.images.length > 1) {
        thumbnailsContainer.innerHTML = '';
        
        currentPet.images.forEach((imageSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.innerHTML = `<img src="${imageSrc}" alt="${currentPet.name} photo ${index + 1}">`;
            thumbnail.addEventListener('click', () => selectImage(index));
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else {
        // Hide thumbnails if only one image
        thumbnailsContainer.style.display = 'none';
    }
}

/**
 * Display personality traits as badges
 */
function displayPersonalityTraits() {
    const traitsContainer = document.getElementById('personality-traits');
    
    if (!currentPet.personality || currentPet.personality.length === 0) {
        traitsContainer.innerHTML = '<p>No personality information available.</p>';
        return;
    }
    
    traitsContainer.innerHTML = '';
    currentPet.personality.forEach(trait => {
        const traitBadge = document.createElement('span');
        traitBadge.className = 'trait-badge';
        traitBadge.textContent = trait;
        traitsContainer.appendChild(traitBadge);
    });
}

/**
 * Display medical information
 */
function displayMedicalInfo() {
    const medical = currentPet.medical || {};
    
    // Vaccination status
    document.getElementById('vaccination-status').textContent = 
        medical.vaccinated ? 'Up to date' : 'Needs vaccination';
    
    // Spay/neuter status
    document.getElementById('spay-neuter-status').textContent = 
        medical.spayed_neutered ? 'Yes' : 'No';
    
    // Microchip status
    document.getElementById('microchip-status').textContent = 
        medical.microchipped ? 'Yes' : 'No';
    
    // Special needs
    const specialNeedsElement = document.getElementById('special-needs-info');
    if (medical.special_needs) {
        specialNeedsElement.textContent = medical.special_needs_description || 'Yes, has special needs';
        specialNeedsElement.style.color = 'var(--warning)';
    } else {
        specialNeedsElement.textContent = 'None';
        specialNeedsElement.style.color = 'var(--success)';
    }
}

/**
 * Display adoption information (fee, arrival date)
 */
function displayAdoptionInfo() {
    // Adoption fee
    const feeElement = document.getElementById('adoption-fee');
    const adoptionFee = currentPet.adoption_fee || 0;
    feeElement.textContent = `$${adoptionFee}`;
    
    // Arrival date
    const arrivalElement = document.getElementById('arrival-date');
    if (currentPet.arrival_date) {
        const arrivalDate = new Date(currentPet.arrival_date);
        arrivalElement.textContent = arrivalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else {
        arrivalElement.textContent = 'Unknown';
    }
}

/**
 * Update action buttons based on pet status and user authentication
 */
function updateActionButtons() {
    const adoptBtn = document.getElementById('adopt-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    
    // Update adopt button based on pet status
    if (currentPet.status === 'adopted') {
        adoptBtn.textContent = '✓ Already Adopted';
        adoptBtn.disabled = true;
        adoptBtn.className = 'btn btn-outline btn-large';
    } else if (currentPet.status === 'pending') {
        adoptBtn.textContent = '⏳ Application Pending';
        adoptBtn.disabled = true;
        adoptBtn.className = 'btn btn-secondary btn-large';
    } else {
        adoptBtn.textContent = '🏠 Apply to Adopt';
        adoptBtn.disabled = false;
        adoptBtn.className = 'btn btn-primary btn-large';
    }
    
    // Check if user is logged in for favorites
    const currentUser = getCurrentUser ? getCurrentUser() : null;
    if (!currentUser) {
        favoriteBtn.innerHTML = '❤️ Login to Favorite';
        favoriteBtn.onclick = () => {
            if (typeof showAlert === 'function') {
                showAlert('Please log in to add pets to your favorites', 'info');
            } else {
                alert('Please log in to add pets to your favorites');
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        };
    } else {
        // Check if pet is already in favorites
        const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.id}`) || '[]');
        const isFavorite = favorites.includes(currentPet.id);
        
        favoriteBtn.innerHTML = isFavorite ? '💖 Remove from Favorites' : '❤️ Add to Favorites';
        favoriteBtn.onclick = () => toggleFavorite();
    }
}

/**
 * Set up image gallery functionality
 */
function setupImageGallery() {
    const mainImage = document.getElementById('main-pet-image');
    
    // Add click handler to main image for lightbox effect (optional enhancement)
    mainImage.addEventListener('click', function() {
        // Could implement a lightbox/modal here
        console.log('Main image clicked - could open lightbox');
    });
    
    // Add keyboard navigation for images
    document.addEventListener('keydown', function(e) {
        if (!currentPet || !currentPet.images || currentPet.images.length <= 1) return;
        
        if (e.key === 'ArrowLeft') {
            selectPreviousImage();
        } else if (e.key === 'ArrowRight') {
            selectNextImage();
        }
    });
}

/**
 * Select a specific image by index
 */
function selectImage(index) {
    if (!currentPet.images || index < 0 || index >= currentPet.images.length) return;
    
    currentImageIndex = index;
    
    // Update main image
    const mainImage = document.getElementById('main-pet-image');
    mainImage.src = currentPet.images[index];
    
    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

/**
 * Select the previous image in the gallery
 */
function selectPreviousImage() {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentPet.images.length - 1;
    selectImage(newIndex);
}

/**
 * Select the next image in the gallery
 */
function selectNextImage() {
    const newIndex = currentImageIndex < currentPet.images.length - 1 ? currentImageIndex + 1 : 0;
    selectImage(newIndex);
}

/**
 * Start the adoption process for this pet
 */
function startAdoption() {
    if (!currentPet) return;
    
    // Check if user is logged in
    const currentUser = getCurrentUser ? getCurrentUser() : null;
    if (!currentUser) {
        if (typeof showAlert === 'function') {
            showAlert('Please log in to start the adoption process', 'info');
        } else {
            alert('Please log in to start the adoption process');
        }
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Check pet availability
    if (currentPet.status !== 'available') {
        if (typeof showAlert === 'function') {
            showAlert('This pet is no longer available for adoption', 'warning');
        } else {
            alert('This pet is no longer available for adoption');
        }
        return;
    }
    
    // Redirect to adoption form with pet ID
    window.location.href = `adoption.html?petId=${currentPet.id}`;
}

/**
 * Toggle favorite status for this pet
 */
function toggleFavorite() {
    const currentUser = getCurrentUser ? getCurrentUser() : null;
    if (!currentUser) {
        if (typeof showAlert === 'function') {
            showAlert('Please log in to manage favorites', 'info');
        } else {
            alert('Please log in to manage favorites');
        }
        return;
    }
    
    const favoritesKey = `favorites_${currentUser.id}`;
    let favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    
    const petIndex = favorites.indexOf(currentPet.id);
    if (petIndex > -1) {
        // Remove from favorites
        favorites.splice(petIndex, 1);
        if (typeof showAlert === 'function') {
            showAlert(`${currentPet.name} removed from favorites`, 'info');
        } else {
            alert(`${currentPet.name} removed from favorites`);
        }
    } else {
        // Add to favorites
        favorites.push(currentPet.id);
        if (typeof showAlert === 'function') {
            showAlert(`${currentPet.name} added to favorites`, 'success');
        } else {
            alert(`${currentPet.name} added to favorites`);
        }
    }
    
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    
    // Update button appearance
    updateActionButtons();
}

/**
 * Set up share functionality
 */
function setupShareFunctionality() {
    // This function is called when the share button is clicked
    window.sharepet = function() {
        if (navigator.share && currentPet) {
            // Use native Web Share API if available
            navigator.share({
                title: `Meet ${currentPet.name} - Available for Adoption`,
                text: `${currentPet.name} is a ${currentPet.age} ${currentPet.breed} looking for a loving home!`,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy URL to clipboard
            copyToClipboard(window.location.href);
            if (typeof showAlert === 'function') {
                showAlert('Pet page URL copied to clipboard!', 'success');
            } else {
                alert('Pet page URL copied to clipboard!');
            }
        }
    };
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

/**
 * Load and display similar pets
 */
async function loadSimilarPets() {
    if (!currentPet || !allPets || allPets.length <= 1) return;
    
    // Find similar pets based on type, size, and availability
    const similarPets = allPets.filter(pet => 
        pet.id !== currentPet.id && // Not the current pet
        pet.status === 'available' && // Only available pets
        (pet.type === currentPet.type || pet.size === currentPet.size) // Similar type or size
    ).slice(0, 3); // Limit to 3 similar pets
    
    if (similarPets.length === 0) return;
    
    // Show the similar pets section
    const similarSection = document.getElementById('similar-pets-section');
    const similarGrid = document.getElementById('similar-pets-grid');
    
    similarGrid.innerHTML = '';
    
    similarPets.forEach(pet => {
        const petCard = createSimilarPetCard(pet);
        similarGrid.appendChild(petCard);
    });
    
    similarSection.style.display = 'block';
}

/**
 * Create a pet card for the similar pets section
 */
function createSimilarPetCard(pet) {
    const card = document.createElement('article');
    card.className = 'pet-card';
    
    const badge = pet.medical && pet.medical.special_needs ? 'Special Needs' : 
                  isNewArrival(pet.arrival_date) ? 'New Arrival' : '';
    
    card.innerHTML = `
        <div class="pet-image">
            <img src="${pet.images[0] || 'images/pets/placeholder.jpg'}" alt="${pet.name} - ${pet.breed}" loading="lazy">
            ${badge ? `<div class="pet-badge">${badge}</div>` : ''}
        </div>
        <div class="pet-info">
            <h3 class="pet-name">${pet.name}</h3>
            <p class="pet-breed">${pet.breed}</p>
            <p class="pet-age">${pet.age}</p>
            <a href="pet-detail.html?id=${pet.id}" class="btn btn-small">Meet ${pet.name}</a>
        </div>
    `;
    
    return card;
}

/**
 * Check if a pet is a new arrival (within 30 days)
 */
function isNewArrival(arrivalDate) {
    if (!arrivalDate) return false;
    
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diffTime = Math.abs(now - arrival);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}

/**
 * Hide the loading state and show the main content
 */
function hideLoadingState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('pet-content').style.display = 'block';
}

/**
 * Show error state with a message
 */
function showErrorState(message) {
    document.getElementById('loading-state').style.display = 'none';
    const errorState = document.getElementById('error-state');
    errorState.style.display = 'block';
    
    if (message) {
        const errorP = errorState.querySelector('p');
        if (errorP) {
            errorP.textContent = message;
        }
    }
}

/**
 * Utility function to show alerts (fallback if showAlert from main.js is not available)
 */
function showSimpleAlert(message, type = 'info') {
    // Create a simple alert if the main showAlert function is not available
    if (typeof showAlert !== 'function') {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 8px;
            color: white;
            z-index: 9999;
            max-width: 300px;
        `;
        
        switch(type) {
            case 'success':
                alertDiv.style.backgroundColor = '#28a745';
                break;
            case 'warning':
                alertDiv.style.backgroundColor = '#ffc107';
                alertDiv.style.color = '#000';
                break;
            case 'error':
                alertDiv.style.backgroundColor = '#dc3545';
                break;
            default:
                alertDiv.style.backgroundColor = '#17a2b8';
        }
        
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    } else {
        showAlert(message, type);
    }
}

// Expose functions to global scope for onclick handlers
window.startAdoption = startAdoption;
window.toggleFavorite = toggleFavorite;

console.log('Pet detail JavaScript loaded successfully');