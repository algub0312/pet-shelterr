// Search and Filter functionality for pets page
// js/search.js

// Global variables
let allPets = [];
let filteredPets = [];
let currentPage = 1;
const petsPerPage = 9;

// Sample pet data (fallback if pets.json doesn't load) - updated to match JSON structure
const mockPetsData = [
    {
        id: 1,
        name: "Bella",
        type: "dog",
        breed: "Golden Retriever",
        age: "3 years",
        size: "Large",
        gender: "Female",
        color: "Golden",
        description: "Bella is a friendly and energetic dog who loves playing fetch and swimming.",
        personality: ["Friendly", "Energetic", "Good with kids", "Loyal"],
        medical: {
            vaccinated: true,
            spayed_neutered: true,
            microchipped: true,
            special_needs: false
        },
        images: ["images/pets/bella.jpg"],
        arrival_date: "2024-09-15",
        status: "available",
        featured: true
    },
    {
        id: 2,
        name: "Whiskers",
        type: "cat",
        breed: "Tabby Cat",
        age: "5 years",
        size: "Medium",
        gender: "Male",
        color: "Orange and White",
        description: "Whiskers is a calm and affectionate cat who enjoys quiet companionship.",
        personality: ["Independent", "Quiet", "Affectionate"],
        medical: {
            vaccinated: true,
            spayed_neutered: true,
            microchipped: true,
            special_needs: true
        },
        images: ["images/pets/whiskers.jpg"],
        arrival_date: "2024-08-20",
        status: "available",
        featured: true
    },
    {
        id: 3,
        name: "Rocky",
        type: "dog",
        breed: "Mixed Breed",
        age: "2 years",
        size: "Medium",
        gender: "Male",
        color: "Brown and Black",
        description: "Rocky is a playful young dog looking for an active family.",
        personality: ["Energetic", "Playful", "Trainable"],
        medical: {
            vaccinated: true,
            spayed_neutered: true,
            microchipped: true,
            special_needs: false
        },
        images: ["images/pets/rocky.jpg"],
        arrival_date: "2024-09-25",
        status: "available",
        featured: true
    }
];

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only run on pets page
    if (!document.getElementById('pets-grid')) return;
    
    initializePetsPage();
});

// Initialize pets page functionality
async function initializePetsPage() {
    try {
        // Try to load pets from JSON file, fall back to mock data
        await loadPetsData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial display of all pets
        displayPets();
        
        // Initialize URL parameters (if any)
        handleURLParameters();
        
    } catch (error) {
        console.error('Error initializing pets page:', error);
        showError('Failed to load pets data. Please refresh the page.');
    }
}

// Load pets data from JSON or use mock data
async function loadPetsData() {
    try {
        const response = await fetch('data/pets.json');
        if (response.ok) {
            const data = await response.json();
            allPets = data.pets || [];
        } else {
            throw new Error('Failed to fetch pets data');
        }
    } catch (error) {
        console.log('Using mock data for pets');
        allPets = mockPetsData;
    }
    
    filteredPets = [...allPets];
}

// Set up all event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('pet-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Filter inputs
    const filterInputs = document.querySelectorAll('input[name="petType"], input[name="petAge"], input[name="petSize"], input[name="specialNeeds"], input[name="goodWithKids"], input[name="goodWithPets"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    
    // Age range inputs
    const ageInputs = document.querySelectorAll('#min-age, #max-age');
    ageInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortPets(this.value);
            displayPets();
        });
    }
}

// Perform search functionality
function performSearch() {
    const searchTerm = document.getElementById('pet-search').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        applyFilters(); // Apply current filters if search is empty
    } else {
        filteredPets = allPets.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) ||
            pet.breed.toLowerCase().includes(searchTerm) ||
            pet.type.toLowerCase().includes(searchTerm) ||
            (pet.traits && pet.traits.some(trait => trait.toLowerCase().includes(searchTerm)))
        );
        
        // Apply other filters on top of search results
        applyFiltersToSet(filteredPets);
    }
    
    currentPage = 1; // Reset to first page
    displayPets();
}

// Apply all active filters
function applyFilters() {
    filteredPets = [...allPets];
    applyFiltersToSet(filteredPets);
    currentPage = 1; // Reset to first page
    displayPets();
}

// Apply filters to a specific set of pets
function applyFiltersToSet(petsArray) {
    // Pet type filter
    const selectedType = document.querySelector('input[name="petType"]:checked').value;
    if (selectedType !== 'all') {
        filteredPets = filteredPets.filter(pet => pet.type === selectedType);
    }
    
    // Age filter - Extract numeric age from string format
    const selectedAge = document.querySelector('input[name="petAge"]:checked').value;
    const minAge = parseFloat(document.getElementById('min-age').value);
    const maxAge = parseFloat(document.getElementById('max-age').value);
    
    if (selectedAge !== 'all') {
        switch (selectedAge) {
            case 'young':
                filteredPets = filteredPets.filter(pet => {
                    const numericAge = extractNumericAge(pet.age);
                    return numericAge < 1;
                });
                break;
            case 'adult':
                filteredPets = filteredPets.filter(pet => {
                    const numericAge = extractNumericAge(pet.age);
                    return numericAge >= 1 && numericAge <= 5;
                });
                break;
            case 'senior':
                filteredPets = filteredPets.filter(pet => {
                    const numericAge = extractNumericAge(pet.age);
                    return numericAge > 5;
                });
                break;
        }
    }
    
    // Custom age range filter
    if (!isNaN(minAge) && minAge >= 0) {
        filteredPets = filteredPets.filter(pet => {
            const numericAge = extractNumericAge(pet.age);
            return numericAge >= minAge;
        });
    }
    if (!isNaN(maxAge) && maxAge >= 0) {
        filteredPets = filteredPets.filter(pet => {
            const numericAge = extractNumericAge(pet.age);
            return numericAge <= maxAge;
        });
    }
    
    // Size filter - Match the case from JSON (capitalize first letter)
    const selectedSizes = Array.from(document.querySelectorAll('input[name="petSize"]:checked')).map(input => {
        return input.value.charAt(0).toUpperCase() + input.value.slice(1);
    });
    if (selectedSizes.length > 0) {
        filteredPets = filteredPets.filter(pet => selectedSizes.includes(pet.size));
    }
    
    // Special considerations filters - adapted for JSON structure
    const specialNeeds = document.querySelector('input[name="specialNeeds"]:checked');
    const goodWithKids = document.querySelector('input[name="goodWithKids"]:checked');
    const goodWithPets = document.querySelector('input[name="goodWithPets"]:checked');
    
    if (specialNeeds) {
        filteredPets = filteredPets.filter(pet => 
            pet.medical && pet.medical.special_needs === true
        );
    }
    if (goodWithKids) {
        filteredPets = filteredPets.filter(pet => 
            pet.personality && pet.personality.includes("Good with kids")
        );
    }
    if (goodWithPets) {
        filteredPets = filteredPets.filter(pet => 
            pet.personality && (
                pet.personality.includes("Social") || 
                pet.personality.includes("Friendly") ||
                pet.type === "dog" // Assume dogs are generally good with other pets unless specified
            )
        );
    }
}

// Sort pets based on selected criteria
function sortPets(sortBy) {
    switch (sortBy) {
        case 'newest':
            filteredPets.sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
            break;
        case 'oldest':
            filteredPets.sort((a, b) => new Date(a.arrival_date) - new Date(b.arrival_date));
            break;
        case 'name':
            filteredPets.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'age-young':
            filteredPets.sort((a, b) => a.age - b.age);
            break;
        case 'age-old':
            filteredPets.sort((a, b) => b.age - a.age);
            break;
    }
}

// Display pets with pagination
function displayPets() {
    const petsGrid = document.getElementById('pets-grid');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const paginationContainer = document.getElementById('pagination-container');
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredPets.length;
    }
    
    // Show/hide no results message
    if (filteredPets.length === 0) {
        if (petsGrid) petsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    } else {
        if (petsGrid) petsGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);
    const startIndex = (currentPage - 1) * petsPerPage;
    const endIndex = startIndex + petsPerPage;
    const petsToShow = filteredPets.slice(startIndex, endIndex);
    
    // Clear current pets
    if (petsGrid) {
        petsGrid.innerHTML = '';
        
        // Add pet cards
        petsToShow.forEach(pet => {
            const petCard = createPetCard(pet);
            petsGrid.appendChild(petCard);
        });
    }
    
    // Update pagination
    updatePagination(totalPages);
}

// Extract numeric age from string format like "3 years" or "1 year"
function extractNumericAge(ageString) {
    if (typeof ageString === 'number') {
        return ageString;
    }
    if (typeof ageString === 'string') {
        const match = ageString.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    }
    return 0;
}

// Create a pet card element - adapted for JSON structure
function createPetCard(pet) {
    const card = document.createElement('article');
    card.className = 'pet-card';
    
    // Determine badge based on JSON structure
    const isNewArrival = isNewPet(pet.arrival_date);
    const hasSpecialNeeds = pet.medical && pet.medical.special_needs;
    const badge = hasSpecialNeeds ? 'Special Needs' : 
                  isNewArrival ? 'New Arrival' : '';
    
    // Create traits display from personality array
    const traitsHTML = pet.personality && pet.personality.length > 0 ? 
        `<div class="pet-traits">
            ${pet.personality.slice(0, 3).map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
        </div>` : '';
    
    card.innerHTML = `
        <div class="pet-image">
            <img src="${pet.images[0]}" alt="${pet.name} - ${pet.breed}" loading="lazy">
            ${badge ? `<div class="pet-badge">${badge}</div>` : ''}
        </div>
        <div class="pet-info">
            <h3 class="pet-name">${pet.name}</h3>
            <p class="pet-breed">${pet.breed}</p>
            <p class="pet-age">${pet.age}</p>
            ${traitsHTML}
            <a href="pet-detail.html?id=${pet.id}" class="btn btn-small">Meet ${pet.name}</a>
        </div>
    `;
    
    return card;
}

// Sort pets based on selected criteria - adapted for JSON structure
function sortPets(sortBy) {
    switch (sortBy) {
        case 'newest':
            filteredPets.sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
            break;
        case 'oldest':
            filteredPets.sort((a, b) => new Date(a.arrival_date) - new Date(a.arrival_date));
            break;
        case 'name':
            filteredPets.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'age-young':
            filteredPets.sort((a, b) => extractNumericAge(a.age) - extractNumericAge(b.age));
            break;
        case 'age-old':
            filteredPets.sort((a, b) => extractNumericAge(b.age) - extractNumericAge(a.age));
            break;
    }
}

// Update search to work with JSON structure
function performSearch() {
    const searchTerm = document.getElementById('pet-search').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        applyFilters(); // Apply current filters if search is empty
    } else {
        filteredPets = allPets.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) ||
            pet.breed.toLowerCase().includes(searchTerm) ||
            pet.type.toLowerCase().includes(searchTerm) ||
            pet.color.toLowerCase().includes(searchTerm) ||
            pet.description.toLowerCase().includes(searchTerm) ||
            (pet.personality && pet.personality.some(trait => trait.toLowerCase().includes(searchTerm)))
        );
        
        // Apply other filters on top of search results
        applyFiltersToSet(filteredPets);
    }
    
    currentPage = 1; // Reset to first page
    displayPets();
}

// Check if pet is new (arrived within 30 days)
function isNewPet(arrivalDate) {
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diffTime = Math.abs(now - arrival);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}

// Update pagination controls
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    } else {
        if (paginationContainer) paginationContainer.style.display = 'flex';
    }
    
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Change page function
function changePage(direction) {
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPets();
        
        // Scroll to top of results
        const petsMain = document.querySelector('.pets-main');
        if (petsMain) {
            petsMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Clear all filters
function clearAllFilters() {
    // Reset search
    const searchInput = document.getElementById('pet-search');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset type filter
    const allTypeRadio = document.querySelector('input[name="petType"][value="all"]');
    if (allTypeRadio) {
        allTypeRadio.checked = true;
    }
    
    // Reset age filter
    const allAgeRadio = document.querySelector('input[name="petAge"][value="all"]');
    if (allAgeRadio) {
        allAgeRadio.checked = true;
    }
    
    // Reset age range inputs
    const minAgeInput = document.getElementById('min-age');
    const maxAgeInput = document.getElementById('max-age');
    if (minAgeInput) minAgeInput.value = '';
    if (maxAgeInput) maxAgeInput.value = '';
    
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'newest';
    }
    
    // Reapply filters (should show all pets)
    filteredPets = [...allPets];
    sortPets('newest');
    currentPage = 1;
    displayPets();
}

// Handle URL parameters (for deep linking)
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set type filter from URL
    const type = urlParams.get('type');
    if (type) {
        const typeRadio = document.querySelector(`input[name="petType"][value="${type}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
        }
    }
    
    // Set search term from URL
    const search = urlParams.get('search');
    if (search) {
        const searchInput = document.getElementById('pet-search');
        if (searchInput) {
            searchInput.value = search;
        }
    }
    
    // Apply filters if URL params exist
    if (type || search) {
        if (search) {
            performSearch();
        } else {
            applyFilters();
        }
    }
}

// Utility function for debouncing search input
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

// Show error message
function showError(message) {
    console.error(message);
    // You can implement a toast notification or alert here
    if (window.PetShelter && window.PetShelter.showAlert) {
        window.PetShelter.showAlert(message, 'danger');
    }
}

// Export functions for global access
window.performSearch = performSearch;
window.clearAllFilters = clearAllFilters;
window.changePage = changePage;