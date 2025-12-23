const animatedCards = document.querySelectorAll(
    '.about-card, .info-box'
);

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${index * 150}ms`;
                entry.target.classList.add('card-show');
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2
    }
);

animatedCards.forEach(card => observer.observe(card));
