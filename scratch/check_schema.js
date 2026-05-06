const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkSchema() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    const info = await db.all("PRAGMA table_info(activities)");
    console.log(JSON.stringify(info, null, 2));
}

checkSchema().catch(console.error);
