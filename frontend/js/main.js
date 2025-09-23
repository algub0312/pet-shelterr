// Main JavaScript for Pet Shelter Website (Desktop Only)
// (Comentat linie cu linie fără a modifica logica / codul existent)

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() { //document e intregul doc html
    initializeHomepageFeatures();       // pornește funcțiile specifice homepage-ului
    initializeAnimations();             // creeaza 3 functii de initializare
    initializeInteractions();           // setează interacțiunile UI (scroll, hover, butoane)
});

// Homepage specific features
function initializeHomepageFeatures() {
    // Only run on homepage
    if (!document.querySelector('.hero-section')) return; //cauta elementul cu clasa hero-section; dacă nu există, nu suntem pe homepage
    
    initializeStatsCounter(); //counter animat pentru statistici
    loadFeaturedPets();       //animale featured apar (încărcate din JSON)
}

// Animated statistics counter
function initializeStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number'); //gaseste toate elementele cu clasa stat-number
                                                                //returneaza ceva gen vector cu toate elementele
    
    // Funcție internă ce animează un singur counter de la 0 până la data-count
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count')); //functie interna care animeaza un singur counter si converteste string in nr
        const duration = 2000; // 2 seconds dureaza animatia
        const step = target / (duration / 16); // 60 FPS calculeaza cate nr sa afiseze pe frame (~la fiecare 16ms)
        let current = 0;
        
        const timer = setInterval(() => { //repeta o functie la interval regulat
            current += step;
            if (current >= target) {  //daca s a ajuns la valoarea finala seteaza exact valoarea finala si opreste animatia
                current = target;
                clearInterval(timer); //opreste animatia
            }
            element.textContent = Math.floor(current).toLocaleString(); // scrie valoarea (rotunjită în jos) cu separatori
        }, 16); //rotunjeste in jos, formeaza nr cu separatori
    }
    
    // Intersection Observer for triggering animation when in view
    const observer = new IntersectionObserver((entries) => { //intersectionObserver= API care detecteaza cand elementele devin vizibile
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);     // pornește animația când elementul e în viewport
                observer.unobserve(entry.target); // nu mai observăm după prima rulare
            }
        });
    }, {
        threshold: 0.5 //elementul trb sa fie 50% vizibil pentru a pornii animatia
    });
    
    // Atașează observer-ul pe fiecare număr statistic
    statNumbers.forEach(stat => {
        observer.observe(stat); //pt fiecare .stat-number incepe sa il observe
    });
}

// Load featured pets from JSON data
async function loadFeaturedPets() {
    try {
        const response = await fetch('data/pets.json');  // cere fișierul JSON local
        const data = await response.json();              // parsează conținutul
        const featuredPets = data.pets.filter(pet => pet.featured); //pastreaza doar animalele featured
        
        displayFeaturedPets(featuredPets);               // randare în grilă
    } catch (error) {
        console.log('Using static pet data');
        // Keep the static HTML pets as fallback
        // Dacă JSON-ul nu e disponibil, rămâne conținutul HTML static din pagină
    }
}

// Primește lista de animale și o afișează
function displayFeaturedPets(pets) {
    const petsGrid = document.querySelector('.pets-grid'); //daca nu gaseste containerul sau nu sunt peturi opreste functia
    if (!petsGrid || pets.length === 0) return;
    
    // Clear existing content
    petsGrid.innerHTML = ''; // golește conținutul existent (fallback-ul static)
    
    // Display up to 3 featured pets
    pets.slice(0, 3).forEach(pet => { //primele 3 din array
        const petCard = createPetCard(pet); //creeaza htmlul pentru un pet (un "article")
        petsGrid.appendChild(petCard); //adauga elemnetele in dom
    });
}

// Creează markup-ul pentru o singură cartelă de pet
function createPetCard(pet) {
    const card = document.createElement('article'); //creeaza un element html
    card.className = 'pet-card'; //seteaza clasa css
    
    // determină textul badge-ului: "Special Needs" sau "New Arrival" (altfel fără badge)
    const badge = pet.medical.special_needs ? 'Special Needs' :  //daca are nevoi speciale apare badgeul
                  isNewArrival(pet.arrival_date) ? 'New Arrival' : ''; //else daca e nou afiseaza new arrival
                  //else fara badge
    
    // Construiește conținutul cardului: imagine + info + buton
    // ia prima img din vector, incarca imaginea doar cadn devine vizibila, creeaza html ul pt info petului
    
    card.innerHTML = `
        <div class="pet-image"> 
            <img src="${pet.images[0]}" alt="${pet.name} - ${pet.breed}" loading="lazy">       
            ${badge ? `<div class="pet-badge">${badge}</div>` : ''}
        </div>
        <div class="pet-info">
            <h3 class="pet-name">${pet.name}</h3>
            <p class="pet-breed">${pet.breed}</p>
            <p class="pet-age">${pet.age}</p>
            <a href="pet-detail.html?id=${pet.id}" class="btn btn-small">Meet ${pet.name}</a>
        </div>
    `;
    
    return card; //returneaza elementul html creat
}


//verifica daca un animal e nou (în ultimele 30 de zile)
function isNewArrival(arrivalDate) {
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diffTime = Math.abs(now - arrival);                          // diferența în milisecunde
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));      // transformă în zile
    return diffDays <= 30; // Consider new if arrived within 30 days
}

// General animation initialization
function initializeAnimations() {
    // Fade in animation for sections
    const observerOptions = {
        threshold: 0.1, //elementul trb sa fie 10% vizibil
        rootMargin: '0px 0px -50px 0px' // începe puțin mai devreme pentru un efect fluid
    };
    
    // Observer care adaugă clasa .fade-in când secțiunea intră în viewport
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Apply to sections
    const sections = document.querySelectorAll('section'); //gaseste toatle elementele section
    sections.forEach(section => {
        // pregătește stilurile inițiale pentru efectul de fade/slide
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        fadeObserver.observe(section); // începe observarea
    });
    
    // Add CSS for fade-in animation (o singură dată, dacă nu există deja)
    if (!document.querySelector('#fade-in-styles')) {
        const style = document.createElement('style');
        style.id = 'fade-in-styles';
        style.textContent = `
            .fade-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize interactive elements
function initializeInteractions() {
    // Smooth scrolling for anchor links (#id)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => { //toatel linkurile care incep cu #
        anchor.addEventListener('click', function (e) { //asteapta click
            e.preventDefault(); // oprește navigarea instant
            const target = document.querySelector(this.getAttribute('href')); // găsește ținta după id
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth', // derulare lină
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.pet-card, .quick-link, .stat-item'); // selectează diverse carduri
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // adaugă un scale subtil la transform-urile deja existente
            this.style.transform = this.style.transform + ' scale(1.02)';
        }); //mareste cu 2% elementul daca este mouseul pe el
        
        card.addEventListener('mouseleave', function() {
            // elimină doar porțiunea de scale(1.02) fără a strica alte transformări existente
            this.style.transform = this.style.transform.replace(' scale(1.02)', '');
        }); //elimin amarirea cand iei mouseul
    });
    
    // Add loading states to buttons (simulare de acțiune/încărcare)
    const buttons = document.querySelectorAll('.btn'); //gaseste toate butoanele
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Don't add loading state to navigation links
            if (this.getAttribute('href') && this.getAttribute('href').endsWith('.html')) { //daca e link catre alta pagina nu face nimic
                return; // lăsăm navigarea normală a linkului
            }
            
            const originalText = this.textContent; // memorează textul original
            this.textContent = 'Loading...';       // feedback vizual
            this.disabled = true;                  // dezactivează temporar
            
            // Remove loading state after 2 seconds (simulated)
            setTimeout(() => {
                this.textContent = originalText;   // restaurează label-ul
                this.disabled = false;             // reactivează
            }, 2000);
        });
    });
}
// Initialize authentication when main.js loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth if auth.js is loaded
    if (typeof updateNavigation === 'function') {
        updateNavigation(); // sincronizează bara de navigație cu starea de login curentă
    }
});
