document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let step = 0;
    const speed = 0.002;

    const startColor = { r: 46, g: 139, b: 87 };  // green
    const endColor   = { r: 65, g: 105, b: 225 }; // blue

    function lerp(a, b, t) {
        return Math.round(a + (b - a) * t);
    }

    function animateGradient() {
        const t = (Math.sin(step) + 1) / 2;

        const r1 = lerp(startColor.r, endColor.r, t);
        const g1 = lerp(startColor.g, endColor.g, t);
        const b1 = lerp(startColor.b, endColor.b, t);

        const r2 = lerp(endColor.r, startColor.r, t);
        const g2 = lerp(endColor.g, startColor.g, t);
        const b2 = lerp(endColor.b, startColor.b, t);

        hero.style.background =
            `linear-gradient(135deg,
                rgb(${r1}, ${g1}, ${b1}) 0%,
                rgb(${r2}, ${g2}, ${b2}) 100%)`;

        step += speed;
        requestAnimationFrame(animateGradient);
    }

    animateGradient();
});
