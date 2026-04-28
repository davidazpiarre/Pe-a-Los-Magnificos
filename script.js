/**
 * script.js - Peña Los Magníficos
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header Scroll ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // --- Mobile Menu Toggle ---
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            links.forEach((link, index) => {
                link.style.animation = link.style.animation ? '' : `fadeInUp 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
            burger.classList.toggle('toggle');
        });
    }

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

    // --- Login Modal & Auth ---
    const loginTrigger = document.getElementById('login-trigger');
    const loginModal = document.getElementById('login-modal');
    const modalClose = document.getElementById('modal-close');
    const loginForm = document.getElementById('login-form');
    const authContainer = document.getElementById('auth-container');

    if (loginTrigger) {
        loginTrigger.onclick = (e) => {
            e.preventDefault();
            loginModal.classList.add('active');
        };
    }

    if (modalClose) {
        modalClose.onclick = () => loginModal.classList.remove('active');
    }

    const updateUI = (user) => {
        if (authContainer) {
            authContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${user.role === 'admin' ? '<a href="dashboard.html" class="btn-dash-header">Dashboard</a>' : ''}
                    <div class="user-badge">
                        <i class="fas fa-user-circle"></i>
                        <span>${user.name}</span>
                        <a href="#" class="btn-logout" id="logout-btn" title="Cerrar Sesión">Salir</a>
                    </div>
                </div>
            `;
            document.getElementById('logout-btn').onclick = (e) => {
                e.preventDefault();
                localStorage.clear();
                window.location.reload();
            };
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

            const p1 = document.getElementById('podcast-link-1');
            const p2 = document.getElementById('podcast-link-2');

            if (p1) {
                if (settings.podcast1_link) p1.href = settings.podcast1_link;
                if (settings.podcast1_logo) {
                    const img = p1.querySelector('img');
                    if (img) {
                        const isBase64 = settings.podcast1_logo.startsWith('data:');
                        img.src = isBase64 ? settings.podcast1_logo : `${settings.podcast1_logo}${settings.podcast1_logo.includes('?') ? '&' : '?'}v=${Date.now()}`;
                    }
                }
            }
            if (p2) {
                if (settings.podcast2_link) p2.href = settings.podcast2_link;
                if (settings.podcast2_logo) {
                    const img = p2.querySelector('img');
                    if (img) {
                        const isBase64 = settings.podcast2_logo.startsWith('data:');
                        img.src = isBase64 ? settings.podcast2_logo : `${settings.podcast2_logo}${settings.podcast2_logo.includes('?') ? '&' : '?'}v=${Date.now()}`;
                    }
                }
            }
        } catch (err) {
            console.error("Error al cargar configuración:", err);
        }
    };

    loadSettings();

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
