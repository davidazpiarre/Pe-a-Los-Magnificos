const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkDb() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    console.log('--- Recientes en Galería ---');
    const gallery = await db.all('SELECT * FROM gallery ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(gallery, null, 2));

    console.log('--- Recientes en Actividades ---');
    const activities = await db.all('SELECT * FROM activities ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(activities, null, 2));
}

checkDb().catch(console.error);
