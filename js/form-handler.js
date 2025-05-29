/**
 * Обробка форм
 * Валідація, збереження даних та відправка форми
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const formResult = document.getElementById('form-result');
    
    if (!contactForm) {
        console.warn('Contact form not found');
        return;
    }
    
    // Конфігурація валідації
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[a-zA-Zа-яА-ЯёЁіІїЇєЄ\s'-]+$/,
            errorMessage: "Ім'я повинно містити тільки літери та бути від 2 до 50 символів"
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: "Введіть коректну електронну пошту"
        },
        phone: {
            required: false,
            pattern: /^[\+]?[\d\s\-\(\)]{10,15}$/,
            errorMessage: "Введіть коректний номер телефону"
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 500,
            errorMessage: "Повідомлення повинно містити від 10 до 500 символів"
        }
    };
    
    /**
     * Функція для відображення помилки
     * @param {HTMLElement} field - Поле форми
     * @param {string} message - Текст помилки
     */
    function showError(field, message) {
        const errorElement = document.getElementById(field.name + '-error');
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    /**
     * Функція для очищення помилки
     * @param {HTMLElement} field - Поле форми
     */
    function clearError(field) {
        const errorElement = document.getElementById(field.name + '-error');
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    /**
     * Функція валідації поля
     * @param {HTMLElement} field - Поле форми
     * @param {Object} rules - Правила валідації
     * @returns {boolean} - Результат валідації
     */
    function validateField(field, rules) {
        const value = field.value.trim();
        
        // Перевірка обов'язковості
        if (rules.required && !value) {
            showError(field, "Це поле є обов'язковим");
            return false;
        }
        
        // Якщо поле не обов'язкове і пусте, пропускаємо інші перевірки
        if (!rules.required && !value) {
            clearError(field);
            return true;
        }
        
        // Перевірка мінімальної довжини
        if (rules.minLength && value.length < rules.minLength) {
            showError(field, rules.errorMessage || `Мінімальна довжина: ${rules.minLength} символів`);
            return false;
        }
        
        // Перевірка максимальної довжини
        if (rules.maxLength && value.length > rules.maxLength) {
            showError(field, rules.errorMessage || `Максимальна довжина: ${rules.maxLength} символів`);
            return false;
        }
        
        // Перевірка паттерна
        if (rules.pattern && !rules.pattern.test(value)) {
            showError(field, rules.errorMessage || "Неправильний формат");
            return false;
        }
        
        clearError(field);
        return true;
    }
    
    /**
     * Функція валідації всієї форми
     * @returns {boolean} - Результат валідації
     */
    function validateForm() {
        let isValid = true;
        
        Object.keys(validationRules).forEach(fieldName => {
            const field = contactForm.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const fieldValid = validateField(field, validationRules[fieldName]);
                if (!fieldValid) {
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }
    
    /**
     * Функція для збереження даних форми в localStorage
     * @param {FormData} formData - Дані форми
     */
    function saveFormData(formData) {
        try {
            const formDataObj = {};
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            // Додаємо timestamp
            formDataObj.timestamp = new Date().toISOString();
            
            // Отримуємо існуючі дані
            const existingData = JSON.parse(localStorage.getItem('contactFormSubmissions') || '[]');
            
            // Додаємо нові дані
            existingData.push(formDataObj);
            
            // Зберігаємо в localStorage (зберігаємо тільки останні 10 записів)
            const limitedData = existingData.slice(-10);
            localStorage.setItem('contactFormSubmissions', JSON.stringify(limitedData));
            
            console.log('Form data saved to localStorage:', formDataObj);
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }
    
    /**
     * Функція для відображення результату
     * @param {string} message - Повідомлення
     * @param {string} type - Тип повідомлення (success/error)
     */
    function showResult(message, type = 'success') {
        if (formResult) {
            formResult.textContent = message;
            formResult.className = `form-result ${type}`;
            formResult.style.display = 'block';
            
            // Автоматично приховуємо повідомлення через 5 секунд
            setTimeout(() => {
                formResult.style.display = 'none';
            }, 5000);
        }
    }
    
    /**
     * Функція для завантаження збережених даних
     */
    function loadSavedData() {
        try {
            const savedData = localStorage.getItem('contactFormData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    const field = contactForm.querySelector(`[name="${key}"]`);
                    if (field && data[key]) {
                        field.value = data[key];
                    }
                });
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
    
    /**
     * Функція для автозбереження даних форми
     */
    function autoSaveFormData() {
        try {
            const formData = new FormData(contactForm);
            const formDataObj = {};
            
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
            }
            
            localStorage.setItem('contactFormData', JSON.stringify(formDataObj));
        } catch (error) {
            console.error('Error auto-saving form data:', error);
        }
    }
    
    // Валідація полів в реальному часі
    Object.keys(validationRules).forEach(fieldName => {
        const field = contactForm.querySelector(`[name="${fieldName}"]`);
        if (field) {
            // Валідація при втраті фокусу
            field.addEventListener('blur', function() {
                validateField(field, validationRules[fieldName]);
            });
            
            // Очищення помилки при введенні
            field.addEventListener('input', function() {
                if (field.classList.contains('error')) {
                    clearError(field);
                }
                
                // Автозбереження
                autoSaveFormData();
            });
        }
    });
    
    // Обробка відправки форми
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Валідація
        if (!validateForm()) {
            showResult('Будь ласка, виправте помилки у формі', 'error');
            return;
        }
        
        // Збираємо дані форми
        const formData = new FormData(contactForm);
        
        // Імітація відправки даних
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Показуємо стан завантаження
        submitButton.textContent = 'Відправляємо...';
        submitButton.disabled = true;
        
        // Імітація затримки сервера
        setTimeout(() => {
            // Зберігаємо дані
            saveFormData(formData);
            
            // Показуємо успішне повідомлення
            showResult('Дякуємо! Ваше повідомлення успішно відправлено. Ми зв\'яжемося з вами найближчим часом.', 'success');
            
            // Очищуємо форму
            contactForm.reset();
            
            // Очищуємо автозбережені дані
            localStorage.removeItem('contactFormData');
            
            // Відновлюємо кнопку
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Очищуємо помилки
            Object.keys(validationRules).forEach(fieldName => {
                const field = contactForm.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    clearError(field);
                }
            });
            
        }, 1500);
    });
    
    // Обробка скидання форми
    contactForm.addEventListener('reset', function() {
        // Очищуємо помилки
        Object.keys(validationRules).forEach(fieldName => {
            const field = contactForm.querySelector(`[name="${fieldName}"]`);
            if (field) {
                clearError(field);
            }
        });
        
        // Очищуємо автозбережені дані
        localStorage.removeItem('contactFormData');
        
        // Приховуємо результат
        if (formResult) {
            formResult.style.display = 'none';
        }
    });
    
    // Завантажуємо збережені дані при завантаженні сторінки
    loadSavedData();
    
    // Функція для отримання всіх збережених відправок (для демонстрації)
    window.getFormSubmissions = function() {
        try {
            const submissions = localStorage.getItem('contactFormSubmissions');
            return submissions ? JSON.parse(submissions) : [];
        } catch (error) {
            console.error('Error getting form submissions:', error);
            return [];
        }
    };
    
    console.log('Form handler initialized');
});
