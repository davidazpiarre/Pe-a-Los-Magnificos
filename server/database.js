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
    `);

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
