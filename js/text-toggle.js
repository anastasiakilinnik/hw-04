/**
 * Розгортання та згортання тексту
 * Функціональність "читати більше / читати менше"
 */

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.querySelector('.toggle-text-btn');
    const fullText = document.querySelector('.full-text');
    const shortText = document.querySelector('.short-text');
    
    if (!toggleButton || !fullText) {
        console.warn('Text toggle elements not found');
        return;
    }
    
    let isExpanded = false;
    
    /**
     * Функція для розгортання тексту
     */
    function expandText() {
        fullText.classList.remove('hidden');
        toggleButton.textContent = 'Читати менше';
        isExpanded = true;
        
        // Додаємо анімацію
        fullText.style.animation = 'fadeIn 0.5s ease';
        
        // Плавний скрол до повного тексту
        setTimeout(() => {
            fullText.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
    
    /**
     * Функція для згортання тексту
     */
    function collapseText() {
        fullText.classList.add('hidden');
        toggleButton.textContent = 'Читати більше';
        isExpanded = false;
        
        // Плавний скрол до короткого тексту
        if (shortText) {
            shortText.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }
    
    /**
     * Функція для перемикання стану тексту
     */
    function toggleText() {
        if (isExpanded) {
            collapseText();
        } else {
            expandText();
        }
        
        // Додаємо ефект натискання кнопки
        toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            toggleButton.style.transform = '';
        }, 150);
    }
    
    // Обробник події для кнопки
    toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        toggleText();
    });
    
    // Додаємо підтримку клавіатури
    toggleButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleText();
        }
    });
    
    // Встановлюємо початкові атрибути доступності
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'full-text');
    
    if (fullText) {
        fullText.setAttribute('id', 'full-text');
        fullText.setAttribute('aria-hidden', 'true');
    }
    
    // Оновлюємо атрибути при зміні стану
    const originalToggleText = toggleText;
    toggleText = function() {
        originalToggleText();
        
        // Оновлюємо атрибути доступності
        toggleButton.setAttribute('aria-expanded', isExpanded.toString());
        if (fullText) {
            fullText.setAttribute('aria-hidden', (!isExpanded).toString());
        }
    };
    
    // Збереження стану в sessionStorage
    const STORAGE_KEY = 'textToggleState';
    
    /**
     * Функція для збереження стану
     */
    function saveState() {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                isExpanded: isExpanded,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Could not save text toggle state:', error);
        }
    }
    
    /**
     * Функція для завантаження стану
     */
    function loadState() {
        try {
            const savedState = sessionStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                const oneHour = 60 * 60 * 1000; // 1 година в мілісекундах
                
                // Перевіряємо, чи не застарілий стан (більше години)
                if (Date.now() - state.timestamp < oneHour) {
                    if (state.isExpanded) {
                        expandText();
                    }
                } else {
                    // Видаляємо застарілий стан
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (error) {
            console.warn('Could not load text toggle state:', error);
        }
    }
    
    // Модифікуємо функції для збереження стану
    const originalExpandText = expandText;
    const originalCollapseText = collapseText;
    
    expandText = function() {
        originalExpandText();
        saveState();
    };
    
    collapseText = function() {
        originalCollapseText();
        saveState();
    };
    
    // Завантажуємо збережений стан
    loadState();
    
    // Додаємо підтримку жестів для мобільних пристроїв
    let touchStartY = 0;
    let touchEndY = 0;
    
    if (fullText) {
        fullText.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        fullText.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            
            // Якщо свайп вгору і текст розгорнутий, згортаємо його
            if (touchStartY - touchEndY > 50 && isExpanded) {
                collapseText();
            }
        }, { passive: true });
    }
    
    // Автоматичне згортання при прокрутці за межі секції
    function checkScrollPosition() {
        if (isExpanded) {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                const sectionRect = aboutSection.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                // Якщо секція повністю прокручена вгору
                if (sectionRect.bottom < 0) {
                    collapseText();
                }
            }
        }
    }
    
    // Слухач прокрутки з throttling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(checkScrollPosition, 100);
    }, { passive: true });
    
    console.log('Text toggle functionality initialized');
}); 