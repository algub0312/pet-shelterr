const circle = document.createElement('div');
document.body.appendChild(circle);

// Set up alternating colors
const colors = ['#4ede6dff', '#42a1e5ff'];
let colorIndex = 0;

// Style the circle
Object.assign(circle.style, {
    position: 'absolute',
    borderRadius: '50%',
    width: '0px',
    height: '0px',
    top: '0px',
    left: '0px',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s ease, height 0.6s ease',
    zIndex: '9999',
    pointerEvents: 'none',
});

// Function to handle button click
function handleTransition(e) {
    e.preventDefault();

    const target = e.currentTarget.dataset.target || e.currentTarget.href;

    // Set circle color and toggle for next click
    circle.style.backgroundColor = colors[colorIndex];
    colorIndex = 1 - colorIndex;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Position the circle
    circle.style.left = `${centerX}px`;
    circle.style.top = `${centerY}px`;

    // Calculate max radius to cover viewport
    const maxRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);

    // Start expansion
    circle.style.width = `${maxRadius * 2}px`;
    circle.style.height = `${maxRadius * 2}px`;

    // Wait for the circle to fully expand before navigating
    circle.addEventListener('transitionend', () => {
        window.location.href = target;
    }, { once: true });
}

// Attach to all page-transition-btn links
document.querySelectorAll('.page-transition-btn').forEach(btn => {
    btn.addEventListener('click', handleTransition);
});

// Reset circle on page load or when navigating back (bfcache)
function resetCircle() {
    circle.style.transition = 'none'; // temporarily remove transition
    circle.style.width = '0px';
    circle.style.height = '0px';
    // Force reflow to apply immediately
    circle.offsetHeight; 
    circle.style.transition = 'width 0.6s ease, height 0.6s ease';
}

// Reset on normal page load
window.addEventListener('load', resetCircle);

// Reset on back/forward cache restore
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        resetCircle();
    }
});
