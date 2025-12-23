let isTransitioning = false;

const circle = document.createElement('div');
document.body.appendChild(circle);

const colors = ['#4ede6dff', '#42a1e5ff'];
let colorIndex = Number(
    sessionStorage.getItem('transitionColorIndex')
) || 0;

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

function startTransition(e, element) {
    if (isTransitioning) return;

 
    if (
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
    ) return;

    const target = element.getAttribute('href');
    if (!target || target.startsWith('#')) return;
    if (element.classList.contains('logout-link')) return;

    e.preventDefault();
    isTransitioning = true;


    circle.style.backgroundColor = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    sessionStorage.setItem('transitionColorIndex', colorIndex);

    const rect = element.getBoundingClientRect();
    circle.style.left = `${rect.left + rect.width / 2}px`;
    circle.style.top = `${rect.top + rect.height / 2}px`;

    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

    requestAnimationFrame(() => {
        circle.style.width = `${maxRadius * 2}px`;
        circle.style.height = `${maxRadius * 2}px`;
    });

    setTimeout(() => {
        window.location.href = target;
    }, 620);
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-transition-btn');
    if (!btn) return;

    startTransition(e, btn);
});

function resetCircle() {
    isTransitioning = false;
    circle.style.transition = 'none';
    circle.style.width = '0px';
    circle.style.height = '0px';
    circle.offsetHeight; 
    circle.style.transition = 'width 0.6s ease, height 0.6s ease';
}

window.addEventListener('load', resetCircle);
window.addEventListener('pageshow', (e) => {
    if (e.persisted) resetCircle();
});


