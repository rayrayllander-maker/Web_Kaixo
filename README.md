# Bar Kaixo - Página Web de Menú

Una página web moderna y responsiva para el menú del restaurante Bar Kaixo, implementada con HTML5 semántico, CSS moderno y JavaScript vanilla ES6.

## 🚀 Instalación y Ejecución Local

### Requisitos Previos
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Servidor web local (opcional pero recomendado)

### Pasos para Ejecutar

1. **Descargar el proyecto**
   ```bash
   # Si tienes git instalado
   git clone [URL_DEL_REPOSITORIO]
   cd bar-kaixo
   ```

2. **Opción A: Abrir directamente**
   - Abre el archivo `index.html` en tu navegador
   - **Nota**: Algunas funcionalidades pueden no funcionar correctamente debido a políticas CORS

3. **Opción B: Servidor local (Recomendado)**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (si tienes npx)
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```
   Luego visita: `http://localhost:8000`

4. **Opción C: Live Server (VS Code)**
   - Instala la extensión "Live Server" en VS Code
   - Click derecho en `index.html` → "Open with Live Server"

## 📁 Estructura del Proyecto

```
bar-kaixo/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── scripts.js          # JavaScript interactivo
├── README.md           # Este archivo
└── assets/             # Recursos multimedia
    ├── logo.png        # Logo oficial del restaurante (150x150, transparente)
    ├── hero.jpg        # Imagen hero (1920x600)
    ├── card1.jpg       # Imagen platos variados (800x600)
    ├── card2.jpg       # Imagen especialidades (800x600)
    ├── card3.jpg       # Imagen carnes y parrilla (800x600)
    ├── carta_p1.jpeg   # Primera página de la carta real
    └── carta_p2.jpeg   # Segunda página de la carta real
```

## 🎨 Assets Requeridos

### Imágenes Principales

| Archivo | Dimensiones | Descripción | Formato Recomendado |
|---------|-------------|-------------|---------------------|
| `hero.jpg` | 1920×600px | Imagen de ambiente del restaurante | JPG/WebP (opt) |
| `card1.jpg` | 800×600px | Pintxos variados | JPG/WebP (opt) |
| `card2.jpg` | 800×600px | Bacalao al pil pil | JPG/WebP (opt) |
| `card3.jpg` | 800×600px | Txuleta de buey | JPG/WebP (opt) |
| `logo.png` | 150×150px | Logo del restaurante | PNG (transparente) |

### Especificaciones de Export

- **Hero**: 1920×600px, calidad 85%, optimizada para web
- **Cards**: 800×600px, ratio 4:3, calidad 80%
- **Versiones @2x**: Opcional para pantallas retina
- **WebP**: Formato alternativo recomendado para mejor compresión
- **Alt text**: Todos los assets incluyen texto alternativo para accesibilidad

### Assets Placeholder Incluidos

El proyecto incluye assets placeholder SVG que simulan:
- Logo corporativo en estilo vasco
- Ambiente tradicional de restaurante vasco
- Platos típicos de la cocina vasca

## ✅ Checklist de QA

### Contraste y Accesibilidad
- [x] Contraste WCAG AA cumplido (4.5:1 mínimo)
- [x] Todos los elementos interactivos tienen estados de foco visibles
- [x] Navegación por teclado implementada en pills y modal
- [x] Lectores de pantalla soportados (ARIA labels, roles, states)
- [x] Texto alternativo en todas las imágenes

### Navegación por Teclado
- [x] **Tab**: Navegación secuencial por elementos interactivos
- [x] **Flechas**: Navegación entre pills de categorías
- [x] **Enter/Espacio**: Activación de pills y botones
- [x] **Escape**: Cierre del modal de reserva
- [x] **Home/End**: Navegación rápida en pills

### Responsive Design
- [x] **Desktop** (≥1200px): Grid 3 columnas, navbar horizontal
- [x] **Tablet** (700-1099px): Grid 2 columnas, pills adaptadas
- [x] **Mobile** (<700px): Grid 1 columna, navbar stack
- [x] Hero adapta altura: 420px desktop → 260px mobile
- [x] Formulario responsive con campos apilados en mobile

### Funcionalidad
- [x] Filtrado por categorías con animaciones suaves
- [x] Modal de reserva con validación completa
- [x] Efectos hover en cards (translateY + box-shadow)
- [x] Badge "Popular" posicionado correctamente
- [x] Smooth scrolling en navegación

### Performance
- [x] Lazy loading en imágenes
- [x] Transiciones CSS optimizadas
- [x] JavaScript modular y eficiente
- [x] CSS variables para consistencia
- [x] Preconnect a Google Fonts

## 🔧 Características Técnicas

### Tecnologías Utilizadas
- **HTML5 Semántico**: Estructura accesible y SEO-friendly
- **CSS Moderno**: Variables, Grid, Flexbox, custom properties
- **JavaScript ES6**: Módulos, clases, arrow functions
- **Google Fonts**: Poppins como tipografía principal

### Paleta de Colores
```css
--bg-light: #ffc9b9      /* Rosa salmón claro para fondos */
--cta-red: #BF0603       /* Rojo intenso para CTAs */
--text-dark: #292929     /* Gris oscuro para texto principal */
--green-light: #9cde9f   /* Verde claro para fondos secundarios */
--green: #04773b         /* Verde oscuro para acentos */
--badge-yellow: #f2c94c  /* Amarillo para badges populares */
```

### Breakpoints Responsive
- **1200px+**: Desktop grande (3 columnas)
- **1100-1199px**: Desktop (3 columnas)
- **900-1099px**: Tablet grande (2 columnas)
- **700-899px**: Tablet (2 columnas)
- **480-699px**: Mobile grande (1 columna)
- **<480px**: Mobile pequeño (layout ajustado)

## 🚀 Plan de Producción

### Optimización Pre-Deploy

1. **Imágenes**
   ```bash
   # Comprimir imágenes
   imagemin assets/*.jpg --out-dir=assets/optimized/
   
   # Generar WebP
   cwebp assets/hero.jpg -q 85 -o assets/hero.webp
   ```

2. **CSS/JS Minificación**
   ```bash
   # CSS
   cleancss -o styles.min.css styles.css
   
   # JavaScript
   uglifyjs scripts.js -o scripts.min.js
   ```

3. **Auditoría de Performance**
   - Lighthouse score objetivo: >90 en todas las métricas
   - Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

### Hosting Recomendado

**Opción A: Hosting Estático (Recomendado)**
- Netlify, Vercel, GitHub Pages
- Deploy automático desde Git
- CDN global incluido
- HTTPS automático

**Opción B: Hosting Tradicional**
- Cualquier servidor web con soporte HTML/CSS/JS
- Configurar compresión gzip
- Configurar caché headers para assets

### Configuración Adicional

```nginx
# Nginx - Headers de caché
location ~* \.(css|js|jpg|jpeg|png|gif|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Compresión
gzip on;
gzip_types text/css text/javascript application/javascript;
```

## 📝 Notas de Implementación

### Sustituciones Realizadas

1. **Assets Placeholder**: Se generaron assets SVG placeholder que simulan el contenido real
2. **Fonts Loading**: Implementado preconnect para Google Fonts
3. **Lazy Loading**: Usado loading="lazy" nativo + Intersection Observer fallback

### Testing Manual - Verificación Visual

Para verificar la "coincidencia" con el diseño objetivo:

1. **Hero Section**: ✅ Imagen full-width con overlay verdoso y logo centrado
2. **Logo Posición**: ✅ Centrado sobre el título principal
3. **Navegación**: ✅ Links centrados, CTA rojo alineado a la derecha
4. **Pills Activas**: ✅ Fondo blanco con outline verde y sombra sutil
5. **Badge Popular**: ✅ Amarillo en esquina superior derecha de imagen
6. **Espaciado Cards**: ✅ Gap uniforme de 28px entre elementos
7. **Hover Effect**: ✅ TranslateY(-6px) con sombra mejorada
8. **Mobile Responsive**: ✅ Grid adapta de 3→2→1 columnas según viewport

### Navegadores Soportados

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

### Librerías Utilizadas

**Ninguna librería externa** - El proyecto usa únicamente:
- HTML5 nativo
- CSS moderno (sin preprocesadores)
- JavaScript vanilla ES6
- Google Fonts (CDN)

### Próximos Pasos Opcionales

1. **PWA**: Añadir Service Worker para funcionalidad offline
2. **i18n**: Soporte multiidioma (euskera/castellano)
3. **CMS**: Integración con headless CMS para gestión de contenido
4. **Analytics**: Google Analytics o alternativa para métricas
5. **SEO**: Schema markup para datos estructurados

---

**Desarrollado con ❤️ para Bar Kaixo**  
Versión: 1.0.0 | Fecha: Octubre 2025