document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector('.main-header');
    const hero = document.querySelector('.hero');
    if (navbar && hero) {
        const navHeight = navbar.offsetHeight;

        navbar.style.position = 'absolute';
        navbar.style.top = '0';
        navbar.style.left = '-100%';
        navbar.style.width = '100%';
        navbar.style.background = 'rgba(255,255,255,0.95)';
        navbar.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        navbar.style.transition = 'left 0.8s ease';
        navbar.style.zIndex = '1000';
        hero.style.paddingTop = '0';
        hero.style.transition = 'padding-top 0.8s ease';

         setTimeout(() => {
            navbar.style.left = '0'; 
            hero.style.paddingTop = `${navHeight + 20}px`;
         }, 300);
     }

    if (hero) {
        let step = 0;
        const speed = 0.002;
        const startColor = { r: 46, g: 139, b: 87 }; 
        const endColor = { r: 65, g: 105, b: 225 };

        function lerp(a, b, t) {
            return Math.round(a + (b - a) * t);
        }

        function animateGradient() {
            const t = (Math.sin(step) + 1) / 2;

            const r = lerp(startColor.r, endColor.r, t);
            const g = lerp(startColor.g, endColor.g, t);
            const b = lerp(startColor.b, endColor.b, t);
            const r2 = lerp(endColor.r, startColor.r, t);
            const g2 = lerp(endColor.g, startColor.g, t);
            const b2 = lerp(endColor.b, startColor.b, t);

            hero.style.background = `linear-gradient(135deg, rgb(${r},${g},${b}) 0%, rgb(${r2},${g2},${b2}) 100%)`;

            step += speed;
            requestAnimationFrame(animateGradient);
        }

        animateGradient();
    }
});
