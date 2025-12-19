document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector('.main-header');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const lead = document.querySelector('.lead');

    if (heroSubtitle) {
        heroSubtitle.style.visibility = 'hidden';
        heroSubtitle.style.opacity = '0';
    }
    if (lead) {
        lead.style.visibility = 'hidden';
        lead.style.opacity = '0';
    }

    function typewriterEffect(element, speed = 100, showCursor = true) {
        return new Promise((resolve) => {
            if (!element) resolve();

            const fullText = element.textContent.trim();
            element.textContent = '';
            element.style.visibility = 'visible'; 
            element.style.transition = 'opacity 0.8s ease';
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });

            let cursor;
            if (showCursor) {
                cursor = document.createElement('span');
                cursor.classList.add('typewriter-cursor');
                cursor.textContent = '|';
                element.appendChild(cursor);
            }

            let index = 0;

            function type() {
                if (index < fullText.length) {
                    element.textContent = fullText.substring(0, index + 1);
                    if (cursor) element.appendChild(cursor);
                    index++;
                    setTimeout(type, speed);
                } else {
                    if (cursor) cursor.remove();
                    resolve(); 
                }
            }

            type();
        });
    }

       function waitForNavAnimation() {
          return new Promise((resolve) => {
            const navTransitionDuration = parseFloat(getComputedStyle(nav).transitionDuration) * 1000 || 1000;
            setTimeout(resolve, navTransitionDuration + 100);
          });
        }

    async function startHeroTypewriter() {
        await waitForNavAnimation();
        await typewriterEffect(heroSubtitle, 35, true);
        await typewriterEffect(lead, 35, true);
    }

    startHeroTypewriter();
});
