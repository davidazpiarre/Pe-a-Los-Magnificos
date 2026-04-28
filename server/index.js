const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'magnificos_secret_key_2026';

// 1. CORS: Configuración ultra-permisiva para evitar "Error de comunicación"
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. PARSERS: Límites ampliados al máximo para imágenes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let db;



// Middleware para verificar Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Acceso denegado' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

// Middleware para verificar Rol de Admin
const isAdmin = (req, res, next) => {
    console.log('Verificando rol de admin para:', req.user.username, 'Rol:', req.user.role);
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
    }
};

// --- RUTAS API ---

// BLOGS: Obtener todos (Público)
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await db.all('SELECT * FROM blogs ORDER BY id DESC');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error al leer la base de datos' });
    }
});

// BLOGS: Crear (Solo Admin)
app.post('/api/blogs', authenticateToken, isAdmin, async (req, res) => {
    const { title, content, image } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Título y contenido obligatorios' });

    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    try {
        const result = await db.run(
            'INSERT INTO blogs (title, content, image, date, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', date, req.user.id]
        );
        res.status(201).json({ id: result.lastID, message: '¡Blog guardado!' });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar en BD' });
    }
});

// BLOGS: Editar (Solo Admin)
app.put('/api/blogs/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, content, image } = req.body;
    try {
        await db.run('UPDATE blogs SET title=?, content=?, image=? WHERE id=?', [title, content, image, id]);
        res.json({ message: 'Actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

// BLOGS: Eliminar (Solo Admin)
app.delete('/api/blogs/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al borrar' });
    }
});

// SETTINGS: Obtener todas (Público)
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.all('SELECT * FROM settings');
        // Convertir array de objetos a un objeto clave-valor para facilitar el uso
        const config = {};
        settings.forEach(s => config[s.key] = s.value);
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error al leer configuración' });
    }
});

// SETTINGS: Actualizar (Solo Admin)
app.post('/api/settings', authenticateToken, isAdmin, async (req, res) => {
    console.log('--- INICIO PETICIÓN SETTINGS ---');
    const settings = Array.isArray(req.body) ? req.body : [req.body];
    console.log(`[Settings] Recibida actualización de ${settings.length} claves.`);

    try {
        for (const item of settings) {
            if (item && item.key) {
                console.log(`[Settings] Guardando: ${item.key}`);
                await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [item.key, item.value]);
            }
        }
        console.log('[Settings] ¡Éxito!');
        res.json({ message: 'Configuración actualizada' });
    } catch (error) {
        console.error('[Settings] Error crítico:', error);
        res.status(500).json({ message: 'Error interno: ' + error.message });
    }
});

// --- ANALYTICS API ---

app.post('/api/track', async (req, res) => {
    try {
        const { path, country, device, source, bounce } = req.body;
        await db.run(
            'INSERT INTO analytics (path, country, device, source, bounce) VALUES (?, ?, ?, ?, ?)',
            [path || '/', country || 'España', device || 'Desktop', source || 'Directo', bounce || 0]
        );
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Error tracking analytics:', err);
        res.status(500).json({ error: true });
    }
});

app.get('/api/analytics', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Obtenemos los totales
        const totalVisits = await db.get('SELECT COUNT(*) as count FROM analytics');
        
        // Tráfico por fuente
        const sources = await db.all('SELECT source, COUNT(*) as count FROM analytics GROUP BY source');
        
        // Países
        const countries = await db.all('SELECT country, COUNT(*) as count FROM analytics GROUP BY country ORDER BY count DESC LIMIT 4');
        
        // Top páginas
        const pages = await db.all(`
            SELECT path, 
                   COUNT(*) as visits, 
                   SUM(bounce) as bounces 
            FROM analytics 
            GROUP BY path 
            ORDER BY visits DESC 
            LIMIT 5
        `);

        // Dispositivos
        const devices = await db.all('SELECT device, COUNT(*) as count FROM analytics GROUP BY device');

        // Simulamos interacciones de los últimos 7 días con visitas reales sumadas a una base
        const last7DaysVisits = [120, 200, 150, Math.floor(Math.random()*100)+100, Math.floor(Math.random()*200)+200, Math.floor(Math.random()*300)+250, totalVisits.count];

        res.json({
            total: totalVisits.count,
            sources,
            countries,
            pages,
            devices,
            last7DaysVisits
        });
    } catch (err) {
        res.status(500).json({ error: true });
    }
});

// --- GALERÍA API ---

// Obtener fotos (Público)
app.get('/api/gallery', async (req, res) => {
    const { year } = req.query;
    try {
        let query = 'SELECT * FROM gallery';
        let params = [];
        if (year) {
            query += ' WHERE year = ?';
            params.push(year);
        }
        query += ' ORDER BY id DESC';
        const items = await db.all(query, params);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error al leer galería' });
    }
});

// Añadir foto (Solo Admin)
app.post('/api/gallery', authenticateToken, isAdmin, async (req, res) => {
    const { year, title, image } = req.body;
    if (!year || !image) return res.status(400).json({ message: 'Año e imagen obligatorios' });

    try {
        const date = new Date().toLocaleDateString('es-ES');
        await db.run('INSERT INTO gallery (year, title, image, date) VALUES (?, ?, ?, ?)', [year, title || '', image, date]);
        res.status(201).json({ message: 'Imagen añadida a la galería' });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar imagen' });
    }
});

// Eliminar foto (Solo Admin)
app.delete('/api/gallery/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM gallery WHERE id = ?', [req.params.id]);
        res.json({ message: 'Imagen eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al borrar' });
    }
});

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener datos del usuario identificado (Protegida)
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, username, name, role FROM users WHERE id = ?', [req.user.id]);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos' });
    }
});

// 3. MANEJADOR DE ERRORES GLOBAL (Siempre JSON)
app.use((err, req, res, next) => {
    console.error('[Critical Error]', err);
    res.status(err.status || 500).json({
        message: 'Error de servidor: ' + (err.message || 'Desconocido')
    });
});

// Inicializar DB y arrancar servidor
setupDatabase().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Servidor de la Peña corriendo en http://localhost:${PORT}`);
        console.log('Base de datos inicializada y lista.');
    });
});
