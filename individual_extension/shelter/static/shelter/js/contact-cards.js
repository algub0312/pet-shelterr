document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.info-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;

            if (entry.isIntersecting) {
                el.style.opacity = "1";
                el.style.transform = "translateX(0)";
            } else {
                if (el.dataset.side === "left") {
                    el.style.transform = "translateX(-120px)";
                } else {
                    el.style.transform = "translateX(120px)";
                }
                el.style.opacity = "0";
            }
        });
    }, { threshold: 0.25 });

    cards.forEach((card, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        card.dataset.side = side;
        card.style.opacity = "0";
        card.style.transition =
            "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease";
        card.style.transform =
            side === "left"
                ? "translateX(-120px)"
                : "translateX(120px)";

        observer.observe(card);
    });
});
