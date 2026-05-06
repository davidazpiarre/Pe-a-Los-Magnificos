const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            name TEXT,
            role TEXT DEFAULT 'user'
        );

        CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            image TEXT,
            date TEXT,
            author_id INTEGER,
            FOREIGN KEY(author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year TEXT,
            title TEXT,
            image TEXT,
            date TEXT
        );

        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT,
            country TEXT,
            device TEXT,
            source TEXT,
            bounce INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            date TEXT,
            image TEXT,
            year TEXT,
            status TEXT DEFAULT 'upcoming'
        );

        CREATE TABLE IF NOT EXISTS collaborators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            image TEXT,
            link TEXT
        );
    `);

    // Migración: Asegurar que la columna 'status' existe
    try {
        await db.run("ALTER TABLE activities ADD COLUMN status TEXT DEFAULT 'upcoming'");
    } catch (e) {
        // La columna probablemente ya existe
    }

    // Inicializar configuración por defecto si no existe
    const podcast1 = await db.get('SELECT * FROM settings WHERE key = ?', ['podcast1_link']);
    if (!podcast1) {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['podcast1_link', 'https://youtube.com/@podcast1']);
    }
    const podcast2 = await db.get('SELECT * FROM settings WHERE key = ?', ['podcast2_link']);
    if (!podcast2) {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['podcast2_link', 'https://spotify.com/podcast2']);
    }
    const logo1 = await db.get('SELECT * FROM settings WHERE key = ?', ['podcast1_logo']);
    if (!logo1) {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['podcast1_logo', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&h=100&fit=crop']);
    }
    const logo2 = await db.get('SELECT * FROM settings WHERE key = ?', ['podcast2_logo']);
    if (!logo2) {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['podcast2_logo', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&h=100&fit=crop']);
    }

    // Crear un usuario de prueba si no hay ninguno
    const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', 
            ['admin', hashedPassword, 'Administrador', 'admin']);
        console.log('Usuario admin creado: admin / admin123');
    }

    // Sembrar algunos blogs iniciales si la tabla está vacía
    const blogCount = await db.get('SELECT COUNT(*) as count FROM blogs');
    if (blogCount.count === 0) {
        const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        await db.run('INSERT INTO blogs (title, content, image, date) VALUES (?, ?, ?, ?)', 
            ['Crónica de la última asamblea', 'Resumen de los puntos clave tratados en nuestra reunión trimestral.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600', '20 Abr, 2024']);
        await db.run('INSERT INTO blogs (title, content, image, date) VALUES (?, ?, ?, ?)', 
            ['Preparativos para el aniversario', 'Estamos organizando algo muy especial para celebrar nuestros 30 años.', 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=600', '12 Abr, 2024']);
    }

    return db;
}

module.exports = { setupDatabase };
