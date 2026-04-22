# Instrucciones del Proyecto: Peña Los Magníficos

Este documento detalla el diseño, la estructura y las guías de uso para la página web de la **Peña Los Magníficos** de Zaragoza.

## 1. Descripción del Proyecto
La web es una landing page frontend profesional y minimalista diseñada para representar la identidad de la peña. El objetivo es proporcionar información clara sobre la organización, sus actividades y fomentar la participación de nuevos socios.

## 2. Estructura de Archivos
- `index.html`: Estructura principal del sitio con contenido semántico.
- `style.css`: Estilos, variables de diseño y reglas responsive.
- `script.js`: Funcionalidad interactiva (menú, scroll, lightbox).
- `/images`: Carpeta destinada a las imágenes del proyecto (actualmente usa placeholders externos).

## 3. Guía de Diseño

### Paleta de Colores
- **Azul Principal (Zaragoza):** `#00459c`
- **Negro (Acentos):** `#1a1a1a`
- **Blanco (Fondo):** `#ffffff`
- **Gris Claro (Secciones):** `#f4f4f4`

### Tipografías
- **Principal:** `Inter` (Google Fonts). Es una fuente moderna, legible y profesional.
- **Iconos:** FontAwesome 6.4.0.

### Breakpoints (Responsive)
- **Desktop:** > 992px
- **Tablet:** 768px - 992px
- **Móvil:** < 768px (se activa el menú hamburguesa).

## 4. Secciones de la Web
1. **Header:** Navegación fija con efecto de desenfoque y cambio de tamaño al hacer scroll.
2. **Hero:** Sección de impacto visual con el nombre de la peña y un mensaje principal.
3. **Links Destacados:** 4 tarjetas con iconos para acciones rápidas (Eventos, Socios, Tienda, Ubicación).
4. **Nosotros:** Descripción histórica y valores de la peña.
5. **Actividades:** Cuadrícula de eventos con fecha y descripción breve.
6. **Galería:** Grid de imágenes con efecto hover y visualizador (Lightbox).
7. **Footer:** Información de contacto, redes sociales y copyright.

## 5. Cómo Personalizar

### Cambiar Textos
Busca el contenido dentro de las etiquetas HTML en `index.html`. 
Ejemplo: Para cambiar el nombre, busca `<h1>Peña Los Magníficos</h1>`.

### Cambiar Imágenes
- Sustituye las URLs en los atributos `src` de las etiquetas `<img>` por tus propios archivos locales guardados en la carpeta `/images`.
- **Hero:** Para cambiar la imagen de fondo principal, edita la propiedad `background` en la clase `.hero` dentro de `style.css`.

### Modificar los 4 Links Principales
En `index.html`, localiza la sección `<section class="quick-links">`. Cambia el atributo `href` de los botones por la dirección deseada.

### Añadir Contenido
- **Actividades:** Copia y pega un bloque de clase `activity-item` dentro de `activities-grid`.
- **Galería:** Añade un nuevo `div` con la clase `gallery-item` en `gallery-grid`.

## 6. Instalación y Uso Local

### Opción A: Servidor de Desarrollo (Recomendado)
Para una mejor experiencia con recarga automática (hot-reload):
1. Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta `npm install` (solo la primera vez).
4. Ejecuta `npm run dev`.
5. Abre la URL que aparecerá en la terminal (normalmente `http://localhost:5173`).

### Opción B: Apertura Directa
1. Abre el archivo `index.html` directamente en cualquier navegador moderno.

## 7. Consideraciones Técnicas
- **Rendimiento:** Se recomienda optimizar las imágenes (formato WebP o JPG comprimido) antes de subirlas.
- **Accesibilidad:** Se han utilizado etiquetas semánticas (`header`, `section`, `footer`) y atributos `alt` en imágenes.
- **Compatibilidad:** El código usa CSS Moderno (Flexbox/Grid), compatible con el 98% de los navegadores actuales.
