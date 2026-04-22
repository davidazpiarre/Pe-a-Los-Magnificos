const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'magnificos_secret_key_2026';

app.use(cors());
app.use(express.json());

let db;

// Inicializar DB y arrancar servidor
setupDatabase().then(database => {
    db = database;
    app.listen(PORT, () => {
        console.log(`Servidor de la Peña corriendo en http://localhost:${PORT}`);
    });
});

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

// Ejemplo de sección privada
app.get('/api/private/content', authenticateToken, (req, res) => {
    res.json({
        title: 'Contenido Exclusivo para Socios',
        content: 'Este es el calendario de las próximas cenas privadas y eventos internos.'
    });
});
