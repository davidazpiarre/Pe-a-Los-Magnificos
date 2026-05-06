const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function seedCollaborators() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    const mockCollaborators = [
        { name: 'Cervezas Ámbar', image: 'https://www.ambar.com/wp-content/uploads/2020/05/logo-ambar.png', link: 'https://www.ambar.com' },
        { name: 'Real Zaragoza', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Real_Zaragoza_logo.svg/1200px-Real_Zaragoza_logo.svg.png', link: 'https://www.realzaragoza.com' },
        { name: 'Ayuntamiento de Zaragoza', image: 'https://www.zaragoza.es/cont/paginas/centros/img/logoZgz.png', link: 'https://www.zaragoza.es' },
        { name: 'CaixaBank', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CaixaBank.svg/2560px-CaixaBank.svg.png', link: 'https://www.caixabank.es' },
        { name: 'Adidas', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/2560px-Adidas_Logo.svg.png', link: 'https://www.adidas.es' }
    ];

    for (const c of mockCollaborators) {
        await db.run('INSERT INTO collaborators (name, image, link) VALUES (?, ?, ?)', [c.name, c.image, c.link]);
    }

    console.log('5 Colaboradores añadidos correctamente.');
}

seedCollaborators().catch(console.error);
