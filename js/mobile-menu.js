/**
 * Мобільне меню
 * Управляє відкриттям та закриттям мобільного меню
 */

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');
    
    // Перевіряємо наявність елементів
    if (!mobileMenuToggle || !mobileNav) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Функція для відкриття/закриття меню
    function toggleMobileMenu() {
        const isActive = mobileMenuToggle.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    // Функція для відкриття меню
    function openMobileMenu() {
        mobileMenuToggle.classList.add('active');
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокуємо скрол
        
        // Додаємо клас для анімації
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
    }
    
    // Функція для закриття меню
    function closeMobileMenu() {
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = ''; // Відновлюємо скрол
        
        // Оновлюємо атрибути доступності
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
    }
    
    // Обробник кліку на кнопку меню
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Закриття меню при кліку на посилання
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Закриття меню при кліку поза ним
    document.addEventListener('click', function(e) {
        if (!mobileNav.contains(e.target) && 
            !mobileMenuToggle.contains(e.target) && 
            mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Закриття меню при натисканні Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Закриття меню при зміні розміру екрану (наприклад, поворот екрану)
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && mobileNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Встановлюємо початкові атрибути доступності
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
});
