/* ============================================
   SCRIPT.JS - UPDATE: MOBILE SCROLL NORMALIZATION
============================================ */

// Helper to set VH var
let initialWidth = window.innerWidth;
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', function () {
    if (window.innerWidth !== initialWidth) {
        initialWidth = window.innerWidth;
        setVH();
    }
});

// Register GSAP
try {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText);

    // 1. IGNORE RESIZE: Prevents ScrollTrigger from refreshing on mobile toolbar toggle
    ScrollTrigger.config({ ignoreMobileResize: true });

    // 2. NORMALIZE SCROLL: Intercepts touch events to prevent address bar resizing
    // This gives you the "stable" height you requested.
    ScrollTrigger.normalizeScroll(true);

} catch (e) {
    console.warn("GSAP Plugin Error: Check CDN links.");
}

class Preloader {
    constructor() {
        // 1. IMMEDIATE SCROLL RESET
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        this.preloader = document.querySelector('.preloader');
        this.panelTop = document.querySelector('.preloader__panel--top');
        this.panelBottom = document.querySelector('.preloader__panel--bottom');
        this.progressBar = document.querySelector('.preloader__progress-bar');
        this.progressContainer = document.querySelector('.preloader__progress-container');
        this.numberTop = document.querySelector('.preloader__number--top');
        this.numberBottom = document.querySelector('.preloader__number--bottom');
        this.logoReveal = document.querySelector('.logo-reveal');
        this.logoImage = document.querySelector('.logo-reveal__image');
        this.headerNav = document.querySelector('.header-nav');
        this.mainContent = document.querySelector('.main-content');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.scrollTextContainer = document.querySelector('.scroll-text-container');
        this.sneakerImage = document.querySelector('.scroll-indicator__image');
        this.tagline = document.querySelector('.hero__tagline');
        this.progress = { value: 0 };
        this.isComplete = false;
        this.init();
    }

    init() {
        this.simulateLoading();
    }

    simulateLoading() {
        const loadingTl = gsap.timeline({ onComplete: () => this.onLoadingComplete() });
        loadingTl.to(this.progress, {
            value: 100, duration: 3, ease: "power2.inOut",
            onUpdate: () => {
                const val = Math.round(this.progress.value);
                if (this.numberTop) this.numberTop.textContent = val;
                if (this.numberBottom) this.numberBottom.textContent = val;
                if (this.progressBar) gsap.set(this.progressBar, { width: `${val}%` });
            }
        });
    }

    onLoadingComplete() {
        if (this.isComplete) return;
        this.isComplete = true;
        const revealTl = gsap.timeline({ onComplete: () => this.onRevealComplete() });
        revealTl.to(this.progressContainer, { opacity: 0, duration: 0.2, ease: "power2.out" })
            .to(this.panelTop, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "split")
            .to(this.panelBottom, { yPercent: 100, duration: 0.8, ease: "expo.inOut" }, "split");
    }

    onRevealComplete() {
        gsap.set(this.preloader, { display: 'none' });

        // --- UNLOCK THE PAGE ---
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        document.body.style.height = 'auto';   // Let page grow to full size
        // -----------------------

        if (this.mainContent) this.mainContent.classList.add('is-visible');

        const transitionTl = gsap.timeline();
        transitionTl.to({}, { duration: 0.3 })
            .to(this.logoReveal, { y: -100, duration: 0.6, ease: "power3.out" })
            .to(this.logoReveal, { background: 'transparent', zIndex: 9999, pointerEvents: 'none', duration: 0 }, "<")
            .from('.hero__tagline', { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "<")
            .to([this.scrollIndicator, this.scrollTextContainer], { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3")
            .add(() => {
                this.initSmoothScroll();
                this.setupScrollAnimations();
                this.setupNavigation();
                ScrollTrigger.refresh();
            });
    }

    setupScrollAnimations() {
        const getStableVH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vh')) * 100 || window.innerHeight;
        const stableHeight = getStableVH();
        const finalLogoHeight = stableHeight * 0.05;
        const logoOffset = (32 + finalLogoHeight / 2) - (stableHeight / 2);

        const headerNav = document.getElementById('headerNav');
        const navLinks = document.getElementById('navLinks');

        this.imageSequence = [];
        const baseUrl = 'https://moodyisme.com/syk/assets/AJ1/webp/';
        for (let i = 1; i <= 26; i++) {
            const num = i.toString().padStart(2, '0');
            const img = new Image();
            img.src = `${baseUrl}SaviourKicksimg${num}AJ1-standard-scale-2_00x.webp`;
            this.imageSequence.push(img);
        }

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.hero', start: 'top top', end: '+=500', scrub: 1,
                invalidateOnRefresh: false,
                onEnter: () => { if (this.sneakerImage) this.sneakerImage.style.animation = 'none'; },
                onLeaveBack: () => { if (this.sneakerImage) this.sneakerImage.style.animation = 'bounce 0.5s ease-in-out infinite'; }
            }
        });

        if (this.scrollIndicator) scrollTl.to(this.scrollIndicator, { bottom: stableHeight / 2, yPercent: 50, duration: 1, ease: "none", force3D: true }, 0);

        // --- UPDATED: WIDTH SET TO 80vw ---
        if (this.sneakerImage) {
            // --- SKILL: PREVENT SKEW ---
            // 1. Get Aspect Ratio
            const naturalW = this.sneakerImage.naturalWidth || 1000;
            const naturalH = this.sneakerImage.naturalHeight || 600;
            const aspectRatio = naturalW / naturalH;

            // 2. Define Targets (Logic: Match Yeezy)
            const targetH_vh = window.innerHeight * 0.8; // 80vh
            const maxW_vw = window.innerWidth * 0.9;     // 90vw

            // 3. Calculate Potential Width based on Height Target
            let finalH = targetH_vh;
            let finalW = finalH * aspectRatio;

            // 4. Constraint Check
            if (finalW > maxW_vw) {
                finalW = maxW_vw;
                finalH = finalW / aspectRatio;
            }

            // 5. Animate to EXACT values
            scrollTl.to(this.sneakerImage, {
                width: finalW,
                height: finalH,
                opacity: 1,
                duration: 1,
                ease: "none",
                force3D: true
            }, 0);
        }

        if (this.scrollTextContainer) scrollTl.to(this.scrollTextContainer, { filter: 'blur(10px)', opacity: 0, duration: 0.5, ease: "none", force3D: true }, 0);
        if (this.logoReveal) scrollTl.fromTo(this.logoReveal, { y: -100 }, { y: logoOffset, duration: 1, ease: "none", force3D: true }, 0);
        if (this.logoImage) scrollTl.to(this.logoImage, { height: finalLogoHeight, duration: 1, ease: "none", force3D: true }, 0);
        if (this.tagline) scrollTl.to(this.tagline, { filter: 'blur(20px)', opacity: 0, duration: 1, ease: "none", force3D: true }, 0);

        const logoMoveTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.hero', start: 'top+=500 top', end: '+=300', scrub: 1, invalidateOnRefresh: false,
                onEnter: () => { if (headerNav) headerNav.classList.add('is-active'); },
                onLeaveBack: () => { if (headerNav) headerNav.classList.remove('is-active'); }
            }
        });

        const imgNaturalWidth = (this.logoImage && this.logoImage.naturalWidth) || 1000;
        const imgNaturalHeight = (this.logoImage && this.logoImage.naturalHeight) || 300;
        const aspectRatio = imgNaturalWidth / imgNaturalHeight;
        const finalLogoHeightVal = finalLogoHeight;
        const finalLogoWidth = finalLogoHeightVal * aspectRatio;
        const logoLeftX = 40;
        const logoCenterX = (window.innerWidth / 2);
        const logoMoveDistance = logoCenterX - logoLeftX - (finalLogoWidth / 2);

        if (this.logoReveal) logoMoveTl.to(this.logoReveal, { x: -logoMoveDistance, duration: 1, ease: "power2.out", force3D: true }, 0);

        if (navLinks) {
            const linksContainerOffset = logoLeftX + finalLogoWidth + 20;
            navLinks.style.marginLeft = `${linksContainerOffset}px`;
            navLinks.style.left = '0';
        }

        const navLinkElements = navLinks ? navLinks.querySelectorAll('.header-nav__link') : [];
        const linksRevealTl = gsap.timeline({
            scrollTrigger: { trigger: '.hero', start: 'top+=800 top', end: '+=500', scrub: 1, invalidateOnRefresh: false }
        });
        navLinkElements.forEach((link, index) => {
            const startX = -link.offsetLeft;
            linksRevealTl.fromTo(link, { x: startX, autoAlpha: 0, filter: "blur(20px)" }, { x: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", force3D: true }, index * 0.1);
        });

        // Bipedal Walker logic
        const sticker1 = document.querySelector('.footer-sticker');

        if (sticker1) {
            let sticker2 = document.querySelector('.footer-sticker-2');
            if (!sticker2) {
                sticker2 = sticker1.cloneNode(true);
                sticker2.classList.add('footer-sticker-2');
                sticker2.style.zIndex = "8999";
                document.body.appendChild(sticker2);
            }
            const SHOE_WIDTH_VW = 5;

            gsap.set(sticker1, { opacity: 1, y: 0, xPercent: -100, x: '0vw' });
            gsap.set(sticker2, { opacity: 1, y: 0, xPercent: -100, x: '-5vw' });

            const globalProgressBar = document.querySelector('.global-progress-bar');

            const state = {
                targetX: 0,
                feet: [
                    { el: sticker1, x: 0, cycle: 0, id: "R", scaleX: 1 },
                    { el: sticker2, x: -5, cycle: 0, id: "L", scaleX: 1 }
                ],
                speed: 0.03
            };

            ScrollTrigger.create({
                start: 0, end: 'max', scrub: 0,
                onUpdate: (self) => {
                    state.targetX = self.progress * 100;
                    if (globalProgressBar) gsap.set(globalProgressBar, { width: `${self.progress * 100}%` });
                }
            });

            gsap.ticker.add(() => {
                if (!sticker1 || !sticker2) return;
                const centerMass = (state.feet[0].x + state.feet[1].x) / 2;
                const diff = state.targetX - centerMass;
                const dist = Math.abs(diff);
                const movingRight = diff > 0;

                if (dist > 0.5) {
                    const newScale = movingRight ? 1 : -1;
                    state.feet[0].scaleX = newScale;
                    state.feet[1].scaleX = newScale;
                }

                let activeFootIndex = -1;
                const foot0Cycle = state.feet[0].cycle % 1;
                const foot1Cycle = state.feet[1].cycle % 1;
                const f0MidAir = foot0Cycle > 0.05 && foot0Cycle < 0.95;
                const f1MidAir = foot1Cycle > 0.05 && foot1Cycle < 0.95;

                if (f0MidAir) {
                    activeFootIndex = 0;
                } else if (f1MidAir) {
                    activeFootIndex = 1;
                } else if (dist > 0.05) {
                    if (movingRight) {
                        activeFootIndex = (state.feet[0].x < state.feet[1].x) ? 0 : 1;
                    } else {
                        activeFootIndex = (state.feet[0].x > state.feet[1].x) ? 0 : 1;
                    }
                }

                if (activeFootIndex !== -1) {
                    const foot = state.feet[activeFootIndex];
                    const partner = state.feet[(activeFootIndex === 0) ? 1 : 0];

                    foot.cycle += state.speed;
                    const cycleLocal = foot.cycle % 1;

                    if (cycleLocal > 0.2 && cycleLocal < 0.6) {
                        const STRIDE_GAP = 3 * SHOE_WIDTH_VW;
                        let stepLimitX;
                        if (movingRight) {
                            stepLimitX = partner.x + STRIDE_GAP;
                            if (stepLimitX > state.targetX) stepLimitX = state.targetX;
                        } else {
                            stepLimitX = partner.x - STRIDE_GAP;
                            if (stepLimitX < state.targetX) stepLimitX = state.targetX;
                        }
                        const distToLimit = stepLimitX - foot.x;
                        let moveAmount = distToLimit * 0.2;
                        const maxSpeed = 2.0;
                        if (moveAmount > maxSpeed) moveAmount = maxSpeed;
                        if (moveAmount < -maxSpeed) moveAmount = -maxSpeed;
                        foot.x += moveAmount;
                    }

                    let y = 0, rotation = 0;
                    if (cycleLocal < 0.3) {
                        y = -5 * (cycleLocal / 0.3);
                        rotation = 15 * (cycleLocal / 0.3);
                    } else if (cycleLocal < 0.5) {
                        y = -5;
                        rotation = 15 - (35 * ((cycleLocal - 0.3) / 0.2));
                    } else if (cycleLocal < 0.8) {
                        y = -5 * (1 - ((cycleLocal - 0.5) / 0.3));
                        rotation = -20 * (1 - ((cycleLocal - 0.5) / 0.3));
                    }

                    let finalRotation = rotation;
                    if (foot.scaleX === -1) {
                        finalRotation = -rotation;
                    }

                    gsap.set(foot.el, {
                        x: `${foot.x}vw`,
                        y: y,
                        rotation: finalRotation,
                        scaleX: foot.scaleX
                    });
                } else {
                    gsap.set(state.feet[0].el, { scaleX: state.feet[0].scaleX });
                    gsap.set(state.feet[1].el, { scaleX: state.feet[1].scaleX });
                }

                if (dist < 0.05 && !f0MidAir && !f1MidAir) {
                    state.feet[0].cycle = 0;
                    state.feet[1].cycle = 0;
                }
            });
        }

        this.setupAboutAnimations();
    }

    setupAboutAnimations() {
        const aboutContent = document.querySelector('.about__content');

        // Elements
        const headerContainer = document.querySelector('.about__header-container'); // Black
        const headerBg = document.querySelector('.about__header-bg'); // Red

        const textPremium = document.querySelector('.about__text--1');
        const textReputable = document.querySelector('.about__text--2');
        const textInquire = document.querySelector('.about__text--3');
        const textTrust = document.querySelector('.about__text--4');
        const textHowTo = document.querySelector('.about__text--5'); // The new Link Text

        const bgLineLeft = document.querySelector('.about__line--left-bg');
        const bgLineCenter = document.querySelector('.about__line--center-bg');
        const bgLineRight = document.querySelector('.about__line--right-bg');

        if (!aboutContent || !textPremium) return;

        // --- 1. CONFIGURATION ---
        const triggerStart = 600;

        // SEQUENCE TIMINGS
        const entryDuration = 400;
        const moveUpDuration = 600;
        const swapDuration = 200;
        const redExitDuration = 0;
        const glassDuration = 400;

        const exitStart = 6555;
        const exitPx = 1000;
        const spinStart = exitStart + exitPx;
        const spinPx = 1000;

        const usedPx = entryDuration + moveUpDuration + swapDuration + glassDuration + redExitDuration;
        const textLoopPx = exitStart - triggerStart - usedPx;
        const totalHeroScroll = spinStart + spinPx;

        // --- 2. HERO HEIGHT ---
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.minHeight = `calc(100vh + ${totalHeroScroll}px)`;
        }

        // --- 3. DYNAMIC CALCULATION ---
        const calculateSlideUp = () => {
            // Get current height of the glass card
            const cardHeight = aboutContent.offsetHeight;

            // Move up by 15% of the card's total height
            // Example: If card is 800px tall, move up 120px.
            // Example: If card is 400px tall, move up 60px.
            const percentage = 0.15;

            return -(cardHeight * percentage);
        };

        // Add a resize listener to recalculate positions if window changes
        window.addEventListener('resize', () => {
            // Force GSAP to refresh values so the headline snaps to the new correct spot
            ScrollTrigger.refresh();
        });

        // --- 4. MAIN TIMELINE ---
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.hero',
                start: `top+=${triggerStart} top`,
                end: `+=${exitStart + exitPx}`,
                scrub: 1,
                invalidateOnRefresh: true,
                onEnter: () => aboutContent.classList.add('is-active'),
                onLeaveBack: () => aboutContent.classList.remove('is-active')
            }
        });

        // --- A. INITIAL STATES ---
        gsap.set(aboutContent, {
            autoAlpha: 1,
            left: '50%', top: '50%', xPercent: -50, yPercent: -50,
            position: 'fixed', margin: 0,
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "rgba(255, 255, 255, 0)",
            backdropFilter: "blur(0px)", webkitBackdropFilter: "blur(0px)",
            boxShadow: "0 0 0 rgba(0,0,0,0)"
        });

        // FORCE CENTER START
        gsap.set([headerContainer, headerBg], {
            left: '50%', top: '50%',
            xPercent: -50, yPercent: -50,
            x: 0, y: 0
        });

        gsap.set(headerContainer, { autoAlpha: 0 });
        gsap.set(headerBg, { autoAlpha: 1 });
        gsap.set([bgLineLeft, bgLineCenter, bgLineRight], { visibility: 'hidden' });

        // --- TEXT STYLING GROUPS ---
        const commonTextStyle = { opacity: 0, filter: "blur(15px)", pointerEvents: "none" };

        // GROUP 1: LARGE TEXT (Text 1, Text 2, AND Text 5)
        // We moved textHowTo here so it matches Text 2's size exactly
        gsap.set([textPremium, textReputable, textHowTo], {
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            ...commonTextStyle
        });

        // GROUP 2: EXTRA LARGE (Text 4)
        gsap.set(textTrust, {
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: "600",
            ...commonTextStyle
        });

        // GROUP 3: SMALLER TEXT (Text 3 only)
        gsap.set([textInquire], {
            fontSize: "clamp(1.2rem, 2vw, 2rem)",
            ...commonTextStyle
        });

        // === B. THE SEQUENCE ===

        // 1. RED HEADLINE SLIDES IN
        aboutTl.to([bgLineLeft, bgLineRight, bgLineCenter], { visibility: 'visible', duration: 0 }, 0);
        aboutTl.fromTo(bgLineLeft,
            { x: -window.innerWidth, autoAlpha: 1 },
            { x: 0, duration: entryDuration, ease: "back.out(1.7)" }, 0);
        aboutTl.fromTo(bgLineRight,
            { x: window.innerWidth, autoAlpha: 1 },
            { x: 0, duration: entryDuration, ease: "back.out(1.7)" }, 0);
        aboutTl.fromTo(bgLineCenter,
            { scale: 0, rotationX: 90, autoAlpha: 1 },
            { scale: 1, rotationX: 0, duration: entryDuration, ease: "back.out(1.7)" }, 0);

        // 2. RED HEADLINE SLIDES UP
        aboutTl.to(headerBg, {
            y: () => calculateSlideUp(),
            duration: moveUpDuration,
            ease: "power2.inOut"
        }, ">");

        // 3. FADE IN BLACK HEADLINE
        aboutTl.set(headerContainer, { y: () => calculateSlideUp() }, ">");
        aboutTl.to(headerContainer, { autoAlpha: 1, duration: swapDuration, ease: "none" }, ">");

        // 4. INVISIBLE SWAP
        aboutTl.to(headerBg, { autoAlpha: 0, duration: 0 }, ">");

        // 5. FADE IN GLASS
        aboutTl.to(aboutContent, {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)", webkitBackdropFilter: "blur(20px)",
            boxShadow: "0 40px 80px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
            duration: glassDuration,
            ease: "none"
        }, ">");


        // 6. TEXT LOOP (5 STEPS)
        const stepPx = textLoopPx / 5; // DIVIDED BY 5 NOW
        const fadePx = stepPx * 0.2;
        const holdPx = stepPx * 0.6;

        // Text 1: Premium
        aboutTl.to(textPremium, { opacity: 1, filter: "blur(0px)", duration: fadePx, ease: "power2.out" }, ">");
        aboutTl.to({}, { duration: holdPx });
        aboutTl.to(textPremium, { opacity: 0, filter: "blur(20px)", duration: fadePx, ease: "power2.in" });

        // Text 2: Reputable
        aboutTl.to(textReputable, { opacity: 1, filter: "blur(0px)", duration: fadePx, ease: "power2.out" }, ">");
        aboutTl.to({}, { duration: holdPx });
        aboutTl.to(textReputable, { opacity: 0, filter: "blur(20px)", duration: fadePx, ease: "power2.in" });

        // Text 3: Inquire
        aboutTl.to(textInquire, { opacity: 1, filter: "blur(0px)", duration: fadePx, ease: "power2.out" }, ">");
        aboutTl.to({}, { duration: holdPx });
        aboutTl.to(textInquire, { opacity: 0, filter: "blur(20px)", duration: fadePx, ease: "power2.in" });

        // Text 4: Trust
        aboutTl.to(textTrust, { opacity: 1, filter: "blur(0px)", duration: fadePx, ease: "power2.out" }, ">");
        aboutTl.to({}, { duration: holdPx });
        aboutTl.to(textTrust, { opacity: 0, filter: "blur(20px)", duration: fadePx, ease: "power2.in" });

        // Text 5: How To (New Link)
        aboutTl.to(textHowTo, { opacity: 1, filter: "blur(0px)", duration: fadePx, ease: "power2.out" }, ">");
        aboutTl.to({}, { duration: holdPx + fadePx });

        // 7. TRANSITION: CARD EXITS LEFT, GALLERY ENTERS RIGHT
        // Duration: slideDuration
        const slideDuration = 800;

        // Push old card + text left
        aboutTl.to([aboutContent, headerContainer], {
            x: -window.innerWidth,
            autoAlpha: 0,
            duration: slideDuration,
            ease: "power2.inOut"
        }, ">");

        // Slide Gallery in from Right
        const galleryGrid = document.querySelector('.about__gallery-grid');
        const galleryImages = document.querySelectorAll('.about__gallery-img');

        // Initial State for Gallery
        gsap.set(galleryGrid, { x: window.innerWidth, autoAlpha: 1, visibility: 'visible' });

        // Slide In
        aboutTl.to(galleryGrid, {
            x: 0,
            duration: slideDuration,
            ease: "power2.inOut"
        }, "<");

        // 8. HOLD GALLERY
        const galleryHold = 2000; // Time to look at pictures
        aboutTl.to({}, { duration: galleryHold });

        // 9. GRAND EXIT (EXPLOSIVE SMOKE)
        // We animate the GRID wrapper for opacity, but the IMAGES for the explosion.

        // A: Fade wrapper
        aboutTl.to(galleryGrid, {
            opacity: 0,
            duration: exitPx,
            ease: "power2.in"
        }, ">");

        // B: Explode Images
        // Logic: Calculate distance from center for each image to determine direction
        galleryImages.forEach((img, i) => {
            // Simple "scatter" logic based on index (0-8) in a 3x3 grid
            // Grid positions:
            // 0 1 2
            // 3 4 5
            // 6 7 8

            // Calculate row/col (approximate)
            const col = (i % 3) - 1; // -1, 0, 1 (Left, Center, Right)
            const row = Math.floor(i / 3) - 1; // -1, 0, 1 (Top,  Mid, Bottom)

            // Randomize slightly for chaos
            const randomX = (Math.random() - 0.5) * 50;
            const randomY = (Math.random() - 0.5) * 50;
            const randomRot = (Math.random() - 0.5) * 90;

            const xDir = (col * 300) + randomX; // Move horizontal
            const yDir = (row * 300) + randomY; // Move vertical

            // If it's the center image (4), send it Z-axis (Scale)
            const scaleVal = i === 4 ? 3 : 0.5;

            aboutTl.to(img, {
                x: xDir,
                y: yDir,
                rotation: randomRot,
                scale: scaleVal,
                filter: 'blur(30px)', // The "Smoke"
                duration: exitPx,
                ease: "power2.in"
            }, "<"); // Sync with wrapper fade
        });

        // === C. IMAGE SEQUENCE SYNC ===
        let currentFrame = 0;
        ScrollTrigger.create({
            trigger: '.hero',
            start: `top+=${spinStart} top`,
            end: `+=${spinPx}`,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const frame = Math.min(25, Math.floor(self.progress * 26));
                if (frame !== currentFrame && this.imageSequence[frame] && this.imageSequence[frame].complete) {
                    currentFrame = frame;
                    if (this.sneakerImage) this.sneakerImage.src = this.imageSequence[frame].src;
                }
            }
        });
    }

    setupInternalLinks() {
        const internalLinks = document.querySelectorAll('.js-scroll-to');
        const smoother = this.smoother; // Grab the reference to the active smoother

        if (!smoother) return;

        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // STOP the native jump (Crucial!)

                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);

                if (targetEl) {
                    // 1. Calculate the exact scroll position of the FAQ section
                    // We use smoother.offset() to account for all the pinning (Hero, Services, etc.)
                    const targetY = smoother.offset(targetEl, "top top");

                    // 2. Animate there smoothly
                    // This forces GSAP to 'scrub' past the About section, triggering its exit animation
                    gsap.to(smoother, {
                        scrollTop: targetY,
                        duration: window.innerWidth <= 768 ? 2.5 : 1.5, // Match nav speed
                        ease: "power2.inOut"
                    });
                }
            });
        });
    }

    initSmoothScroll() {
        try { this.smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.5, effects: true, smoothTouch: 0.1 }); } catch (e) { console.error(e); }
        setTimeout(() => {
            this.setupServicesSection();
            this.setupYeezyHero();
            this.setupTiffanySection();
            this.setupAccordion();
            this.setupGalleryModal();
            this.setupNavigation();
            this.setupInternalLinks();
            this.setupContactAnimations();
            this.setupLightbox();
            ScrollTrigger.refresh();
        }, 100);
    }

    setupNavigation() {
        const links = document.querySelectorAll('.header-nav__link');
        const pill = document.querySelector('.header-nav__pill');
        const navLogo = document.getElementById('navLogo');
        const smoother = this.smoother;

        if (!links.length || !pill || !smoother) return;

        let isAutoScrolling = false;
        const isMobile = () => window.innerWidth <= 768;

        // --- COLLISION DETECTOR (Unchanged) ---
        const checkOverlap = () => {
            const pillX = gsap.getProperty(pill, "x");
            const pillW = gsap.getProperty(pill, "width");
            const pillRight = pillX + pillW;

            links.forEach(link => {
                const linkCenter = link.offsetLeft + (link.offsetWidth / 2);
                if (linkCenter > pillX && linkCenter < pillRight) {
                    link.classList.add('is-under-pill');
                } else {
                    link.classList.remove('is-under-pill');
                }
            });
        };

        // --- 1. BASIC MOVE (Unchanged) ---
        const movePillTo = (link) => {
            if (isAutoScrolling) return;

            const targetLeft = link.offsetLeft;
            const targetWidth = link.offsetWidth;

            gsap.to(pill, {
                x: targetLeft,
                width: targetWidth,
                opacity: 1,
                duration: 0.5,
                overwrite: 'auto',
                ease: "power2.out",
                onUpdate: checkOverlap,
                onComplete: checkOverlap
            });
        };

        const hidePill = () => {
            if (isAutoScrolling) return;
            gsap.to(pill, {
                opacity: 0,
                width: 0,
                duration: 0.3,
                overwrite: 'auto',
                onUpdate: checkOverlap,
                onComplete: () => {
                    links.forEach(l => l.classList.remove('is-under-pill'));
                }
            });
        };

        // --- 2. THE SPLIT WORM (Unchanged) ---
        const startWorm = (link) => {
            isAutoScrolling = true;

            const currentX = gsap.getProperty(pill, "x");
            const targetX = link.offsetLeft;
            const targetWidth = link.offsetWidth;
            const isMovingRight = targetX > currentX;

            let stretchX, stretchWidth;

            if (isMovingRight) {
                stretchX = currentX;
                stretchWidth = (targetX - currentX) + targetWidth;
            } else {
                stretchX = targetX;
                stretchWidth = (currentX - targetX) + gsap.getProperty(pill, "width");
            }

            gsap.to(pill, {
                x: stretchX,
                width: stretchWidth,
                opacity: 1,
                duration: 0.4,
                ease: "power2.in",
                overwrite: 'auto',
                onUpdate: checkOverlap
            });

            return () => {
                gsap.to(pill, {
                    x: targetX,
                    width: targetWidth,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)",
                    onUpdate: checkOverlap,
                    onComplete: () => {
                        isAutoScrolling = false;
                        checkOverlap();
                    }
                });
            };
        };

        // --- 3. SCROLL TRIGGERS (UPDATED) ---

        // Hide pill at the very top (Unchanged)
        ScrollTrigger.create({
            trigger: 'body', start: "top top", end: "top+=100",
            onEnter: () => hidePill(),
            onEnterBack: () => hidePill(),
            onLeaveBack: () => hidePill()
        });

        links.forEach(link => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#' || targetId.length < 2) return;

            if (targetId === '#about-anchor' || targetId === '#about') {

                // --- THE FIX IS HERE ---
                // Previous Start: "top+=500 top" (Too early)
                // New Start: "top+=1300 top" 
                // Why 1300? Because 'linksRevealTl' starts at 800 and lasts for 500 pixels.
                // 800 + 500 = 1300. The pill now waits for the blur to finish.

                ScrollTrigger.create({
                    trigger: '.hero',
                    start: "top+=1300 top",
                    end: "top+=8500 top", // Matches the full sequence length calculated in setupAboutAnimations
                    onEnter: () => movePillTo(link),
                    onEnterBack: () => movePillTo(link),
                    onLeaveBack: () => hidePill() // Hides if we scroll back up above 1300px
                });
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                ScrollTrigger.create({
                    trigger: targetSection,
                    start: "top center", end: "bottom center",
                    onEnter: () => movePillTo(link),
                    onEnterBack: () => movePillTo(link)
                });
            }
        });

        // --- 4. CLICK HANDLERS (Unchanged) ---
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const finishWorm = startWorm(link);

                const targetId = link.getAttribute('href');
                let targetY = 0;

                if (targetId === '#about-anchor' || targetId === '#about') {
                    // Update scroll target to match visual start where text is fully visible
                    targetY = 2500;
                } else {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetY = smoother.offset(targetElement, "top top");
                    }
                }

                const scrollDuration = isMobile() ? 2.5 : 1.5;

                gsap.to(smoother, {
                    scrollTop: targetY,
                    duration: scrollDuration,
                    ease: "power2.inOut",
                    onComplete: () => {
                        finishWorm();
                    }
                });
            });
        });

        if (navLogo) {
            navLogo.addEventListener('click', () => {
                isAutoScrolling = true;
                hidePill();

                const scrollDuration = isMobile() ? 2.5 : 1.5;

                gsap.to(smoother, {
                    scrollTop: 0,
                    duration: scrollDuration,
                    ease: "power2.inOut",
                    onComplete: () => {
                        isAutoScrolling = false;
                        links.forEach(l => l.classList.remove('is-under-pill'));
                    }
                });
            });
        }
    }

    setupAccordion() {
        const items = document.querySelectorAll('.faq__item');
        items.forEach(item => {
            const question = item.querySelector('.faq__question');
            const answer = item.querySelector('.faq__answer');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                items.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        gsap.to(otherItem.querySelector('.faq__answer'), { height: 0, duration: 0.4, ease: "power2.inOut" });
                    }
                });
                if (isActive) {
                    item.classList.remove('active');
                    gsap.to(answer, { height: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
                } else {
                    item.classList.add('active');
                    gsap.to(answer, { height: "auto", duration: 0.4, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
                }
            });
        });
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox__image');
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const prevBtn = lightbox.querySelector('.lightbox__prev');
        const nextBtn = lightbox.querySelector('.lightbox__next');
        const galleryImages = document.querySelectorAll('.about__gallery-img');

        let currentIndex = 0;

        const openLightbox = (index) => {
            currentIndex = index;
            lightboxImg.src = galleryImages[currentIndex].src;
            lightbox.classList.add('is-open');
        };

        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImg.src = galleryImages[currentIndex].src;
        };

        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });

        // Close on background click
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        // Keyboard nav
        document.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    }

    setupContactAnimations() {
        gsap.from('.contact__title', { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: '.contact-section', start: 'top 60%' } });
        gsap.from('.contact__info-item', { y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out", scrollTrigger: { trigger: '.contact__info', start: 'top 80%' } });
        gsap.from('.form-group', { x: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: '.contact__form', start: 'top 70%' } });
        gsap.from('.footer__text', { y: 100, opacity: 0, duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: '.main-footer', start: 'top 90%' } });
    }

    setupServicesSection() {
        const servicesSection = document.querySelector('.services-section');
        const track = document.querySelector('.services__track');
        const cards = document.querySelectorAll('.service-card');

        const yeezySection = document.querySelector('.yeezy-hero');

        const parallaxImg1 = document.getElementById('parallaxImg1');
        const parallaxImg2 = document.getElementById('parallaxImg2');

        if (!track || cards.length === 0) return;

        let cardWidth, gap, startX, totalMove, parallaxMaxMove;

        const updateGeometry = () => {
            const isMobile = window.innerWidth <= 768;

            // UPDATE 1: Match CSS Widths
            // Mobile: 0.80 (80vw) | Desktop: 0.55 (55vw)
            cardWidth = isMobile ? window.innerWidth * 0.80 : window.innerWidth * 0.55;

            // Gap matches CSS (8vw)
            gap = window.innerWidth * 0.08;

            const totalCards = cards.length;

            // Calculate centering for first and last card
            startX = (window.innerWidth - cardWidth) / 2;
            const lastCardIndex = totalCards - 1;
            totalMove = lastCardIndex * (cardWidth + gap);
            parallaxMaxMove = window.innerWidth * 0.5;
        };

        updateGeometry();
        track.style.transform = `translateX(${startX}px)`;

        const parallax1Speed = -0.5;
        const parallax2Speed = -0.9;

        // UPDATE 2: Increase scroll distance for Mobile
        // 700px per card on mobile (smoother), 500px on desktop
        const scrollPerCard = window.innerWidth <= 768 ? 700 : 500;

        const horizontalScrollDistance = (cards.length + 1) * scrollPerCard;
        const revealScrollDistance = 1000;
        const totalScrollDistance = horizontalScrollDistance + revealScrollDistance;

        ScrollTrigger.create({
            trigger: servicesSection,
            start: 'top top',
            end: `+=${totalScrollDistance}`,
            pin: true,
            pinType: 'transform',
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefreshInit: () => { updateGeometry(); },
            onRefresh: (self) => {
                const progress = self.progress;
                const horizontalEndProgress = horizontalScrollDistance / totalScrollDistance;
                const horizontalProgress = Math.min(1, progress / horizontalEndProgress);
                const currentX = startX - (totalMove * horizontalProgress);
                track.style.transform = `translateX(${currentX}px)`;

                if (parallaxImg1) parallaxImg1.style.transform = `translateX(${horizontalProgress * parallaxMaxMove * parallax1Speed}px)`;
                if (parallaxImg2) parallaxImg2.style.transform = `translateX(${horizontalProgress * parallaxMaxMove * parallax2Speed}px) translateY(-50%)`;
            },
            onUpdate: (self) => {
                const progress = self.progress;
                const horizontalEndProgress = horizontalScrollDistance / totalScrollDistance;

                // --- PHASE 1: HORIZONTAL SCROLL ---
                if (progress <= horizontalEndProgress) {
                    const horizontalProgress = progress / horizontalEndProgress;
                    const currentX = startX - (totalMove * horizontalProgress);

                    track.style.transform = `translateX(${currentX}px)`;

                    // Reset Reveal
                    servicesSection.style.clipPath = '';
                    if (yeezySection) yeezySection.classList.remove('is-active');

                    // Parallax
                    if (parallaxImg1) parallaxImg1.style.transform = `translateX(${horizontalProgress * parallaxMaxMove * parallax1Speed}px)`;
                    if (parallaxImg2) parallaxImg2.style.transform = `translateX(${horizontalProgress * parallaxMaxMove * parallax2Speed}px) translateY(-50%)`;
                }
                // --- PHASE 2: REVEAL YEEZY ---
                else {
                    // Ensure track is locked at the end position
                    const endX = startX - totalMove;
                    track.style.transform = `translateX(${endX}px)`;

                    const revealProgress = (progress - horizontalEndProgress) / (1 - horizontalEndProgress);
                    const clipPercent = revealProgress * 100;

                    servicesSection.style.clipPath = `inset(0 ${clipPercent}% 0 0)`;

                    if (yeezySection) yeezySection.classList.add('is-active');
                }
            },
            onLeaveBack: () => {
                track.style.transform = `translateX(${startX}px)`;
                servicesSection.style.clipPath = '';
                if (yeezySection) yeezySection.classList.remove('is-active');
                if (parallaxImg1) parallaxImg1.style.transform = 'translateX(0)';
                if (parallaxImg2) parallaxImg2.style.transform = 'translateX(0) translateY(-50%)';
            },
            onLeave: () => {
                if (yeezySection) yeezySection.classList.add('is-active');
            }
        });
    }

    setupYeezyHero() {
        const yeezySection = document.querySelector('.yeezy-hero');
        const yeezyImage = document.getElementById('yeezyImage');
        const yeezyHeroSpacer = document.querySelector('.yeezy-hero-spacer');

        // Select Text Layers
        const backTextSpans = document.querySelectorAll('.yeezy-hero__text--back span');
        const frontText = document.querySelector('.yeezy-hero__text--front');

        // Layers to manage
        const aj1Container = document.querySelector('.scroll-indicator');
        const tiffanySection = document.querySelector('.tiffany-hero');

        if (!yeezySection || !yeezyImage || !yeezyHeroSpacer) return;

        // 1. PRELOAD SEQUENCE
        const yeezyFrameCount = 36;
        const yeezySequence = [];
        const yeezyBaseUrl = 'https://moodyisme.com/syk/assets/Air_Yeezy_1/webp/img';

        for (let i = 0; i < yeezyFrameCount; i++) {
            const img = new Image();
            const digits = String(i + 1).padStart(2, '0');
            img.src = `${yeezyBaseUrl}${digits}.webp`;
            yeezySequence.push(img);
        }

        if (yeezySequence[0]) yeezyImage.src = yeezySequence[0].src;

        // 2. SCROLL LOGIC
        ScrollTrigger.create({
            trigger: yeezyHeroSpacer,
            start: 'top bottom+=500',
            end: 'bottom top',
            scrub: 0,

            // VISIBILITY TOGGLES
            onEnter: () => {
                yeezySection.classList.add('is-active');
                if (tiffanySection) tiffanySection.classList.remove('is-active');
                if (aj1Container) aj1Container.style.visibility = 'hidden';
            },
            onLeave: () => {
                yeezySection.classList.remove('is-active');
            },
            onEnterBack: () => {
                yeezySection.classList.add('is-active');
                if (tiffanySection) tiffanySection.classList.remove('is-active');
                if (aj1Container) aj1Container.style.visibility = 'hidden';
            },
            onLeaveBack: () => {
                if (aj1Container) aj1Container.style.visibility = 'visible';
            },

            onUpdate: (self) => {
                const p = self.progress;

                // --- 1. TEXT 1 (RED BLURRED) REVEAL [0.20 -> 0.40] ---
                if (p > 0.20) {
                    const backRevealProg = Math.min(1, (p - 0.20) / 0.20);

                    backTextSpans.forEach((span, i) => {
                        const localProg = Math.max(0, Math.min(1, backRevealProg * 1.5 - (i * 0.2)));

                        // Dissolve Red Text later (at 0.90) to be safe
                        if (p < 0.90) {
                            span.style.opacity = localProg;
                        }

                        span.style.filter = `blur(${(1 - localProg) * 20}px)`;
                        span.style.transform = `scale(${0.9 + (localProg * 0.1)})`;
                    });
                } else {
                    backTextSpans.forEach(span => {
                        span.style.opacity = 0;
                        span.style.filter = 'blur(20px)';
                    });
                }

                // --- 2. IMAGE SEQUENCE [0.05 -> 0.65] ---
                const imgStart = 0.0;
                const imgEnd = 0.65;
                let seqProgress = 0;

                if (p > imgStart) {
                    seqProgress = Math.min(1, (p - imgStart) / (imgEnd - imgStart));
                }

                const frame = Math.floor(seqProgress * (yeezySequence.length - 1));
                const clampedFrame = Math.max(0, Math.min(yeezySequence.length - 1, frame));

                if (yeezySequence[clampedFrame]) {
                    yeezyImage.src = yeezySequence[clampedFrame].src;
                }

                // --- 3. TEXT 2 (RED SHARP) FADE IN [0.60 -> 0.70] ---
                if (p > 0.60) {
                    const frontRevealProg = Math.min(1, (p - 0.60) / 0.1);
                    frontText.style.opacity = frontRevealProg;
                } else {
                    frontText.style.opacity = 0;
                }

                // --- 4. CLEANUP & EXIT ---

                // Dissolve Text 1 (Blur Layer) [0.70+]
                if (p > 0.70) {
                    const backDissolveProg = (p - 0.70) / 0.1;
                    backTextSpans.forEach(span => {
                        span.style.opacity = 1 - backDissolveProg;
                    });
                }

                // Blur out Image [0.80+]
                if (p > 0.80) {
                    const exitBlurProg = (p - 0.80) / 0.05;
                    yeezyImage.style.filter = `blur(${exitBlurProg * 20}px)`;
                } else {
                    yeezyImage.style.filter = 'blur(0px)';
                }
            }
        });
    }

    setupTiffanySection() {
        const tiffanySection = document.querySelector('.tiffany-hero');
        const tiffanySpacer = document.querySelector('.tiffany-spacer');
        const tiffanyImage = document.getElementById('tiffanyImage');

        const backTextSpans = document.querySelectorAll('.tiffany-hero__text--back span');
        const frontText = document.querySelector('.tiffany-hero__text--front');

        const yeezySection = document.querySelector('.yeezy-hero');
        const aj1Container = document.querySelector('.scroll-indicator');

        if (!tiffanySection || !tiffanySpacer || !tiffanyImage) return;

        // 1. PRELOAD
        const tiffanySequence = [];
        const tiffanyBaseUrl = 'https://moodyisme.com/syk/assets/Tiffany_Dunk_SB_Low/webp/img';
        for (let i = 1; i <= 36; i++) {
            const img = new Image();
            const num = i.toString().padStart(2, '0');
            img.src = `${tiffanyBaseUrl}${num}.webp`;
            tiffanySequence.push(img);
        }
        if (tiffanySequence.length > 0) tiffanyImage.src = tiffanySequence[0].src;

        // 2. SCROLL LOGIC
        ScrollTrigger.create({
            trigger: tiffanySpacer,
            start: "top bottom",
            end: "bottom top",
            scrub: 0,

            // VISIBILITY
            onEnter: () => {
                tiffanySection.classList.add('is-active');
                if (yeezySection) yeezySection.classList.remove('is-active');
                if (aj1Container) aj1Container.style.visibility = 'hidden';
            },
            onLeave: () => {
                tiffanySection.classList.remove('is-active');
            },
            onEnterBack: () => {
                tiffanySection.classList.add('is-active');
                if (yeezySection) yeezySection.classList.remove('is-active');
                if (aj1Container) aj1Container.style.visibility = 'hidden';
            },
            onLeaveBack: () => {
                tiffanySection.classList.remove('is-active');
                if (aj1Container) aj1Container.style.visibility = 'visible';
            },

            onUpdate: (self) => {
                const p = self.progress;

                // --- 1. TEXT 1 (RED) REVEAL [0.20 -> 0.40] ---
                // Starts early so it's ready before the image moves
                if (p > 0.20) {
                    const backRevealProg = Math.min(1, (p - 0.20) / 0.20);

                    backTextSpans.forEach((span, i) => {
                        const localProg = Math.max(0, Math.min(1, backRevealProg * 1.5 - (i * 0.2)));

                        // Dissolve Red Text later (at 0.90)
                        if (p < 0.90) {
                            span.style.opacity = localProg;
                        }

                        span.style.filter = `blur(${(1 - localProg) * 20}px)`;
                        span.style.transform = `scale(${0.9 + (localProg * 0.1)})`;
                    });
                } else {
                    backTextSpans.forEach(span => {
                        span.style.opacity = 0;
                        span.style.filter = 'blur(20px)';
                    });
                }

                // --- 2. IMAGE SEQUENCE [0.50 -> 0.90] ---
                // Starts exactly at 50% scroll
                const imgStart = 0.05;
                const imgEnd = 0.65;
                let seqProgress = 0;

                if (p > imgStart) {
                    seqProgress = Math.min(1, (p - imgStart) / (imgEnd - imgStart));
                }

                const frame = Math.floor(seqProgress * (tiffanySequence.length - 1));
                const clampedFrame = Math.max(0, Math.min(tiffanySequence.length - 1, frame));

                if (tiffanySequence[clampedFrame]) {
                    tiffanyImage.src = tiffanySequence[clampedFrame].src;
                }

                // --- 3. TEXT 2 (RED) FADE IN [0.80 -> 0.95] ---
                // Starts at 75% of the image sequence (0.50 + 75% of 0.40 range = 0.80)
                if (p > 0.60) {
                    const frontRevealProg = Math.min(1, (p - 0.60) / 0.1);
                    frontText.style.opacity = frontRevealProg;
                } else {
                    frontText.style.opacity = 0;
                }

                // --- 4. CLEANUP & EXIT [0.90+] ---
                // Waits until Text 2 is mostly visible before blurring out

                // Dissolve Red Text
                if (p > 0.70) {
                    const backDissolveProg = (p - 0.70) / 0.1;
                    backTextSpans.forEach(span => {
                        span.style.opacity = 1 - backDissolveProg;
                    });
                }

                // Blur out Tiffany (0.95 -> 1.0)
                if (p > 0.80) {
                    const exitBlurProg = (p - 0.80) / 0.05; // Fast blur at the very end
                    tiffanyImage.style.filter = `blur(${exitBlurProg * 20}px)`;
                } else {
                    tiffanyImage.style.filter = 'blur(0px)';
                }
            }
        });
    }

    setupGalleryModal() {
        const galleryBtns = document.querySelectorAll('.service-card__gallery-btn');
        const galleryModal = document.getElementById('galleryModal');
        const galleryClose = document.getElementById('galleryModalClose');
        const galleryContent = document.querySelector('.gallery-modal__content');
        const smoother = this.smoother;

        if (!galleryModal) return;

        let galleryTriggers = [];
        let activeCardClone = null;
        let originalCard = null;
        let originalRect = null;

        galleryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.service-card');
                const serviceType = card.dataset.service;
                originalCard = card;
                originalRect = card.getBoundingClientRect();

                // --- 1. CLEAR PREVIOUS CONTENT ---
                galleryContent.innerHTML = '';

                // --- 2. CLONE TEMPLATE ---
                // We look for IDs like "tmpl-deep-cleaning", "tmpl-repaints", etc.
                const template = document.getElementById(`tmpl-${serviceType}`);

                if (template) {
                    // Clone the template's content
                    const clone = template.content.cloneNode(true);
                    galleryContent.appendChild(clone);
                } else {
                    // Fallback if template is missing (Cleaned up for 5 cards)
                    const titles = {
                        'deep-cleaning': 'Deep Cleaning',
                        'repaints': 'Repaints',
                        'deoxidation': 'Deoxidation',
                        'reglue': 'Reglues & Sole Swaps'
                        // Removed suede-nubuck
                    };
                    galleryContent.innerHTML = `<h2 class="gallery-modal__title">${titles[serviceType] || 'Gallery'}</h2><p class="gallery-modal__text">Gallery images coming soon.</p>`;
                }

                // --- 3. RE-INITIALIZE ACCORDION (If present) ---
                // Since we appended via JS, we can find these elements immediately.
                const modalItems = galleryContent.querySelectorAll('.modal-accordion');
                if (modalItems.length > 0) {
                    modalItems.forEach(item => {
                        const question = item.querySelector('.faq__question');
                        const answer = item.querySelector('.faq__answer');

                        gsap.set(answer, { height: 0 }); // Reset state

                        question.addEventListener('click', () => {
                            const isActive = item.classList.contains('active');

                            // Close others
                            modalItems.forEach(other => {
                                if (other !== item && other.classList.contains('active')) {
                                    other.classList.remove('active');
                                    gsap.to(other.querySelector('.faq__answer'), { height: 0, duration: 0.4, ease: "power2.inOut" });
                                    const icon = other.querySelector('.faq__icon');
                                    if (icon) gsap.to(icon, { rotation: 0, duration: 0.3 });
                                }
                            });

                            // Toggle current
                            if (isActive) {
                                item.classList.remove('active');
                                gsap.to(answer, { height: 0, duration: 0.4, ease: "power2.inOut" });
                                const icon = item.querySelector('.faq__icon');
                                if (icon) gsap.to(icon, { rotation: 0, duration: 0.3 });
                            } else {
                                item.classList.add('active');
                                gsap.to(answer, { height: "auto", duration: 0.4, ease: "power2.inOut" });
                                const icon = item.querySelector('.faq__icon');
                                if (icon) gsap.to(icon, { rotation: 45, duration: 0.3 });
                            }
                        });
                    });

                    // Animate accordion children in
                    gsap.fromTo(galleryContent.children,
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
                    );
                }

                // --- 4. SETUP SCROLL ANIMATIONS FOR GALLERY ITEMS ---
                // Wait 1 tick for the DOM to settle layout
                setTimeout(() => {
                    const items = galleryContent.querySelectorAll('.gallery-item');
                    if (items.length > 0) {
                        items.forEach((item, i) => {
                            gsap.set(item, { opacity: 0, filter: 'blur(10px)', y: 50 });

                            const trig = ScrollTrigger.create({
                                trigger: item,
                                scroller: '#galleryModal',
                                start: 'top 85%',
                                toggleActions: 'play none none reverse',
                                onEnter: () => {
                                    gsap.to(item, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, ease: "power2.out" });
                                }
                            });
                            galleryTriggers.push(trig);
                        });
                    }
                }, 50);

                // --- 5. MORPH LOGIC (Glass to Red) ---
                activeCardClone = card.cloneNode(true);
                activeCardClone.classList.add('is-morphing');
                document.body.appendChild(activeCardClone);
                card.style.visibility = 'hidden';

                const cloneContent = activeCardClone.querySelectorAll('.service-card__num, .service-card__title, .service-card__desc, .service-card__note, .service-card__gallery-btn');

                gsap.set(activeCardClone, {
                    position: 'fixed',
                    top: originalRect.top,
                    left: originalRect.left,
                    width: originalRect.width,
                    height: originalRect.height,
                    margin: 0,
                    zIndex: 10000,
                    backgroundColor: 'rgba(255, 255, 255, 0.10)',
                    borderColor: 'rgba(255, 255, 255, 0.6)'
                });

                if (smoother) smoother.paused(true);

                const morphTl = gsap.timeline();
                morphTl.to(cloneContent, { opacity: 0, duration: 0.25, ease: 'power2.out' })
                    .to(activeCardClone, {
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                        backgroundColor: '#CE1141',
                        borderWidth: 0,
                        duration: 0.5,
                        ease: 'power3.inOut'
                    })
                    .add(() => { activeCardClone.classList.add('is-morphed'); })
                    .to({}, { duration: 0.5 })
                    .add(() => { galleryModal.classList.add('is-open'); });
            });
        });

        const closeGallery = () => {
            if (!activeCardClone || !originalCard) return;

            galleryTriggers.forEach(t => t.kill());
            galleryTriggers = [];

            const cloneContent = activeCardClone.querySelectorAll('.service-card__num, .service-card__title, .service-card__desc, .service-card__note, .service-card__gallery-btn');
            const morphTl = gsap.timeline();

            morphTl.add(() => {
                galleryModal.classList.remove('is-open');
                galleryModal.scrollTop = 0;
            })
                .add(() => { activeCardClone.classList.remove('is-morphed'); })
                .to({}, { duration: 0.4 })
                .to(activeCardClone, {
                    top: originalRect.top,
                    left: originalRect.left,
                    width: originalRect.width,
                    height: originalRect.height,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.10)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    duration: 0.5,
                    ease: 'power3.inOut'
                })
                .to(cloneContent, { opacity: 1, duration: 0.3, ease: 'power2.in' }, '-=0.2')
                .add(() => {
                    originalCard.style.visibility = '';
                    if (activeCardClone && activeCardClone.parentNode) activeCardClone.parentNode.removeChild(activeCardClone);
                    if (smoother) smoother.paused(false);
                    activeCardClone = null; originalCard = null;
                });
        };

        galleryClose.addEventListener('click', closeGallery);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && galleryModal.classList.contains('is-open')) closeGallery(); });
    }
}

document.addEventListener('DOMContentLoaded', () => { setTimeout(() => { new Preloader(); }, 100); });