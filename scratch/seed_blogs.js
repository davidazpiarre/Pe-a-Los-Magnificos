const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function seedBlogs() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    const blogs = [
        {
            title: 'Tradición y Modernidad en Zaragoza',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            image: 'https://images.unsplash.com/photo-1543733330-026b42b15560?auto=format&fit=crop&q=80&w=600',
            date: '28 Abr, 2024'
        },
        {
            title: 'La Pasión por Nuestra Tierra',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=600',
            date: '25 Abr, 2024'
        }
    ];

    for (const blog of blogs) {
        await db.run('INSERT INTO blogs (title, content, image, date) VALUES (?, ?, ?, ?)', 
            [blog.title, blog.content, blog.image, blog.date]);
    }

    console.log('Successfully added 2 example blogs');
    await db.close();
}

seedBlogs().catch(console.error);
