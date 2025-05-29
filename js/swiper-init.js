/**
 * Ініціалізація Swiper слайдера
 * Адаптивний слайдер продуктів з різною кількістю слайдів
 */

document.addEventListener('DOMContentLoaded', function() {
    // Перевіряємо наявність Swiper
    if (typeof Swiper === 'undefined') {
        console.warn('Swiper library not loaded');
        return;
    }
    
    // Перевіряємо наявність контейнера
    const swiperContainer = document.querySelector('.swiper-container');
    if (!swiperContainer) {
        console.warn('Swiper container not found');
        return;
    }
    
    // Конфігурація слайдера
    const swiperConfig = {
        // Основні налаштування
        loop: true,
        centeredSlides: false,
        grabCursor: true,
        spaceBetween: 20,
        
        // Швидкість анімації
        speed: 600,
        
        // Автопрогравання (вимкнено за замовчуванням)
        autoplay: false,
        
        // Навігація
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // Пагінація
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        
        // Адаптивні налаштування (Mobile First)
        slidesPerView: 1,
        breakpoints: {
            // >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 15,
            },
            // >= 480px
            480: {
                slidesPerView: 1.5,
                spaceBetween: 20,
            },
            // >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            // >= 768px
            768: {
                slidesPerView: 2.5,
                spaceBetween: 25,
            },
            // >= 1024px
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            // >= 1200px
            1200: {
                slidesPerView: 4,
                spaceBetween: 30,
            }
        },
        
        // Ефекти
        effect: 'slide',
        
        // Обробники подій
        on: {
            init: function() {
                console.log('Swiper initialized');
                
                // Додаємо клас ініціалізації
                swiperContainer.classList.add('swiper-initialized');
                
                // Анімація появи слайдів
                const slides = this.slides;
                slides.forEach((slide, index) => {
                    slide.style.opacity = '0';
                    slide.style.transform = 'translateY(50px)';
                    
                    setTimeout(() => {
                        slide.style.transition = 'all 0.6s ease';
                        slide.style.opacity = '1';
                        slide.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            },
            
            slideChange: function() {
                console.log('Slide changed to:', this.activeIndex);
                
                // Додаємо анімацію для активного слайда
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                    activeSlide.classList.add('slide-active');
                    
                    // Видаляємо клас через деякий час
                    setTimeout(() => {
                        activeSlide.classList.remove('slide-active');
                    }, 600);
                }
            },
            
            reachEnd: function() {
                console.log('Reached last slide');
                
                // Можна додати спеціальну логіку для останнього слайда
                const pagination = document.querySelector('.swiper-pagination');
                if (pagination) {
                    pagination.style.background = 'var(--accent-color)';
                    setTimeout(() => {
                        pagination.style.background = '';
                    }, 1000);
                }
            },
            
            reachBeginning: function() {
                console.log('Reached first slide');
            },
            
            resize: function() {
                console.log('Swiper resized');
                this.update();
            }
        }
    };
    
    // Ініціалізуємо Swiper
    let swiper;
    
    try {
        swiper = new Swiper('.swiper-container', swiperConfig);
        
        // Зберігаємо екземпляр для доступу з інших частин коду
        window.productSwiper = swiper;
        
    } catch (error) {
        console.error('Error initializing Swiper:', error);
        
        // Fallback для випадку помилки
        showFallbackSlider();
        return;
    }
    
    /**
     * Fallback слайдер без Swiper
     */
    function showFallbackSlider() {
        console.log('Showing fallback slider');
        
        const wrapper = document.querySelector('.swiper-wrapper');
        if (wrapper) {
            wrapper.style.display = 'grid';
            wrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            wrapper.style.gap = '1rem';
            wrapper.style.transform = 'none';
        }
        
        // Приховуємо елементи навігації
        const navigation = document.querySelectorAll('.swiper-button-next, .swiper-button-prev, .swiper-pagination');
        navigation.forEach(el => el.style.display = 'none');
    }
    
    // Додаткові функції для керування слайдером
    
    /**
     * Перехід до конкретного слайда
     * @param {number} index - Індекс слайда
     */
    window.goToSlide = function(index) {
        if (swiper && typeof swiper.slideTo === 'function') {
            swiper.slideTo(index);
        }
    };
    
    /**
     * Увімкнення/вимкнення автопрогравання
     * @param {boolean} enable - Увімкнути чи вимкнути
     */
    window.toggleAutoplay = function(enable) {
        if (!swiper) return;
        
        if (enable) {
            if (!swiper.autoplay.running) {
                swiper.autoplay.start();
            }
        } else {
            if (swiper.autoplay.running) {
                swiper.autoplay.stop();
            }
        }
    };
    
    /**
     * Оновлення слайдера (корисно після зміни контенту)
     */
    window.updateSwiper = function() {
        if (swiper && typeof swiper.update === 'function') {
            swiper.update();
        }
    };
    
    // Автоматичне увімкнення автопрогравання на великих екранах
    function checkAutoplay() {
        if (window.innerWidth >= 1024) {
            // На великих екранах можна увімкнути автопрогравання
            if (swiper && !swiper.autoplay.running) {
                swiper.autoplay = {
                    delay: 4000,
                    disableOnInteraction: false,
                };
            }
        }
    }
    
    // Слухач зміни розміру екрану
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            checkAutoplay();
            if (swiper && typeof swiper.update === 'function') {
                swiper.update();
            }
        }, 250);
    });
    
    // Керування клавіатурою
    document.addEventListener('keydown', function(e) {
        if (!swiper) return;
        
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
            case 'ArrowLeft':
                e.preventDefault();
                swiper.slidePrev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                swiper.slideNext();
                break;
            case ' ':
                if (e.target === document.body) {
                    e.preventDefault();
                    window.toggleAutoplay(!swiper.autoplay.running);
                }
                break;
        }
    });
    
    // Додаємо CSS для анімацій
    const style = document.createElement('style');
    style.textContent = `
        .swiper-container.swiper-initialized .swiper-slide {
            transition: transform 0.3s ease;
        }
        
        .swiper-slide.slide-active {
            transform: scale(1.05);
        }
        
        .swiper-slide:hover {
            transform: translateY(-5px);
        }
        
        .swiper-button-next,
        .swiper-button-prev {
            background-color: rgba(255, 255, 255, 0.8);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
            background-color: rgba(255, 255, 255, 0.95);
            transform: scale(1.1);
        }
        
        .swiper-pagination-bullet {
            background-color: rgba(213, 66, 106, 0.3);
            transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
            background-color: var(--primary-color);
            transform: scale(1.2);
        }
        
        @media (max-width: 768px) {
            .swiper-button-next,
            .swiper-button-prev {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Початкова перевірка автопрогравання
    checkAutoplay();
    
    console.log('Swiper initialization completed');
}); 