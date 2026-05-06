const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'));

const newCollaborators = [
    ['Café del Centro', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', 'https://www.google.com'],
    ['Talleres Paco', 'https://images.unsplash.com/photo-1530046339160-ce3e5b097ea2?w=200', 'https://www.google.com'],
    ['Panadería Carmen', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', 'https://www.google.com'],
    ['Farmacia Central', 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200', 'https://www.google.com'],
    ['Restaurante El Pilar', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200', 'https://www.google.com']
];

db.serialize(() => {
    const stmt = db.prepare('INSERT INTO collaborators (name, image, link) VALUES (?, ?, ?)');
    newCollaborators.forEach(c => stmt.run(c));
    stmt.finalize();
    console.log('5 nuevos colaboradores añadidos.');
});

db.close();
