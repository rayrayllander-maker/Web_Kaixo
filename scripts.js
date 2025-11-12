/**
 * BAR KAIXO - SCRIPT PRINCIPAL
 * Gestión de interactividad: filtrado de menú, modal de reserva, navegación por teclado
 * Versión: 1.0.0
 */

(function() {
    'use strict';

    // ===== CONFIGURACIÓN Y CONSTANTES =====
    const CONFIG = {
        ANIMATION_DURATION: 400,
        DEBOUNCE_DELAY: 300,
        MOBILE_BREAKPOINT: 768,
        FADE_CLASS: 'fade-in',
        HIDDEN_CLASS: 'hidden',
        ACTIVE_CLASS: 'active',
        ERROR_CLASS: 'error'
    };

    // ===== ELEMENTOS DEL DOM =====
    const elements = {
        // Navegación y filtros
        categoryPills: document.querySelectorAll('.pill'),
        menuCards: document.querySelectorAll('.menu-card'),
        menuGrid: document.getElementById('menu-content'),
        
        // Modal y formulario
        modal: document.getElementById('reserva-modal'),
        modalTrigger: document.querySelector('.cta-button'),
        modalClose: document.querySelector('.modal-close'),
        reservationForm: document.getElementById('reservation-form'),
        cancelButton: document.getElementById('cancel-reservation'),
        
        // Campos del formulario
        nameField: document.getElementById('name'),
        dateField: document.getElementById('date'),
        timeField: document.getElementById('time'),
        guestsField: document.getElementById('guests'),
        phoneField: document.getElementById('phone'),
        notesField: document.getElementById('notes'),
        
        // Tema oscuro
        themeToggle: document.getElementById('theme-toggle')
    };

    // ===== GESTIÓN DE TEMA OSCURO =====
    class ThemeManager {
        constructor() {
            this.init();
        }

        init() {
            // Cargar preferencia guardada o usar preferencia del sistema
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
            
            this.setTheme(initialTheme);
            this.bindEvents();
        }

        bindEvents() {
            elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
            
            // Escuchar cambios en la preferencia del sistema
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }

        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            
            // Anunciar cambio para accesibilidad
            this.announceThemeChange(newTheme);
        }

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Actualizar aria-label del botón
            if (elements.themeToggle) {
                const label = theme === 'dark' 
                    ? 'Cambiar a modo claro' 
                    : 'Cambiar a modo oscuro';
                elements.themeToggle.setAttribute('aria-label', label);
                elements.themeToggle.setAttribute('title', label);
            }
        }

        announceThemeChange(theme) {
            const message = theme === 'dark' 
                ? 'Modo oscuro activado' 
                : 'Modo claro activado';
            
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.textContent = message;
            
            document.body.appendChild(announcer);
            setTimeout(() => document.body.removeChild(announcer), 1000);
        }
    }

    // ===== GESTIÓN DE FILTROS DE CATEGORÍAS =====
    class CategoryFilter {
        constructor() {
            this.currentCategory = 'all';
            this.isAnimating = false;
            this.init();
        }

        init() {
            this.bindEvents();
            this.setupKeyboardNavigation();
            // Asegurar que todo está visible al iniciar (sin filtrado)
            this.resetVisibility();
            // Debounce para evitar múltiples activaciones rápidas al hacer clic (más ágil)
            this.debouncedSelect = Utils.debounce((pill) => this.selectPill(pill), 80);
        }

        bindEvents() {
            elements.categoryPills.forEach(pill => {
                pill.addEventListener('click', (e) => this.handlePillClick(e));
            });
        }

        setupKeyboardNavigation() {
            elements.categoryPills.forEach((pill, index) => {
                pill.addEventListener('keydown', (e) => {
                    this.handleKeyNavigation(e, index);
                });
            });
        }

        handleKeyNavigation(event, currentIndex) {
            const { key } = event;
            let targetIndex = currentIndex;

            switch (key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    targetIndex = (currentIndex + 1) % elements.categoryPills.length;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    targetIndex = currentIndex === 0 ? elements.categoryPills.length - 1 : currentIndex - 1;
                    break;
                case 'Home':
                    event.preventDefault();
                    targetIndex = 0;
                    break;
                case 'End':
                    event.preventDefault();
                    targetIndex = elements.categoryPills.length - 1;
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (this.isAnimating) return;
                    this.selectPill(elements.categoryPills[currentIndex]);
                    return;
                default:
                    return;
            }

            this.focusPill(targetIndex);
        }

        focusPill(index) {
            // Actualizar tabindex
            elements.categoryPills.forEach((pill, i) => {
                pill.tabIndex = i === index ? 0 : -1;
            });
            
            elements.categoryPills[index].focus();
        }

        handlePillClick(event) {
            event.preventDefault();
            if (this.isAnimating) return;
            // Usar currentTarget para que funcione al pulsar icono o texto dentro del botón
            this.debouncedSelect(event.currentTarget);
        }

        selectPill(pill) {
            if (this.isAnimating) return; // guard adicional por seguridad
            this.isAnimating = true;

            const category = pill.dataset.category;
            this.updateActiveState(pill);
            this.currentCategory = category;

            // Nos aseguramos de que no haya ocultaciones previas
            this.resetVisibility();

            // Anuncio accesible y desplazamiento suave hacia la categoría
            this.announceFilterChange(category);
            // Iniciar scroll; el fin de animación liberará isAnimating
            this.scrollToCategory(category);
        }

        updateActiveState(activePill) {
            elements.categoryPills.forEach(pill => {
                const isActive = pill === activePill;
                pill.classList.toggle(CONFIG.ACTIVE_CLASS, isActive);
                pill.setAttribute('aria-selected', isActive);
                pill.tabIndex = isActive ? 0 : -1;
            });
        }

        // El nuevo comportamiento no filtra: mantiene todo visible
        // Método conservado por compatibilidad, ahora solo asegura visibilidad
        filterCards(category) {
            this.resetVisibility();
        }

        announceFilterChange(category) {
            const categoryNames = {
                'all': 'Todos los platos',
                'entrantes-raciones': 'Entrantes / Raciones',
                'ensaladas': 'Ensaladas',
                'burritos-wraps': 'Burritos y Wraps',
                'sandwich': 'Sándwich',
                'hamburguesas': 'Hamburguesas',
                'bocadillos': 'Bocadillos',
                'platos-combinados': 'Platos Combinados',
                'brasil': 'Platos Brasileños'
            };

            const announcement = category === 'all'
                ? 'Desplazando al inicio del menú'
                : `Desplazando a la categoría ${categoryNames[category] || category}`;
            
            // Crear elemento temporal para anuncio
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.textContent = announcement;
            
            document.body.appendChild(announcer);
            setTimeout(() => document.body.removeChild(announcer), 1000);
        }

        // Desplaza suavemente al encabezado de la categoría seleccionada (o al inicio del grid)
        scrollToCategory(category) {
            const grid = elements.menuGrid;
            if (!grid) return;

            let target;
            if (category === 'all') {
                target = grid;
            } else {
                target = document.querySelector(`.menu-category[data-category="${category}"]`) 
                      || grid.querySelector(`.menu-card[data-category="${category}"]`) 
                      || grid;
            }

            const navbar = document.querySelector('.navbar');
            const pills = document.querySelector('.category-pills-container');

            // Predicción de offset (funciona bien en el primer clic)
            const navH = navbar ? navbar.offsetHeight : 0;
            const pillsH = pills ? pills.offsetHeight : 0;
            const expectedOffset = navH + pillsH; // sin margen extra

            // Efecto de realce temporal en el separador de categoría
            const categoryHeader = target?.classList?.contains('menu-category') ? target : null;
            if (categoryHeader) {
                // Limpiar realces previos
                document.querySelectorAll('.menu-category.is-highlighted').forEach(el => el.classList.remove('is-highlighted'));
                // Aplicar y retirar tras un tiempo
                categoryHeader.classList.add('is-highlighted');
                setTimeout(() => categoryHeader.classList.remove('is-highlighted'), 1200);
            }

            // Calcular posición absoluta del objetivo (usando el título h3 si existe)
            const anchorEl = (target && target.classList && target.classList.contains('menu-category'))
                ? (target.querySelector('h3') || target)
                : target;
            const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Generadores de offset dinámico y destino (evitan atascos cuando las pills cambian de estado)
            const getOffset = () => Math.max(
                navbar ? navbar.getBoundingClientRect().bottom : 0,
                pills ? pills.getBoundingClientRect().bottom : 0
            );
            const getTargetY = () => (anchorEl.getBoundingClientRect().top + window.scrollY) - getOffset();

            if (prefersReduced) {
                window.scrollTo({ top: Math.max(0, getTargetY()), behavior: 'auto' });
                this.isAnimating = false;
                return;
            }

            // Cancelar animación previa si existía
            if (this._cancelScroll) {
                this._cancelScroll();
                this._cancelScroll = null;
            }

            // Duración proporcional a la distancia para suavidad sin tirones
            const initialTarget = Math.max(0, getTargetY());
            const distance = Math.abs(window.scrollY - initialTarget);
            // Si la distancia es pequeña, salto instantáneo
            if (distance < 120) {
                window.scrollTo({ top: initialTarget, behavior: 'auto' });
                this.isAnimating = false;
                return;
            }
            const duration = Math.min(480, Math.max(180, distance * 0.24));

            this._cancelScroll = Utils.animateScrollTo(getTargetY, duration, () => {
                this._cancelScroll = null;
                this.isAnimating = false;
            });
        }

        // Quita cualquier ocultación/estilo transitorio y muestra todo
        resetVisibility() {
            elements.menuCards.forEach(card => {
                card.classList.remove(CONFIG.HIDDEN_CLASS);
                card.style.opacity = '';
                card.style.transform = '';
            });

            document.querySelectorAll('.menu-category').forEach(sep => {
                sep.style.display = '';
            });
        }
    }

    // ===== GESTIÓN DEL MODAL DE RESERVA =====
    class ReservationModal {
        constructor() {
            this.isOpen = false;
            this.focusableElements = [];
            this.firstFocusableElement = null;
            this.lastFocusableElement = null;
            this.init();
        }

        init() {
            this.bindEvents();
            this.setupFormValidation();
            this.setMinDate();
        }

        bindEvents() {
            // Abrir modal
            elements.modalTrigger?.addEventListener('click', () => this.open());
            
            // Cerrar modal
            elements.modalClose?.addEventListener('click', () => this.close());
            elements.cancelButton?.addEventListener('click', () => this.close());
            
            // Cerrar con Escape o click en overlay
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            elements.modal?.addEventListener('click', (e) => {
                if (e.target === elements.modal) {
                    this.close();
                }
            });

            // Envío del formulario
            elements.reservationForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        setupFormValidation() {
            const fields = [elements.nameField, elements.dateField, elements.timeField, 
                          elements.guestsField, elements.phoneField];
            
            fields.forEach(field => {
                if (field) {
                    field.addEventListener('blur', () => this.validateField(field));
                    field.addEventListener('input', () => this.clearError(field));
                }
            });
        }

        setMinDate() {
            if (elements.dateField) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                elements.dateField.min = tomorrow.toISOString().split('T')[0];
            }
        }

        open() {
            this.isOpen = true;
            elements.modal.classList.add(CONFIG.ACTIVE_CLASS);
            elements.modal.setAttribute('aria-hidden', 'false');
            
            // Configurar foco
            this.setupFocusManagement();
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            // Foco inicial en el primer campo
            setTimeout(() => {
                if (this.firstFocusableElement) {
                    this.firstFocusableElement.focus();
                }
            }, 100);

            // Anunciar apertura
            this.announceModalState('Formulario de reserva abierto');
        }

        close() {
            this.isOpen = false;
            elements.modal.classList.remove(CONFIG.ACTIVE_CLASS);
            elements.modal.setAttribute('aria-hidden', 'true');
            
            // Restaurar scroll
            document.body.style.overflow = '';
            
            // Devolver foco al botón trigger
            if (elements.modalTrigger) {
                elements.modalTrigger.focus();
            }

            // Limpiar formulario
            this.resetForm();
            
            // Anunciar cierre
            this.announceModalState('Formulario de reserva cerrado');
        }

        setupFocusManagement() {
            const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            this.focusableElements = Array.from(elements.modal.querySelectorAll(focusableSelector))
                .filter(el => !el.disabled && el.offsetParent !== null);
            
            this.firstFocusableElement = this.focusableElements[0];
            this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];

            // Trap focus
            elements.modal.addEventListener('keydown', (e) => this.handleFocusTrap(e));
        }

        handleFocusTrap(event) {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === this.firstFocusableElement) {
                    event.preventDefault();
                    this.lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === this.lastFocusableElement) {
                    event.preventDefault();
                    this.firstFocusableElement.focus();
                }
            }
        }

        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            switch (field.id) {
                case 'name':
                    if (!value) {
                        errorMessage = 'El nombre es obligatorio';
                        isValid = false;
                    } else if (value.length < 2) {
                        errorMessage = 'El nombre debe tener al menos 2 caracteres';
                        isValid = false;
                    }
                    break;

                case 'date':
                    if (!value) {
                        errorMessage = 'La fecha es obligatoria';
                        isValid = false;
                    } else {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (selectedDate <= today) {
                            errorMessage = 'La fecha debe ser posterior a hoy';
                            isValid = false;
                        }
                    }
                    break;

                case 'time':
                    if (!value) {
                        errorMessage = 'La hora es obligatoria';
                        isValid = false;
                    }
                    break;

                case 'guests':
                    if (!value) {
                        errorMessage = 'El número de personas es obligatorio';
                        isValid = false;
                    }
                    break;

                case 'phone':
                    if (!value) {
                        errorMessage = 'El teléfono es obligatorio';
                        isValid = false;
                    } else if (!/^[6-9]\d{8}$/.test(value.replace(/\s/g, ''))) {
                        errorMessage = 'Introduce un teléfono válido (ej: 600123456)';
                        isValid = false;
                    }
                    break;
            }

            this.showFieldError(field, errorMessage);
            return isValid;
        }

        showFieldError(field, message) {
            const errorElement = document.getElementById(`${field.id}-error`);
            
            if (message) {
                field.classList.add(CONFIG.ERROR_CLASS);
                field.setAttribute('aria-invalid', 'true');
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.setAttribute('aria-live', 'polite');
                }
            } else {
                field.classList.remove(CONFIG.ERROR_CLASS);
                field.setAttribute('aria-invalid', 'false');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        }

        clearError(field) {
            this.showFieldError(field, '');
        }

        handleSubmit(event) {
            event.preventDefault();
            
            // Validar todos los campos requeridos
            const requiredFields = [elements.nameField, elements.dateField, elements.timeField, 
                                  elements.guestsField, elements.phoneField];
            
            let isFormValid = true;
            requiredFields.forEach(field => {
                if (field && !this.validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                // Foco en el primer campo con error
                const firstError = elements.modal.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            // Simular envío de formulario
            this.submitReservation();
        }

        submitReservation() {
            const formData = new FormData(elements.reservationForm);
            const reservationData = Object.fromEntries(formData.entries());
            
            // Mostrar indicador de carga
            const submitButton = elements.reservationForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;

            // Simular llamada a API (en producción aquí iría la llamada real)
            setTimeout(() => {
                console.log('Datos de reserva:', reservationData);
                
                // Mostrar mensaje de éxito
                this.showSuccessMessage();
                
                // Restaurar botón
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Cerrar modal después de un momento
                setTimeout(() => this.close(), 2000);
            }, 1500);
        }

        showSuccessMessage() {
            const successDiv = document.createElement('div');
            successDiv.innerHTML = `
                <div style="background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
                    <strong>¡Reserva confirmada!</strong><br>
                    Recibirás un email de confirmación en breve.
                </div>
            `;
            
            const formContent = elements.reservationForm;
            formContent.insertBefore(successDiv.firstElementChild, formContent.firstChild);
        }

        resetForm() {
            elements.reservationForm?.reset();
            
            // Limpiar errores
            const errorElements = elements.modal.querySelectorAll('.error-message');
            errorElements.forEach(el => el.textContent = '');
            
            const errorFields = elements.modal.querySelectorAll('.error');
            errorFields.forEach(field => {
                field.classList.remove(CONFIG.ERROR_CLASS);
                field.setAttribute('aria-invalid', 'false');
            });

            // Limpiar mensajes de éxito
            const successMessages = elements.modal.querySelectorAll('[style*="background: #10b981"]');
            successMessages.forEach(msg => msg.remove());
        }

        announceModalState(message) {
            const announcer = document.createElement('div');
            announcer.setAttribute('aria-live', 'assertive');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.textContent = message;
            
            document.body.appendChild(announcer);
            setTimeout(() => document.body.removeChild(announcer), 1000);
        }
    }

    // ===== UTILIDADES GENERALES =====
    class Utils {
        static debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        static isMobile() {
            return window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
        }

        static smoothScrollTo(element, offset = 0) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }

        // Animación de scroll con rAF y easing; acepta un destino dinámico (función) para recalcular offset
        static animateScrollTo(getTargetY, duration = 600, onEnd) {
            const startY = window.scrollY;
            const startTime = performance.now();
            // Easing más fluido y rápido al inicio: ease-out quint
            const ease = t => 1 - Math.pow(1 - t, 3); // ease-out cubic para un final más suave
            let rafId = null;
            let lastY = startY;
            // Filtrado suave del objetivo para evitar saltos si cambia el offset sticky
            let smoothedTargetY = Math.max(0, typeof getTargetY === 'function' ? getTargetY() : getTargetY);

            const step = (now) => {
                const elapsed = Math.min(1, (now - startTime) / duration);
                const eased = ease(elapsed);
                const desired = Math.max(0, typeof getTargetY === 'function' ? getTargetY() : getTargetY);
                // LERP del objetivo para suavizar cambios bruscos de offset
                smoothedTargetY += (desired - smoothedTargetY) * 0.35;
                const targetY = smoothedTargetY;
                const nextY = startY + (targetY - startY) * eased;
                // Evitar micro-oscilaciones por 1px
                if (Math.abs(nextY - lastY) > 0.5) {
                    window.scrollTo(0, nextY);
                    lastY = nextY;
                }
                if (elapsed < 1) {
                    rafId = requestAnimationFrame(step);
                } else {
                    // Ajuste final a objetivo exacto
                    // Ajuste final al objetivo deseado actual
                    window.scrollTo(0, Math.max(0, typeof getTargetY === 'function' ? getTargetY() : getTargetY));
                    onEnd && onEnd();
                }
            };

            rafId = requestAnimationFrame(step);
            // Retornar cancelador
            return () => {
                if (rafId) cancelAnimationFrame(rafId);
                onEnd && onEnd();
            };
        }

        // Fallback automático si las rutas de imágenes se han movido de /assets a /01_bar_kaixo o raíz
        static setupImageRelocationFallback() {
            document.addEventListener('error', (e) => {
                const target = e.target;
                if (!target || target.tagName !== 'IMG') return;

                const img = target;
                const nameMatch = (img.getAttribute('data-original-src') || img.getAttribute('src') || '').split('/').pop();
                const fileName = (nameMatch || '').split('?')[0];
                if (!fileName) return;

                const idx = parseInt(img.dataset.fallbackIndex || '0', 10);
                const candidates = [];

                // Prioridad nueva: 01_bar_kaixo/, luego mismo directorio, y por último assets/
                candidates.push(`01_bar_kaixo/${fileName}`);
                candidates.push(`${fileName}`);
                candidates.push(`assets/${fileName}`);

                if (idx >= candidates.length) return; // sin más opciones

                // Guardar src original si aún no lo hemos hecho
                if (!img.getAttribute('data-original-src')) {
                    img.setAttribute('data-original-src', img.getAttribute('src') || '');
                }

                img.dataset.fallbackIndex = String(idx + 1);
                img.src = candidates[idx];
            }, true);
        }
    }

    // ===== MEJORAS DE NAVEGACIÓN =====
    class NavigationEnhancements {
        constructor() {
            this.init();
        }

        init() {
            this.setupSmoothScrolling();
            this.setupActiveNavigation();
            this.setupStickyPillsBackground();
            this.setupNavbarCollapseOnScroll();
        }

        setupSmoothScrolling() {
            const navLinks = document.querySelectorAll('a[href^="#"]');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        Utils.smoothScrollTo(targetElement, 80); // Offset para navbar fija
                    }
                });
            });
        }

        setupActiveNavigation() {
            const navLinks = document.querySelectorAll('.nav-links a');
            
            window.addEventListener('scroll', Utils.debounce(() => {
                const scrollPosition = window.scrollY + 100;
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        const section = document.getElementById(href.substring(1));
                        if (section) {
                            const sectionTop = section.offsetTop;
                            const sectionBottom = sectionTop + section.offsetHeight;
                            
                            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                                navLinks.forEach(l => l.classList.remove('active'));
                                link.classList.add('active');
                            }
                        }
                    }
                });
            }, 100), { passive: true });
        }
    }

    // Añadir fondo sutil cuando las pills están pegadas
    NavigationEnhancements.prototype.setupStickyPillsBackground = function() {
        const pillsContainer = document.querySelector('.category-pills-container');
        if (!pillsContainer) return;

        const onScroll = Utils.debounce(() => {
            const stuck = window.scrollY + 1 >= (pillsContainer.offsetTop - parseInt(getComputedStyle(pillsContainer).top || '0'));
            pillsContainer.classList.toggle('stuck', stuck);
        }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
        // estado inicial
        onScroll();
    };

    // Colapsar la navbar al hacer scroll dejando solo el logo
    NavigationEnhancements.prototype.setupNavbarCollapseOnScroll = function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const THRESHOLD = 80; // px de scroll para colapsar
        const onScroll = Utils.debounce(() => {
            const shouldCollapse = window.scrollY > THRESHOLD;
            navbar.classList.toggle('collapsed', shouldCollapse);
        }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
        onScroll();
    };

    // ===== INICIALIZACIÓN =====
    function init() {
        // Verificar que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        try {
            // Optimizaciones ligeras de imagen
            try {
                document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
                });
                const heroImg = document.querySelector('.hero-image img');
                if (heroImg) heroImg.setAttribute('fetchpriority', 'high');
            } catch (_) {}

            // Fallback de reubicación de imágenes (por si se movieron de carpeta)
            Utils.setupImageRelocationFallback();

            // Inicializar componentes
            new ThemeManager();
            new CategoryFilter();
            new ReservationModal();
            new NavigationEnhancements();

            // Configuración inicial de accesibilidad
            setupInitialAccessibility();
            
            // Configuración de lazy loading mejorado
            setupEnhancedLazyLoading();

            // Preloader de imágenes
            setupPreloader();

            console.log('Bar Kaixo: Todos los componentes inicializados correctamente');
            
        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
        }
    }

    function setupInitialAccessibility() {
        // Configurar estados ARIA iniciales
        elements.modal?.setAttribute('aria-hidden', 'true');
        
        // Configurar pills navigation
        elements.categoryPills.forEach((pill, index) => {
            pill.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            pill.tabIndex = index === 0 ? 0 : -1;
        });
    }

    function setupEnhancedLazyLoading() {
        // Lazy loading nativo mejorado con intersection observer como fallback
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('loading');
                        observer.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                img.classList.add('loading');
                imageObserver.observe(img);
            });
        }
    }

    // ===== PRE-CARGA DE IMÁGENES CON PANTALLA DE CARGA =====
    function setupPreloader() {
        const overlay = document.getElementById('app-preloader');
        if (!overlay) return;

        const progressEl = document.getElementById('loader-progress');
        const barFill = document.getElementById('loader-progress-bar-fill');

        // Selección de variante visual: spinner (por defecto), bars, ripple, orbit
        const visual = overlay.querySelector('.loader-visual');
        if (visual) {
            const variants = ['is-spinner','is-bars','is-ripple','is-orbit'];
            const attr = overlay.getAttribute('data-loader');
            let chosen = variants[0];
            if (attr && variants.includes(`is-${attr}`)) {
                chosen = `is-${attr}`;
            } else {
                // opción: elegir al azar para dar variedad en cada visita
                chosen = variants[Math.floor(Math.random() * variants.length)];
            }
            visual.classList.remove(...variants);
            visual.classList.add(chosen);
        }

        // Recolectar imágenes y dividir en fases: críticas (hero + logo + primeras categorías visibles) y resto
        const allImgs = Array.from(document.querySelectorAll('img'));
        const criticalSelectors = [
            '.hero-image img',
            '.hero-logo',
            '.nav-logo',
            '.menu-grid .menu-card:nth-of-type(-n+4) img' // primeras 4 cards para evitar salto visual
        ];
        const criticalSet = new Set();
        criticalSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(img => criticalSet.add(img));
        });

        const critical = Array.from(criticalSet);
        const nonCritical = allImgs.filter(img => !criticalSet.has(img));

        // Crear lista de URLs únicas por fase
        const unique = list => Array.from(new Set(list.map(i => i.getAttribute('src') || i.getAttribute('data-src')).filter(Boolean)));
        const criticalUrls = unique(critical);
        const nonCriticalUrls = unique(nonCritical);

        // Métricas de progreso: 80% para críticas, 20% para resto (visual)
        const totalVisualWeight = 100;
        const criticalWeight = 80;
        const nonCriticalWeight = 20;
        let criticalLoaded = 0;
        let nonCriticalLoaded = 0;

        const updateProgress = () => {
            const critPct = criticalUrls.length ? (criticalLoaded / criticalUrls.length) : 1;
            const nonCritPct = nonCriticalUrls.length ? (nonCriticalLoaded / nonCriticalUrls.length) : 1;
            const weighted = Math.min(1, (critPct * criticalWeight + nonCritPct * nonCriticalWeight) / totalVisualWeight);
            const pct = Math.round(weighted * 100);
            if (progressEl) progressEl.textContent = pct + '%';
            if (barFill) barFill.style.width = pct + '%';
            if (pct >= 100) {
                // Pequeño delay para suavidad
                requestAnimationFrame(() => {
                    overlay.classList.add('hidden');
                    setTimeout(() => overlay.remove(), 400);
                });
            }
        };

        if (criticalUrls.length === 0) {
            // Nada crítico, cerrar rápido y cargar resto en idle
            overlay.classList.add('hidden');
            setTimeout(() => overlay.remove(), 300);
            deferNonCritical(nonCriticalUrls);
            return;
        }

        // Cargar fase crítica
        criticalUrls.forEach(url => {
            const img = new Image();
            img.onload = () => { criticalLoaded++; updateProgress(); };
            img.onerror = () => { criticalLoaded++; updateProgress(); };
            img.src = url;
        });

        // Lanzar carga diferida del resto cuando termine la fase crítica o a los 1.5s lo que ocurra antes
        let nonCriticalStarted = false;
        const startNonCritical = () => {
            if (nonCriticalStarted) return; nonCriticalStarted = true;
            nonCriticalUrls.forEach(url => {
                const img = new Image();
                img.onload = () => { nonCriticalLoaded++; updateProgress(); };
                img.onerror = () => { nonCriticalLoaded++; updateProgress(); };
                img.src = url;
            });
        };

        const criticalCheckInterval = setInterval(() => {
            if (criticalLoaded >= criticalUrls.length) {
                clearInterval(criticalCheckInterval);
                startNonCritical();
            }
        }, 60);
        setTimeout(startNonCritical, 1500);

        // Fallback tiempo máximo (en caso de bloqueos de red)
        setTimeout(() => {
            updateProgress();
            if (!overlay.classList.contains('hidden')) {
                overlay.classList.add('hidden');
                setTimeout(() => overlay.remove(), 300);
            }
        }, 9000);

        // Asegurar que imágenes lazy tengan src pronto
        allImgs.forEach(img => {
            if (!img.getAttribute('src') && img.dataset && img.dataset.src) {
                img.src = img.dataset.src;
            }
        });

        // Carga en idle para recursos no listados (ej futuros) - utilitario básico
        function deferNonCritical(extraUrls) {
            if (!extraUrls || !extraUrls.length) return;
            const loader = () => {
                extraUrls.forEach(url => { const i = new Image(); i.src = url; });
            };
            if ('requestIdleCallback' in window) {
                requestIdleCallback(loader, { timeout: 2000 });
            } else {
                setTimeout(loader, 1200);
            }
        }
    }

    // ===== EXPONER API PÚBLICA =====
    window.BarKaixo = {
        version: '1.0.0',
        Utils,
        init
    };

    // Inicializar automáticamente
    init();

})();