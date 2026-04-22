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
});
