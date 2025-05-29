/**
 * Обробка API запитів та пагінації
 * Лабораторна робота 4 - REST API
 */

document.addEventListener('DOMContentLoaded', function() {
    // Елементи інтерфейсу
    const fetchPostsBtn = document.getElementById('fetch-posts-btn');
    const fetchUsersBtn = document.getElementById('fetch-users-btn');
    const fetchCommentsBtn = document.getElementById('fetch-comments-btn');
    const loadPageBtn = document.getElementById('load-page-btn');
    const pageInput = document.getElementById('page-input');
    const limitInput = document.getElementById('limit-input');
    const apiResults = document.getElementById('api-results');
    const paginationInfo = document.getElementById('pagination-info');
    
    // Перевірка наявності елементів
    if (!apiResults) {
        console.warn('API results container not found');
        return;
    }
    
    // Конфігурація API
    const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
    
    // Стан додатка
    let currentEndpoint = '';
    let currentPage = 1;
    let currentLimit = 5;
    let totalItems = 0;
    let isLoading = false;
    
    /**
     * Функція для відображення індикатора завантаження
     */
    function showLoading() {
        isLoading = true;
        apiResults.innerHTML = `
            <div class="loading-indicator" style="text-align: center; padding: 2rem;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: var(--text-light);">Завантаження даних...</p>
            </div>
        `;
        
        // Додаємо CSS для анімації обертання
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Функція для приховання індикатора завантаження
     */
    function hideLoading() {
        isLoading = false;
    }
    
    /**
     * Функція для відображення помилки
     * @param {string} message - Текст помилки
     */
    function showError(message) {
        apiResults.innerHTML = `
            <div class="error-message" style="
                background-color: var(--error-color);
                color: white;
                padding: 1rem;
                border-radius: 5px;
                text-align: center;
                margin: 1rem 0;
            ">
                <h4>Помилка завантаження даних</h4>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    background-color: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid white;
                    padding: 0.5rem 1rem;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 0.5rem;
                ">Спробувати ще раз</button>
            </div>
        `;
    }
    
    /**
     * Функція для виконання API запиту
     * @param {string} endpoint - API endpoint
     * @param {number} page - Номер сторінки
     * @param {number} limit - Кількість елементів на сторінці
     */
    async function fetchData(endpoint, page = 1, limit = 5) {
        try {
            showLoading();
            
            // Формуємо URL з параметрами пагінації
            const url = `${API_BASE_URL}/${endpoint}?_page=${page}&_limit=${limit}`;
            
            console.log(`Fetching data from: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Отримуємо загальну кількість елементів з заголовків
            const totalCount = response.headers.get('x-total-count');
            totalItems = totalCount ? parseInt(totalCount) : data.length;
            
            hideLoading();
            displayData(data, endpoint);
            updatePaginationInfo(page, limit, totalItems);
            
            // Зберігаємо поточний стан
            currentEndpoint = endpoint;
            currentPage = page;
            currentLimit = limit;
            
        } catch (error) {
            console.error('API Error:', error);
            hideLoading();
            showError(error.message);
        }
    }
    
    /**
     * Функція для відображення даних
     * @param {Array} data - Дані для відображення
     * @param {string} endpoint - Тип даних
     */
    function displayData(data, endpoint) {
        if (!data || data.length === 0) {
            apiResults.innerHTML = `
                <div class="no-data" style="
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-light);
                    background-color: var(--bg-color);
                    border-radius: 8px;
                ">
                    <h4>Дані не знайдено</h4>
                    <p>На цій сторінці немає елементів для відображення.</p>
                </div>
            `;
            return;
        }
        
        let html = `<h3>Результати запиту: ${getEndpointTitle(endpoint)}</h3>`;
        
        data.forEach((item, index) => {
            html += createItemHTML(item, endpoint, index);
        });
        
        apiResults.innerHTML = html;
    }
    
    /**
     * Функція для отримання назви endpoint'а
     * @param {string} endpoint - API endpoint
     * @returns {string} - Назва українською
     */
    function getEndpointTitle(endpoint) {
        const titles = {
            'posts': 'Публікації',
            'users': 'Користувачі',
            'comments': 'Коментарі'
        };
        return titles[endpoint] || endpoint;
    }
    
    /**
     * Функція для створення HTML для одного елемента
     * @param {Object} item - Елемент даних
     * @param {string} endpoint - Тип даних
     * @param {number} index - Індекс елемента
     * @returns {string} - HTML код
     */
    function createItemHTML(item, endpoint, index) {
        let content = '';
        
        switch (endpoint) {
            case 'posts':
                content = `
                    <h4>${item.title}</h4>
                    <p><strong>Автор ID:</strong> ${item.userId}</p>
                    <p>${item.body.substring(0, 100)}${item.body.length > 100 ? '...' : ''}</p>
                `;
                break;
                
            case 'users':
                content = `
                    <h4>${item.name} (@${item.username})</h4>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>Телефон:</strong> ${item.phone}</p>
                    <p><strong>Сайт:</strong> ${item.website}</p>
                    <p><strong>Компанія:</strong> ${item.company.name}</p>
                    <p><strong>Адреса:</strong> ${item.address.city}, ${item.address.street}</p>
                `;
                break;
                
            case 'comments':
                content = `
                    <h4>${item.name}</h4>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>Пост ID:</strong> ${item.postId}</p>
                    <p>${item.body.substring(0, 100)}${item.body.length > 100 ? '...' : ''}</p>
                `;
                break;
                
            default:
                content = `<pre>${JSON.stringify(item, null, 2)}</pre>`;
        }
        
        return `
            <div class="api-item" style="animation-delay: ${index * 0.1}s;">
                ${content}
            </div>
        `;
    }
    
    /**
     * Функція для оновлення інформації про пагінацію
     * @param {number} page - Поточна сторінка
     * @param {number} limit - Кількість на сторінці
     * @param {number} total - Загальна кількість
     */
    function updatePaginationInfo(page, limit, total) {
        if (!paginationInfo) return;
        
        const totalPages = Math.ceil(total / limit);
        const startItem = (page - 1) * limit + 1;
        const endItem = Math.min(page * limit, total);
        
        let infoHTML = `
            <p>Сторінка ${page} з ${totalPages} | 
            Показано ${startItem}-${endItem} з ${total} елементів</p>
        `;
        
        // Додаємо кнопки навігації
        if (totalPages > 1) {
            infoHTML += '<div class="pagination-buttons" style="margin-top: 1rem;">';
            
            // Кнопка "Попередня"
            if (page > 1) {
                infoHTML += `
                    <button onclick="loadPage(${page - 1})" class="api-btn" style="margin-right: 0.5rem;">
                        ← Попередня
                    </button>
                `;
            }
            
            // Номери сторінок
            const maxButtons = 5;
            let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxButtons - 1);
            
            if (endPage - startPage < maxButtons - 1) {
                startPage = Math.max(1, endPage - maxButtons + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const isActive = i === page ? 'style="background-color: var(--primary-color); color: white;"' : '';
                infoHTML += `
                    <button onclick="loadPage(${i})" class="api-btn" ${isActive} style="margin: 0 0.25rem;">
                        ${i}
                    </button>
                `;
            }
            
            // Кнопка "Наступна"
            if (page < totalPages) {
                infoHTML += `
                    <button onclick="loadPage(${page + 1})" class="api-btn" style="margin-left: 0.5rem;">
                        Наступна →
                    </button>
                `;
            }
            
            infoHTML += '</div>';
        }
        
        // Повідомлення про кінець даних
        if (page >= totalPages && total > 0) {
            infoHTML += `
                <div style="
                    background-color: var(--secondary-color);
                    color: var(--primary-color);
                    padding: 1rem;
                    border-radius: 5px;
                    text-align: center;
                    margin-top: 1rem;
                ">
                    <strong>Це останні дані!</strong><br>
                    Більше елементів немає.
                </div>
            `;
        }
        
        paginationInfo.innerHTML = infoHTML;
    }
    
    /**
     * Функція для валідації введених даних
     * @returns {Object} - Результат валідації
     */
    function validateInputs() {
        const page = parseInt(pageInput?.value) || 1;
        const limit = parseInt(limitInput?.value) || 5;
        
        const errors = [];
        
        if (page < 1) {
            errors.push("Номер сторінки повинен бути більше 0");
        }
        
        if (limit < 1 || limit > 20) {
            errors.push("Кількість елементів повинна бути від 1 до 20");
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            page,
            limit
        };
    }
    
    /**
     * Функція для завантаження конкретної сторінки
     * @param {number} page - Номер сторінки
     */
    window.loadPage = function(page) {
        if (!currentEndpoint) {
            alert('Спочатку оберіть тип даних для завантаження');
            return;
        }
        
        if (pageInput) {
            pageInput.value = page;
        }
        
        const validation = validateInputs();
        if (validation.isValid) {
            fetchData(currentEndpoint, page, validation.limit);
        }
    };
    
    // Обробники подій для кнопок
    if (fetchPostsBtn) {
        fetchPostsBtn.addEventListener('click', function() {
            if (isLoading) return;
            
            const validation = validateInputs();
            if (validation.isValid) {
                fetchData('posts', validation.page, validation.limit);
            } else {
                alert('Помилки валідації:\n' + validation.errors.join('\n'));
            }
        });
    }
    
    if (fetchUsersBtn) {
        fetchUsersBtn.addEventListener('click', function() {
            if (isLoading) return;
            
            const validation = validateInputs();
            if (validation.isValid) {
                fetchData('users', validation.page, validation.limit);
            } else {
                alert('Помилки валідації:\n' + validation.errors.join('\n'));
            }
        });
    }
    
    if (fetchCommentsBtn) {
        fetchCommentsBtn.addEventListener('click', function() {
            if (isLoading) return;
            
            const validation = validateInputs();
            if (validation.isValid) {
                fetchData('comments', validation.page, validation.limit);
            } else {
                alert('Помилки валідації:\n' + validation.errors.join('\n'));
            }
        });
    }
    
    if (loadPageBtn) {
        loadPageBtn.addEventListener('click', function() {
            if (isLoading) return;
            
            if (!currentEndpoint) {
                alert('Спочатку оберіть тип даних для завантаження');
                return;
            }
            
            const validation = validateInputs();
            if (validation.isValid) {
                fetchData(currentEndpoint, validation.page, validation.limit);
            } else {
                alert('Помилки валідації:\n' + validation.errors.join('\n'));
            }
        });
    }
    
    // Валідація полів в реальному часі
    if (pageInput) {
        pageInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    }
    
    if (limitInput) {
        limitInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1 || value > 20) {
                this.style.borderColor = 'var(--error-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    }
    
    // Обробка Enter в полях вводу
    [pageInput, limitInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    if (loadPageBtn) {
                        loadPageBtn.click();
                    }
                }
            });
        }
    });
    
    // Додаємо CSS для анімації елементів
    const style = document.createElement('style');
    style.textContent = `
        .api-item {
            animation: slideInUp 0.3s ease forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .pagination-buttons button:hover {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
    
    console.log('API handler initialized');
}); 