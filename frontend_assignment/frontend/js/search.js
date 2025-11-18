// Search and Filter functionality for pets page
// js/search.js

// -------------------- Variabile globale pentru listă, filtrare și paginare --------------------
let allPets = [];           // toate animalele încărcate (din JSON sau fallback)
let filteredPets = [];      // rezultatul curent după căutare/filtre
let currentPage = 1;        // pagina curentă pentru paginare
const petsPerPage = 9;      // câte carduri per pagină

// -------------------- Date mock (fallback) dacă pets.json nu se încarcă --------------------
// Structura este aliniată cu cea din JSON (medical, images, arrival_date, etc.)
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

// -------------------- Pornirea logicii doar pe pagina de "pets" --------------------
document.addEventListener('DOMContentLoaded', function() {
    // rulează doar dacă există containerul principal al grilei
    if (!document.getElementById('pets-grid')) return;
    
    initializePetsPage();
});

// -------------------- Inițializarea paginii: încărcare date, listeners, afișare --------------------
async function initializePetsPage() {
    try {
        // 1) Încearcă să încarci din JSON, altfel fallback la mock
        await loadPetsData();
        
        // 2) Setează ascultători pentru căutare, filtre, sortare etc.
        setupEventListeners();
        
        // 3) Afișare inițială (toate animalele)
        displayPets();
        
        // 4) Aplică eventuale parametre din URL (deep-linking)
        handleURLParameters();
        
    } catch (error) {
        console.error('Error initializing pets page:', error);
        showError('Failed to load pets data. Please refresh the page.');
    }
}

// -------------------- Încărcare animale din JSON; altfel fallback --------------------
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
    
    // La început, filtratul = tot setul
    filteredPets = [...allPets];
}

// -------------------- Conectarea tuturor event listener-elor UI --------------------
function setupEventListeners() {
    // Căutare live în input
    const searchInput = document.getElementById('pet-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300)); // debounced
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Filtre (tip, vârstă, mărime, special needs, good with kids/pets)
    const filterInputs = document.querySelectorAll('input[name="petType"], input[name="petAge"], input[name="petSize"], input[name="specialNeeds"], input[name="goodWithKids"], input[name="goodWithPets"]');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    
    // Filtru de interval de vârstă custom (min/max)
    const ageInputs = document.querySelectorAll('#min-age, #max-age');
    ageInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
    
    // Sortare
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortPets(this.value);
            displayPets();
        });
    }
}

// -------------------- Căutare text (nume, rasă, tip, culoare, descriere, personalitate) --------------------
function performSearch() {
    const searchTerm = document.getElementById('pet-search').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        applyFilters(); // dacă nu există termen, aplică doar filtrele curente
    } else {
        // filtrează în allPets după mai multe câmpuri relevante
        filteredPets = allPets.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) ||
            pet.breed.toLowerCase().includes(searchTerm) ||
            pet.type.toLowerCase().includes(searchTerm) ||
            (pet.traits && pet.traits.some(trait => trait.toLowerCase().includes(searchTerm)))
        );
        
        // După căutare, aplică și filtrele active peste rezultat
        applyFiltersToSet(filteredPets);
    }
    
    currentPage = 1; // resetează paginarea
    displayPets();
}

// -------------------- Aplică toate filtrele active pe întreg setul --------------------
function applyFilters() {
    filteredPets = [...allPets];
    applyFiltersToSet(filteredPets);
    currentPage = 1; // resetează paginarea
    displayPets();
}

// -------------------- Aplica filtrele peste un set primit (folosește DOM curent) --------------------
function applyFiltersToSet(petsArray) {
    // Filtru pe tip (dog/cat/… sau all)
    const selectedType = document.querySelector('input[name="petType"]:checked').value;
    if (selectedType !== 'all') {
        filteredPets = filteredPets.filter(pet => pet.type === selectedType);
    }
    
    // Filtru pe vârstă (categorii predefinite) + interval custom
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
    
    // Interval de vârstă personalizat (min/max)
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
    
    // Filtru pe mărime (în JSON e capitalizat: Small/Medium/Large)
    const selectedSizes = Array.from(document.querySelectorAll('input[name="petSize"]:checked')).map(input => {
        return input.value.charAt(0).toUpperCase() + input.value.slice(1);
    });
    if (selectedSizes.length > 0) {
        filteredPets = filteredPets.filter(pet => selectedSizes.includes(pet.size));
    }
    
    // Filtre „special considerations” (în JSON: medical.special_needs; personality conține texte)
    const goodWithKids = document.querySelector('input[name="goodWithKids"]:checked');
    const goodWithPets = document.querySelector('input[name="goodWithPets"]:checked');
    
    // Special needs
    const specialNeeds = document.querySelector('input[name="specialNeeds"]:checked');
    if (specialNeeds) {
        filteredPets = filteredPets.filter(pet => 
            pet.medical && pet.medical.special_needs === true
        );
    }
    // Bun cu copiii
    if (goodWithKids) {
        filteredPets = filteredPets.filter(pet => 
            pet.personality && pet.personality.includes("Good with kids")
        );
    }
    // Bun cu alte animale (ex.: Social, Friendly sau—simplificare—dacă e „dog”)
    if (goodWithPets) {
        filteredPets = filteredPets.filter(pet => 
            pet.personality && (
                pet.personality.includes("Social") || 
                pet.personality.includes("Friendly") ||
                pet.type === "dog" // presupunere: câinii sunt adesea ok cu alte animale dacă nu e specificat altfel
            )
        );
    }
}

// -------------------- Sortare în funcție de criteriul selectat --------------------
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

// -------------------- Afișarea listelor + paginare --------------------
function displayPets() {
    const petsGrid = document.getElementById('pets-grid');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');
    const paginationContainer = document.getElementById('pagination-container');
    
    // Actualizează numărul de rezultate
    if (resultsCount) {
        resultsCount.textContent = filteredPets.length;
    }
    
    // Dacă nu sunt rezultate, ascunde grila și arată mesajul
    if (filteredPets.length === 0) {
        if (petsGrid) petsGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    } else {
        if (petsGrid) petsGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
    }
    
    // Calculează paginarea curentă
    const totalPages = Math.ceil(filteredPets.length / petsPerPage);
    const startIndex = (currentPage - 1) * petsPerPage;
    const endIndex = startIndex + petsPerPage;
    const petsToShow = filteredPets.slice(startIndex, endIndex);
    
    // Curăță grila și adaugă cardurile pentru pagina curentă
    if (petsGrid) {
        petsGrid.innerHTML = '';
        
        petsToShow.forEach(pet => {
            const petCard = createPetCard(pet);
            petsGrid.appendChild(petCard);
        });
    }
    
    // Actualizează butoanele și indicatorii de paginare
    updatePagination(totalPages);
}

// -------------------- Extrage vârsta numerică din stringuri gen "3 years" --------------------
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

// -------------------- Creează un card de pet (adaptat la structura JSON) --------------------
function createPetCard(pet) {
    const card = document.createElement('article');
    card.className = 'pet-card';
    
    // Badge „Special Needs” sau „New Arrival”
    const isNewArrival = isNewPet(pet.arrival_date);
    const hasSpecialNeeds = pet.medical && pet.medical.special_needs;
    const badge = hasSpecialNeeds ? 'Special Needs' : 
                  isNewArrival ? 'New Arrival' : '';
    
    // Afișare trăsături (primele 3) dacă există personality[]
    const traitsHTML = pet.personality && pet.personality.length > 0 ? 
        `<div class="pet-traits">
            ${pet.personality.slice(0, 3).map(trait => `<span class="trait-badge">${trait}</span>`).join('')}
        </div>` : '';
    
    // Markup-ul cardului (imagine, nume, rasă, vârstă, trăsături, link detalii)
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

// -------------------- (DUPLICAT) Sort pets – versiune adaptată pentru JSON --------------------
// Notă: există două definiții de sortPets în fișier (aceasta suprascrie pe cea de sus).
function sortPets(sortBy) {
    switch (sortBy) {
        case 'newest':
            filteredPets.sort((a, b) => new Date(b.arrival_date) - new Date(a.arrival_date));
            break;
        case 'oldest':
            // Atenție: mică eroare în codul original—compară a.arrival_date cu a.arrival_date (ar trebui b.arrival_date)
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

// -------------------- (DUPLICAT) performSearch – versiune extinsă pe mai multe câmpuri --------------------
// Notă: există două definiții (aceasta îl suprascrie pe cel de sus).
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

// -------------------- Verifică dacă un animal e „nou venit” (≤ 30 zile) --------------------
function isNewPet(arrivalDate) {
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diffTime = Math.abs(now - arrival);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}

// -------------------- Actualizează controalele de paginare --------------------
function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Ascunde paginarea dacă avem ≤ 1 pagină
    if (totalPages <= 1) {
        if (paginationContainer) paginationContainer.style.display = 'none';
        return;
    } else {
        if (paginationContainer) paginationContainer.style.display = 'flex';
    }
    
    // Setează textul paginii curente și totalul
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    
    // Activează/dezactivează butoanele prev/next
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

// -------------------- Schimbă pagina (±1) și derulează în sus lista --------------------
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

// -------------------- Reset total al filtrelor + sort + afișare --------------------
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
    
    // Reaplică cu set complet + sort default
    filteredPets = [...allPets];
    sortPets('newest');
    currentPage = 1;
    displayPets();
}

// -------------------- Citește parametrii din URL și aplică (ex: ?type=dog&search=bella) --------------------
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // tip (dog/cat/…)
    const type = urlParams.get('type');
    if (type) {
        const typeRadio = document.querySelector(`input[name="petType"][value="${type}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
        }
    }
    
    // termen căutare
    const search = urlParams.get('search');
    if (search) {
        const searchInput = document.getElementById('pet-search');
        if (searchInput) {
            searchInput.value = search;
        }
    }
    
    // dacă avem parametri, aplicăm automat căutarea/filtrele
    if (type || search) {
        if (search) {
            performSearch();
        } else {
            applyFilters();
        }
    }
}

// -------------------- Debounce helper (evită apelurile prea dese la căutare) --------------------
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

// -------------------- Afișare erori (placeholder) --------------------
function showError(message) {
    console.error(message);
    // Integrare opțională cu un sistem global de toast-uri
    if (window.PetShelter && window.PetShelter.showAlert) {
        window.PetShelter.showAlert(message, 'danger');
    }
}

// -------------------- Export pentru acces global (onclick din HTML etc.) --------------------
window.performSearch = performSearch;
window.clearAllFilters = clearAllFilters;
window.changePage = changePage;
