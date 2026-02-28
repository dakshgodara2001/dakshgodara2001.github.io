// ===== Typing Animation =====
const typingText = document.getElementById('typing-text');
const name = 'Daksh Godara';
let charIndex = 0;

function typeWriter() {
    if (charIndex < name.length) {
        typingText.textContent += name.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 100);
    }
}

// Start typing animation after page load
window.addEventListener('load', () => {
    setTimeout(typeWriter, 500);
    document.body.classList.add('loaded');
});

// ===== Mobile Navigation Toggle =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Consolidated Scroll Handler (single listener, rAF-throttled) =====
const sections = document.querySelectorAll('section[id]');
const heroSection = document.querySelector('.hero');
const gridLines = document.querySelector('.grid-lines');
const backToTop = document.getElementById('back-to-top');
let scrollTicking = false;

function onScroll() {
    const scrollY = window.pageYOffset;

    // Navbar background
    navbar.classList.toggle('scrolled', scrollY > 50);

    // Active nav link
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            navLink.classList.add('active');
            navLink.setAttribute('aria-current', 'page');
        }
    });

    // Back to top visibility
    if (backToTop) {
        const show = scrollY > 500;
        backToTop.style.opacity = show ? '1' : '0';
        backToTop.style.visibility = show ? 'visible' : 'hidden';
    }

    // Parallax grid (only while hero is in view)
    if (heroSection && gridLines && scrollY < heroSection.offsetHeight) {
        const rate = scrollY * 0.3;
        gridLines.style.transform = `translate(${rate % 60}px, ${rate % 60}px)`;
    }

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(onScroll);
        scrollTicking = true;
    }
}, { passive: true });

// ===== Intersection Observer for Scroll Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// ===== Stats Counter via IntersectionObserver =====
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const text = stat.textContent;
        const match = text.match(/^([^\d]*)([\d.]+)(.*)$/);

        if (match) {
            const prefix = match[1];
            const endValue = parseFloat(match[2]);
            const suffix = match[3];
            const duration = 2500;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = endValue * easeOut;

                if (endValue % 1 === 0) {
                    stat.textContent = prefix + Math.floor(currentValue) + suffix;
                } else {
                    stat.textContent = prefix + currentValue.toFixed(1) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = text;
                }
            }

            requestAnimationFrame(updateCounter);
        }
    });
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

// ===== DOMContentLoaded: Register all observers =====
document.addEventListener('DOMContentLoaded', () => {
    // About section
    const aboutText = document.querySelector('.about-text');
    const aboutImage = document.querySelector('.about-image');
    if (aboutText) observer.observe(aboutText);
    if (aboutImage) observer.observe(aboutImage);

    // Timeline items
    document.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));

    // Project cards
    document.querySelectorAll('.project-card').forEach(card => observer.observe(card));

    // Education cards
    const educationCard = document.querySelector('.education-card');
    const certificationsCard = document.querySelector('.certifications-card');
    if (educationCard) observer.observe(educationCard);
    if (certificationsCard) observer.observe(certificationsCard);

    // Achievement cards
    document.querySelectorAll('.achievement-card').forEach(card => observer.observe(card));

    // Stats counter
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);
});

// ===== Project Filtering =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCardsAll = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCardsAll.forEach(card => {
            const category = card.dataset.category;

            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                card.classList.remove('animate');
                setTimeout(() => card.classList.add('animate'), 10);
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Skill Tag Hover Effect (CSS-only via transform in stylesheet is better, but keeping JS for consistency) =====
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== Card Tilt Effect (Desktop only, with will-change hint) =====
if (window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768) {
    const cards = document.querySelectorAll('.project-card, .achievement-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.willChange = 'transform';
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateX = (y - rect.height / 2) / 20;
            const rotateY = (rect.width / 2 - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.willChange = 'auto';
        });
    });
}

// ===== Console Easter Egg =====
console.log('%c Welcome to my portfolio! ', 'background: #00d9ff; color: #0a0a0f; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Built with HTML, CSS, and JavaScript ', 'color: #8b5cf6; font-size: 12px;');
console.log('%c Feel free to connect: dakshgodara2001@gmail.com ', 'color: #a1a1aa; font-size: 12px;');
