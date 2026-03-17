// Ensure DOM is fully loaded before executing scripts
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. THEME TOGGLE (Dark/Light Mode)
    // ==========================================
    // Shared theme toggle logic
    const storedTheme = localStorage.getItem("zinlo-theme") || "dark";
    document.documentElement.setAttribute("data-theme", storedTheme);

    function applyThemeToggle() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("zinlo-theme", newTheme);
    }

    // Desktop theme toggle (inside nav-links)
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) themeToggleBtn.addEventListener("click", applyThemeToggle);

    // Mobile theme toggle (inside .mobile-nav-actions)
    const themeToggleMobile = document.getElementById("theme-toggle-mobile");
    if (themeToggleMobile) themeToggleMobile.addEventListener("click", applyThemeToggle);

    // ==========================================
    // 1.5. CUSTOM CURSOR
    // ==========================================
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");

    // Check if device has a fine pointer (mouse)
    if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
        window.addEventListener("mousemove", (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Fast follow for dot
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Smooth follow for outline via GSAP
            gsap.to(cursorOutline, {
                x: posX,
                y: posY,
                duration: 0.15,
                ease: "power2.out"
            });
        });

        // Hover effect on interactable elements
        const interactables = document.querySelectorAll("a, button, .tilt-card, input, textarea, .theme-toggle");

        interactables.forEach(el => {
            el.addEventListener("mouseenter", () => {
                cursorOutline.classList.add("hovering");
                cursorDot.style.transform = "translate(-50%, -50%) scale(1.5)";
            });
            el.addEventListener("mouseleave", () => {
                cursorOutline.classList.remove("hovering");
                cursorDot.style.transform = "translate(-50%, -50%) scale(1)";
            });
        });
    }

    // ==========================================
    // 2. SMOOTH SCROLLING (Lenis)
    // ==========================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // ==========================================
    // 3. GSAP ANIMATIONS
    // ==========================================
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Load Animation Timeline
    const heroTl = gsap.timeline();

    // Animate header down
    heroTl.from(".header", { y: -100, opacity: 0, duration: 1, ease: "power3.out" })
        // Stagger hero content up
        .from(".hero-content > *", { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" }, "-=0.5")
        // Fade in Spline viewer
        .from(".hero-3d-wrapper", { opacity: 0, scale: 0.95, duration: 1.5, ease: "power2.out" }, "-=0.8");

    // Simple fade up reveal for sections
    // Removing hero elements from generic reveal since they have their own timeline
    const revealElements = document.querySelectorAll(".gs-reveal:not(.hero-content):not(.hero-3d-wrapper)");

    revealElements.forEach((elem) => {
        // If element is inside a stagger container, we let the stagger handle it later
        if (elem.classList.contains("stagger-item")) return;

        gsap.fromTo(elem,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%", // Reveal when top of element hits 85% of viewport height
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Staggered reveals for grids (Services, Why Us, Portfolio)
    const gridSections = [".services-grid", ".why-grid", ".testimonials-grid"];

    gridSections.forEach(selector => {
        const grid = document.querySelector(selector);
        if (grid) {
            const items = grid.querySelectorAll(".stagger-item");
            if (items.length > 0) {
                gsap.fromTo(items,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: grid,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }
        }
    });

    // Header scroll effect (blur background on scroll)
    const header = document.querySelector(".header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.style.background = "var(--glass-bg)";
            header.style.boxShadow = "var(--glass-shadow)";
        } else {
            header.style.background = "transparent";
            header.style.boxShadow = "none";
        }
    });

    // ==========================================
    // MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const mobileMenuPanel = document.getElementById("mobile-menu-panel");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

    function openMobileMenu() {
        mobileMenuPanel.classList.add("open");
        mobileMenuBtn.classList.add("active");
    }

    function closeMobileMenu() {
        mobileMenuPanel.classList.remove("open");
        mobileMenuBtn.classList.remove("active");
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            if (mobileMenuPanel.classList.contains("open")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close menu when any nav link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener("click", closeMobileMenu);
    });

    // Show/hide panel based on screen size
    function handleResize() {
        if (window.innerWidth > 768) {
            mobileMenuPanel.classList.remove("open");
            if (mobileMenuBtn) mobileMenuBtn.classList.remove("active");
        }
    }
    window.addEventListener("resize", handleResize);


    // Background Parallax Blobs
    gsap.to(".pb-1", {
        yPercent: 50,
        ease: "none",
        scrollTrigger: {
            trigger: "#smooth-content",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    gsap.to(".pb-2", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: "#smooth-content",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // ==========================================
    // 4. 3D CARD TILT EFFECT ON HOVER
    // ==========================================
    const tiltCards = document.querySelectorAll(".tilt-card");

    tiltCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation. Adjust multiplier for effect intensity
            const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Reset transform when mouse leaves
        card.addEventListener("mouseleave", () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            // Smooth transition back to normal state
            card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        });

        // Remove the transition on mouse enter to ensure instantaneous tracking
        card.addEventListener("mouseenter", () => {
            card.style.transition = "none";
        });
    });

});

