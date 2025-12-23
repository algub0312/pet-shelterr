let isTransitioning = false;

const circle = document.createElement('div');
document.body.appendChild(circle);

const colors = ['#4ede6dff', '#42a1e5ff'];
let colorIndex = 0;

Object.assign(circle.style, {
    position: 'fixed',
    borderRadius: '50%',
    width: '0px',
    height: '0px',
    left: '0px',
    top: '0px',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s ease, height 0.6s ease',
    zIndex: '99999',
    pointerEvents: 'none',
});

function startTransition(e, link) {
    if (isTransitioning) return;

    // allow new tab / modifiers
    if (
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
    ) return;

    const target = link.getAttribute('href');
    if (!target || target.startsWith('#')) return;

    // ❌ Skip logout (security + UX)
    if (link.classList.contains('logout-link')) return;

    e.preventDefault();
    isTransitioning = true;

    circle.style.backgroundColor = colors[colorIndex];
    colorIndex = 1 - colorIndex;

    const rect = link.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

    requestAnimationFrame(() => {
        circle.style.width = `${maxRadius * 2}px`;
        circle.style.height = `${maxRadius * 2}px`;
    });

    setTimeout(() => {
        window.location.href = target;
    }, 620); // MUST exceed CSS transition time
}

/* ✅ Attach ONLY to navbar links */
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => startTransition(e, link));
});

/* Reset on load / back */
function resetCircle() {
    isTransitioning = false;
    circle.style.transition = 'none';
    circle.style.width = '0px';
    circle.style.height = '0px';
    circle.offsetHeight;
    circle.style.transition = 'width 0.6s ease, height 0.6s ease';
}

window.addEventListener('load', resetCircle);
window.addEventListener('pageshow', e => {
    if (e.persisted) resetCircle();
});
