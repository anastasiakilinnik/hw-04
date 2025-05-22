const apiConfig = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        posts: '/posts',
        comments: '/comments',
        albums: '/albums',
        photos: '/photos',
        todos: '/todos',
        users: '/users'
    },
    limits: {
        posts: 100,
        comments: 500,
        albums: 100,
        photos: 5000,
        todos: 200,
        users: 10
    }
};

const state = {
    currentEndpoint: '',
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    data: []
};

const elements = {
    dataContainer: document.getElementById('dataContainer'),
    paginationContainer: document.getElementById('paginationContainer'),
    itemCountInput: document.getElementById('itemCount'),
    buttons: {
        posts: document.getElementById('fetchPosts'),
        comments: document.getElementById('fetchComments'),
        albums: document.getElementById('fetchAlbums'),
        photos: document.getElementById('fetchPhotos'),
        todos: document.getElementById('fetchTodos'),
        users: document.getElementById('fetchUsers')
    }
};

Notiflix.Notify.init({
    position: 'right-top',
    timeout: 3000,
    cssAnimation: true,
    cssAnimationStyle: 'fade',
});

const handleError = (error) => {
    console.error('Error:', error);
    Notiflix.Notify.failure('Помилка при завантаженні даних. Спробуйте пізніше.');
};

const fetchData = async (endpoint, page = 1, limit = 5) => {
    try {
        Notiflix.Loading.circle('Завантаження...');
        
        const url = `${apiConfig.baseUrl}${apiConfig.endpoints[endpoint]}?_page=${page}&_limit=${limit}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const totalCountHeader = response.headers.get('x-total-count');
        const totalItems = totalCountHeader ? parseInt(totalCountHeader) : apiConfig.limits[endpoint];
        
        const data = await response.json();
        
        Notiflix.Loading.remove();
        Notiflix.Notify.success(`Успішно завантажено ${data.length} елементів.`);
        
        return { data, totalItems };
    } catch (error) {
        Notiflix.Loading.remove();
        handleError(error);
        return { data: [], totalItems: 0 };
    }
};

const renderData = (data, endpoint) => {
    elements.dataContainer.innerHTML = '';
    
    if (data.length === 0) {
        elements.dataContainer.innerHTML = `
            <div class="placeholder-message">
                <i class='bx bx-data bx-lg'></i>
                <p>Немає даних для відображення.</p>
            </div>
        `;
        return;
    }
    
    data.forEach(item => {
        const dataItem = document.createElement('div');
        dataItem.classList.add('data-item');
        
        switch(endpoint) {
            case 'posts':
                dataItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.body}</p>
                    <p><strong>ID пользователя:</strong> ${item.userId}</p>
                    <p><strong>ID поста:</strong> ${item.id}</p>
                `;
                break;
            case 'comments':
                dataItem.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>${item.body}</p>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>ID поста:</strong> ${item.postId}</p>
                    <p><strong>ID комментария:</strong> ${item.id}</p>
                `;
                break;
            case 'albums':
                dataItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <p><strong>ID пользователя:</strong> ${item.userId}</p>
                    <p><strong>ID альбома:</strong> ${item.id}</p>
                `;
                break;
            case 'photos':
                dataItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <img src="${item.thumbnailUrl}" alt="${item.title}">
                    <p><strong>ID альбома:</strong> ${item.albumId}</p>
                    <p><strong>ID фото:</strong> ${item.id}</p>
                `;
                break;
            case 'todos':
                dataItem.innerHTML = `
                    <h3>${item.title}</h3>
                    <p><strong>Статус:</strong> ${item.completed ? 'Завершено' : 'Не завершено'}</p>
                    <p><strong>ID пользователя:</strong> ${item.userId}</p>
                    <p><strong>ID задачи:</strong> ${item.id}</p>
                `;
                break;
            case 'users':
                dataItem.innerHTML = `
                    <h3>${item.name}</h3>
                    <p><strong>Email:</strong> ${item.email}</p>
                    <p><strong>Имя пользователя:</strong> ${item.username}</p>
                    <p><strong>Компания:</strong> ${item.company.name}</p>
                    <p><strong>ID пользователя:</strong> ${item.id}</p>
                `;
                break;
        }
        
        elements.dataContainer.appendChild(dataItem);
    });
};

const renderPagination = (currentPage, totalItems, itemsPerPage) => {
    elements.paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="bx bx-chevron-left"></i> Попередня';
        prevButton.addEventListener('click', () => loadPage(currentPage - 1));
        elements.paginationContainer.appendChild(prevButton);
    }
    
    const pageInfo = document.createElement('span');
    pageInfo.innerHTML = `<span class="page-number">${currentPage}</span> / ${totalPages}`;
    pageInfo.style.margin = '0 10px';
    elements.paginationContainer.appendChild(pageInfo);
    
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        if (currentPage === 1) {
            nextButton.innerHTML = 'FETCH MORE <i class="bx bx-chevron-right"></i>';
        } else {
            nextButton.innerHTML = 'Наступна <i class="bx bx-chevron-right"></i>';
        }
        nextButton.addEventListener('click', () => loadPage(currentPage + 1));
        elements.paginationContainer.appendChild(nextButton);
    }
};

const loadPage = async (page) => {
    if (!state.currentEndpoint) {
        Notiflix.Notify.info('Будь ласка, виберіть колекцію для завантаження даних.');
        return;
    }
    
    state.currentPage = page;
    
    const { data, totalItems } = await fetchData(
        state.currentEndpoint, 
        state.currentPage, 
        state.itemsPerPage
    );
    
    state.data = data;
    state.totalItems = totalItems;
    
    renderData(state.data, state.currentEndpoint);
    renderPagination(state.currentPage, state.totalItems, state.itemsPerPage);
};

const loadEndpointData = async (endpoint) => {
    const itemsPerPage = parseInt(elements.itemCountInput.value);
    if (isNaN(itemsPerPage) || itemsPerPage < 1) {
        Notiflix.Notify.warning('Кількість елементів повинна бути більше 0.');
        elements.itemCountInput.value = state.itemsPerPage;
        return;
    }
    
    state.currentEndpoint = endpoint;
    state.currentPage = 1;
    state.itemsPerPage = itemsPerPage;
    
    await loadPage(1);
};

Object.keys(elements.buttons).forEach(endpoint => {
    elements.buttons[endpoint].addEventListener('click', () => loadEndpointData(endpoint));
});

elements.itemCountInput.addEventListener('input', () => {
    if (elements.itemCountInput.value === '') {
        elements.itemCountInput.value = '5';
    }
});

elements.itemCountInput.addEventListener('blur', () => {
    const value = parseInt(elements.itemCountInput.value);
    if (isNaN(value) || value < 1) {
        Notiflix.Notify.warning('Поле не може бути порожнім і значення повинно бути більше 0.');
        elements.itemCountInput.value = '5';
    } else if (value > 100) {
        Notiflix.Notify.warning('Максимальна кількість елементів - 100.');
        elements.itemCountInput.value = '100';
    }
}); 