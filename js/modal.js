/**
 * Модальні вікна
 * Управляє відкриттям та закриттям модальних вікон
 */

document.addEventListener('DOMContentLoaded', function() {
    // Отримуємо всі кнопки для відкриття модальних вікон
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    
    // Отримуємо всі модальні вікна
    const modals = document.querySelectorAll('.modal');
    
    // Отримуємо кнопки закриття модальних вікон
    const closeButtons = document.querySelectorAll('.close-btn');
    
    // Змінна для зберігання попереднього фокусованого елемента
    let previouslyFocusedElement = null;
    
    /**
     * Функція для відкриття модального вікна
     * @param {string} modalId - ID модального вікна
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.warn(`Modal with ID ${modalId} not found`);
            return;
        }
        
        // Зберігаємо попередньо фокусований елемент
        previouslyFocusedElement = document.activeElement;
        
        // Показуємо модальне вікно
        modal.style.display = "block";
        modal.classList.add('active');
        
        // Блокуємо скролінг сторінки
        document.body.style.overflow = 'hidden';
        
        // Встановлюємо атрибути доступності
        modal.setAttribute('aria-hidden', 'false');
        
        // Фокусуємось на модальному вікні
        const firstFocusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
        
        // Додаємо анімацію появи
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.add('bounce');
            setTimeout(() => {
                modalContent.classList.remove('bounce');
            }, 1000);
        }
    }
    
    /**
     * Функція для закриття модального вікна
     * @param {HTMLElement} modal - Елемент модального вікна
     */
    function closeModal(modal) {
        if (!modal) return;
        
        // Додаємо анімацію зникнення
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = "none";
            modal.style.opacity = '';
            modal.classList.remove('active');
            
            // Відновлюємо скролінг сторінки
            document.body.style.overflow = '';
            
            // Встановлюємо атрибути доступності
            modal.setAttribute('aria-hidden', 'true');
            
            // Повертаємо фокус на попередній елемент
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
                previouslyFocusedElement = null;
            }
        }, 300);
    }
    
    /**
     * Функція для закриття всіх модальних вікон
     */
    function closeAllModals() {
        modals.forEach(modal => {
            if (modal.style.display === "block" || modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    }
    
    // Обробники подій для відкриття модальних вікон
    openModalButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal');
            if (modalId) {
                openModal(modalId);
            }
        });
    });
    
    // Обробники подій для закриття модальних вікон через кнопку закриття
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закриття модального вікна при натисканні за межами вікна
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Закриття модального вікна при натисканні на клавішу Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });
    
    // Обмеження табуляції в межах модального вікна
    modals.forEach(modal => {
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    });
    
    // Встановлюємо початкові атрибути доступності
    modals.forEach(modal => {
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    });
    
    // Обробники для кнопок замовлення в модальних вікнах
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Отримуємо назву продукту з модального вікна
            const modal = button.closest('.modal');
            const productName = modal.querySelector('h2').textContent;
            
            // Показуємо повідомлення про замовлення
            alert(`Дякуємо за інтерес до "${productName}"! Для оформлення замовлення зверніться за телефоном +380 50 123 45 67`);
            
            // Закриваємо модальне вікно
            closeModal(modal);
        });
    });
});
