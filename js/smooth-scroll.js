/**
 * Плавна прокрутка
 * Обробка кнопок та посилань для плавної прокрутки до секцій
 */

document.addEventListener('DOMContentLoaded', function() {
    /**
     * Функція для плавної прокрутки до елемента
     * @param {string} targetSelector - Селектор цільового елемента
     * @param {number} offset - Зміщення від верху (для врахування fixed header)
     */
    function smoothScrollTo(targetSelector, offset = 80) {
        const target = document.querySelector(targetSelector);
        
        if (!target) {
            console.warn(`Target element not found: ${targetSelector}`);
            return;
        }
        
        // Отримуємо позицію елемента
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        // Виконуємо плавну прокрутку
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Додаємо фокус для доступності (якщо елемент може отримувати фокус)
        setTimeout(() => {
            if (target.tabIndex >= 0 || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
                target.focus();
            }
        }, 700); // Час анімації прокрутки
    }
    
    // Обробка всіх посилань з якорами
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Пропускаємо пусті якорі та спеціальні
            if (href === '#' || href === '#top') {
                return;
            }
            
            // Перевіряємо, чи існує цільовий елемент
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                smoothScrollTo(href);
                
                // Оновлюємо URL без перезавантаження сторінки
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });
    
    // Обробка кнопки CTA
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            const targetSelector = this.getAttribute('data-scroll-to');
            if (targetSelector) {
                e.preventDefault();
                smoothScrollTo(targetSelector);
            }
        });
    }
    
    // Функція для прокрутки до верху сторінки
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Створення кнопки "Вгору"
    function createScrollToTopButton() {
        const button = document.createElement('button');
        button.innerHTML = '↑';
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', 'Прокрутити вгору');
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        // Ховер ефекти
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = 'var(--accent-color)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = 'var(--primary-color)';
        });
        
        // Обробка кліку
        button.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
        });
        
        document.body.appendChild(button);
        return button;
    }
    
    // Створюємо кнопку "Вгору"
    const scrollToTopBtn = createScrollToTopButton();
    
    // Показ/приховування кнопки "Вгору" при прокрутці
    function toggleScrollToTopButton() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        if (scrollPosition > windowHeight * 0.5) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    }
    
    // Слухач прокрутки з throttling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(toggleScrollToTopButton, 10);
    }, { passive: true });
    
    // Активна навігація (підсвічування поточної секції)
    function updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-list a[href^="#"], .mobile-nav-list a[href^="#"]');
        
        if (sections.length === 0 || navLinks.length === 0) return;
        
        const scrollPosition = window.pageYOffset + 100; // Зміщення для header
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Оновлюємо активні посилання
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Додаємо CSS для активних посилань
    const style = document.createElement('style');
    style.textContent = `
        .nav-list a.active,
        .mobile-nav-list a.active {
            color: var(--accent-color);
            font-weight: 600;
        }
        
        .nav-list a.active::after {
            width: 100%;
        }
        
        .scroll-to-top:hover {
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .scroll-to-top:active {
            transform: scale(0.95) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Слухач прокрутки для активної навігації
    let navTimeout;
    window.addEventListener('scroll', function() {
        if (navTimeout) {
            clearTimeout(navTimeout);
        }
        
        navTimeout = setTimeout(updateActiveNavigation, 50);
    }, { passive: true });
    
    // Обробка hash в URL при завантаженні сторінки
    function handleInitialHash() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            // Затримка для завантаження сторінки
            setTimeout(() => {
                smoothScrollTo(hash);
            }, 500);
        }
    }
    
    // Обробка зміни hash
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            smoothScrollTo(hash);
        }
    });
    
    // Керування клавіатурою
    document.addEventListener('keydown', function(e) {
        // Перевіряємо, чи фокус не на інтерактивному елементі
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.contentEditable === 'true'
        );
        
        if (isInputFocused) return;
        
        switch(e.key) {
            case 'Home':
                e.preventDefault();
                scrollToTop();
                break;
            case 'End':
                e.preventDefault();
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
                break;
        }
    });
    
    // Початкова ініціалізація
    handleInitialHash();
    updateActiveNavigation();
    
    console.log('Smooth scroll functionality initialized');
}); 