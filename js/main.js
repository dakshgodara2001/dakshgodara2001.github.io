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
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== Mobile Navigation Toggle =====
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

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ===== Scroll Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            // Optional: stop observing after animation
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // About section
    const aboutText = document.querySelector('.about-text');
    const aboutImage = document.querySelector('.about-image');
    if (aboutText) observer.observe(aboutText);
    if (aboutImage) observer.observe(aboutImage);

    // Timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => observer.observe(item));

    // Project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => observer.observe(card));

    // Education cards
    const educationCard = document.querySelector('.education-card');
    const certificationsCard = document.querySelector('.certifications-card');
    if (educationCard) observer.observe(educationCard);
    if (certificationsCard) observer.observe(certificationsCard);

    // Achievement cards
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach(card => observer.observe(card));
});

// ===== Project Filtering =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCardsAll = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCardsAll.forEach(card => {
            const category = card.dataset.category;

            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                // Re-trigger animation
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

// ===== Back to Top Button =====
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
    }
});

// ===== Parallax Effect for Hero Background =====
const heroSection = document.querySelector('.hero');
const gridLines = document.querySelector('.grid-lines');

window.addEventListener('scroll', () => {
    if (heroSection && gridLines) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        gridLines.style.transform = `translate(${rate % 60}px, ${rate % 60}px)`;
    }
});

// ===== Stats Counter Animation =====
const stats = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;

    const heroRect = document.querySelector('.hero-stats')?.getBoundingClientRect();
    if (!heroRect) return;

    if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
        statsAnimated = true;

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

                    // Easing function (ease-out)
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentValue = endValue * easeOut;

                    // Format the number
                    if (endValue % 1 === 0) {
                        stat.textContent = prefix + Math.floor(currentValue) + suffix;
                    } else {
                        stat.textContent = prefix + currentValue.toFixed(1) + suffix;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = text; // Ensure exact final value
                    }
                }

                requestAnimationFrame(updateCounter);
            }
        });
    }
}

window.addEventListener('scroll', animateStats);
window.addEventListener('load', animateStats);

// ===== Skill Tag Hover Effect =====
const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== Card Tilt Effect (Desktop only) =====
if (window.innerWidth > 768) {
    const cards = document.querySelectorAll('.project-card, .achievement-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== Console Easter Egg =====
console.log('%c Welcome to my portfolio! ', 'background: #00d9ff; color: #0a0a0f; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Built with HTML, CSS, and JavaScript ', 'color: #8b5cf6; font-size: 12px;');
console.log('%c Feel free to connect: your.email@example.com ', 'color: #a1a1aa; font-size: 12px;');

// ===== Preloader (Optional) =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
