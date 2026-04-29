/**
 * script.js - Peña Los Magníficos
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Smooth Scroll (Lenis) ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with anchor links for smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -20, // Small offset for better positioning
                    duration: 1.5
                });
            }
        });
    });

    // --- Sidebar Toggle (Desktop & Mobile) ---
    const desktopToggle = document.getElementById('desktop-nav-toggle');
    const burgerMob = document.getElementById('burger-mob');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainSidebar = document.getElementById('main-sidebar');

    const toggleSidebar = () => {
        mainSidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    };

    if (desktopToggle) desktopToggle.addEventListener('click', toggleSidebar);
    if (burgerMob) burgerMob.addEventListener('click', toggleSidebar);

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            mainSidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            mainSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // --- Close Sidebar on Link Click ---
    const allSidebarLinks = document.querySelectorAll('.main-sidebar a');
    allSidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Don't close if it's a dropdown trigger
            if (link.classList.contains('dropdown-trigger')) return;
            
            mainSidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        });
    });

    // --- Sidebar Dropdowns ---
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const parent = trigger.parentElement;
            parent.classList.toggle('active');
        });
    });

    // --- Lightbox Gallery ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightboxImg.src = item.querySelector('img').src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    if (lightboxClose) {
        lightboxClose.onclick = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    // --- Active Link on Scroll ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // --- Login Modal & Auth ---
    const loginTriggers = document.querySelectorAll('#login-trigger');
    const loginModal = document.getElementById('login-modal');
    const modalClose = document.getElementById('modal-close');
    const loginForm = document.getElementById('login-form');
    const authContainerSidebar = document.getElementById('auth-container-sidebar');

    loginTriggers.forEach(trigger => {
        trigger.onclick = (e) => {
            e.preventDefault();
            loginModal.classList.add('active');
            if (mainSidebar) mainSidebar.classList.remove('active'); // Close sidebar on mobile after clicking login
        };
    });

    if (modalClose) {
        modalClose.onclick = () => loginModal.classList.remove('active');
    }

    const updateUI = (user) => {
        if (authContainerSidebar) {
            authContainerSidebar.innerHTML = `
                <div class="user-sidebar-info">
                    <div class="user-badge-sidebar">
                        <i class="fas fa-user-circle"></i>
                        <span>${user.name}</span>
                    </div>
                    <div class="sidebar-auth-actions">
                        ${user.role === 'admin' ? '<a href="dashboard.html" class="btn-dash-sidebar"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
                        <a href="#" class="btn-logout-sidebar" id="logout-btn-sidebar"><i class="fas fa-sign-out-alt"></i> Salir</a>
                    </div>
                </div>
            `;
            const logoutBtn = document.getElementById('logout-btn-sidebar');
            if (logoutBtn) {
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.clear();
                    window.location.reload();
                };
            }
        }
    };

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const username = e.target[0].value;
            const password = e.target[1].value;
            const msg = document.getElementById('login-message');

            try {
                const res = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('magnificos_token', data.token);
                    localStorage.setItem('magnificos_user', JSON.stringify(data.user));
                    window.location.reload();
                } else {
                    msg.innerText = data.message;
                    msg.className = 'error-msg';
                }
            } catch (err) {
                alert("Error de conexión con el servidor");
            }
        };
    }

    // Check Auth on load
    const savedUser = localStorage.getItem('magnificos_user');
    if (savedUser) updateUI(JSON.parse(savedUser));

    // --- Load Blogs (Homepage Only) ---
    const blogGrid = document.getElementById('blog-grid');
    const loadBlogs = async () => {
        if (!blogGrid) return;
        try {
            const res = await fetch('http://localhost:3000/api/blogs');
            const blogs = await res.json();
            if (blogs.length === 0) {
                blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 3rem;">No hay noticias todavía.</p>';
                return;
            }
            blogGrid.innerHTML = blogs.map(blog => `
                <article class="blog-card">
                    <div class="blog-img"><img src="${blog.image}" alt=""></div>
                    <div class="blog-info">
                        <span class="blog-date">${blog.date}</span>
                        <h3>${blog.title}</h3>
                        <p>${blog.content}</p>
                        <a href="#" class="blog-link">Leer más →</a>
                    </div>
                </article>
            `).join('');
        } catch (err) { console.error(err); }
    };

    loadBlogs();

    // --- Load Settings (Podcast Links) ---
    const loadSettings = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/settings?t=' + Date.now());
            const settings = await res.json();

            // Support both old header IDs and new home section IDs
            const updatePodcast = (prefix, linkId, imgId, titleId) => {
                const link = document.getElementById(linkId);
                const img = document.getElementById(imgId) || (link ? link.querySelector('img') : null);
                const title = document.getElementById(titleId);
                
                const linkVal = settings[`${prefix}_link`];
                const logoVal = settings[`${prefix}_logo`];
                const titleVal = settings[`${prefix}_title`];

                if (link && linkVal) link.href = linkVal;
                if (img && logoVal) {
                    const isBase64 = logoVal.startsWith('data:');
                    img.src = isBase64 ? logoVal : `${logoVal}${logoVal.includes('?') ? '&' : '?'}v=${Date.now()}`;
                }
                if (title && titleVal) title.innerText = titleVal;
            };

            // Update Header (if still exists)
            updatePodcast('podcast1', 'podcast-link-1');
            updatePodcast('podcast2', 'podcast-link-2');

            // Update Home Section
            updatePodcast('podcast1', 'home-podcast-link-1', 'home-podcast-img-1', 'home-podcast-title-1');
            updatePodcast('podcast2', 'home-podcast-link-2', 'home-podcast-img-2', 'home-podcast-title-2');

        } catch (err) {
            console.error("Error al cargar configuración:", err);
        }
    };

    loadSettings();

    // --- Live Event Countdown (Fiestas del Pilar 2025) ---
    const countdownEl = document.getElementById('event-countdown');
    if (countdownEl) {
        const targetDate = new Date('October 11, 2025 00:00:00').getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            countdownEl.innerText = `Fiestas del Pilar 2025: Faltan ${days}d ${hours}h ${minutes}m`;
        };
        
        setInterval(updateCountdown, 60000); // Update every minute
        updateCountdown();
    }

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    };

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Dynamic Timeline Line Growth ---
    const timeline = document.querySelector('.timeline');
    const timelineLine = document.getElementById('timeline-line');
    
    if (timeline && timelineLine) {
        window.addEventListener('scroll', () => {
            const timelineRect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how much of the timeline is visible
            if (timelineRect.top < windowHeight && timelineRect.bottom > 0) {
                const visibleHeight = windowHeight - timelineRect.top;
                const totalHeight = timelineRect.height;
                let progress = (visibleHeight / totalHeight) * 100;
                
                // Clamp progress between 0 and 100
                progress = Math.min(Math.max(progress, 0), 100);
                
                // Optional: delay or adjust progress for better feel
                // For a more fluid feel, we can use the center of the viewport
                const centerOffset = windowHeight / 2;
                const scrollProgress = ((centerOffset - timelineRect.top) / totalHeight) * 100;
                const finalProgress = Math.min(Math.max(scrollProgress, 0), 100);
                
                timelineLine.style.setProperty('--line-height', `${finalProgress}%`);
            }
        });
    }
});

// --- TRACKING ANALYTICS EN TIEMPO REAL ---
(function() {
    // Solo rastreamos en páginas públicas, no en el dashboard
    if(window.location.pathname.includes('dashboard')) return;

    const deviceMatch = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
    const deviceType = deviceMatch ? 'Móvil' : 'Desktop';
    const isSocial = document.referrer.includes('facebook') || document.referrer.includes('twitter') || document.referrer.includes('instagram');
    const source = isSocial ? 'Social' : (document.referrer ? 'Referido' : 'Directo');
    // Para simplificar, asignamos "España" pero un caso real usaría una API GeoIP
    const country = 'España'; 

    setTimeout(() => {
        // Enviar tracking después de 2 segundos (bounce falso si se va antes)
        fetch('http://localhost:3000/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: window.location.pathname === '/' || window.location.pathname === '' ? '/inicio' : window.location.pathname,
                country: country,
                device: deviceType,
                source: source,
                bounce: 0 // Si llegó hasta aquí, no es rebote
            })
        }).catch(err => console.log('Tracking no disponible en este entorno.'));
    }, 2000);
})();
