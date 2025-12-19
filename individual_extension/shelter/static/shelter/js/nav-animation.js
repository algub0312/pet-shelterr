document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link, .admin-nav-link");

    navLinks.forEach(link => {
        link.style.opacity = "0";
        link.style.transform = "translateY(-20px)";
        link.style.transition = "all 0.5s ease";
    });

    navLinks.forEach((link, index) => {
        setTimeout(() => {
            link.style.opacity = "1";
            link.style.transform = "translateY(0)";
        }, index * 200); 
    });
});
