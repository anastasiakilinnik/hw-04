const apiConfig = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    todosEndpoint: '/todos'
};

const state = {
    tasks: [],
    filter: 'all' 
};

const elements = {
    todoList: document.getElementById('todoList'),
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    statusMessage: document.getElementById('statusMessage'),
    filters: {
        all: document.getElementById('filterAll'),
        active: document.getElementById('filterActive'),
        completed: document.getElementById('filterCompleted')
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
    Notiflix.Notify.failure('Помилка при виконанні операції. Спробуйте пізніше.');
};

const api = {
    fetchTasks: async () => {
        try {
            Notiflix.Loading.circle('Завантаження завдань...');
            
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.todosEndpoint}?_limit=10`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            Notiflix.Loading.remove();
            Notiflix.Notify.success('Завдання успішно завантажені.');
            
            return data;
        } catch (error) {
            Notiflix.Loading.remove();
            handleError(error);
            return [];
        }
    },
    
    addTask: async (task) => {
        try {
            Notiflix.Loading.circle('Додавання завдання...');
            
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.todosEndpoint}`, {
                method: 'POST',
                body: JSON.stringify(task),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            Notiflix.Loading.remove();
            Notiflix.Notify.success('Завдання успішно додано.');
            
            return data;
        } catch (error) {
            Notiflix.Loading.remove();
            handleError(error);
            return null;
        }
    },
    
    deleteTask: async (id) => {
        try {
            Notiflix.Loading.circle('Видалення завдання...');
            
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.todosEndpoint}/${id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            Notiflix.Loading.remove();
            Notiflix.Notify.success('Завдання успішно видалено.');
            
            return true;
        } catch (error) {
            Notiflix.Loading.remove();
            handleError(error);
            return false;
        }
    },
    
    updateTask: async (id, updates) => {
        try {
            Notiflix.Loading.circle('Оновлення завдання...');
            
            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.todosEndpoint}/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            Notiflix.Loading.remove();
            Notiflix.Notify.success('Завдання успішно оновлено.');
            
            return data;
        } catch (error) {
            Notiflix.Loading.remove();
            handleError(error);
            return null;
        }
    }
};

const ui = {
    renderTasks: () => {
        elements.todoList.innerHTML = '';
        
        if (state.tasks.length === 0) {
            elements.statusMessage.innerHTML = `
                <i class='bx bx-info-circle'></i>
                Немає завдань для відображення.
            `;
            return;
        }
        
        elements.statusMessage.textContent = '';
        
        const filteredTasks = state.tasks.filter(task => {
            if (state.filter === 'all') return true;
            if (state.filter === 'active') return !task.completed;
            if (state.filter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            elements.statusMessage.innerHTML = `
                <i class='bx bx-info-circle'></i>
                Немає ${state.filter === 'active' ? 'активних' : 'завершених'} завдань.
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('todo-item');
            if (task.completed) {
                li.classList.add('completed');
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => ui.toggleTaskStatus(task.id));
            
            const text = document.createElement('span');
            text.textContent = task.title;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.title = "Видалити завдання";
            deleteBtn.setAttribute('aria-label', 'Видалити завдання');
            deleteBtn.addEventListener('click', () => ui.deleteTask(task.id));
            
            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);
            
            elements.todoList.appendChild(li);
        });
    },
    
    toggleTaskStatus: async (id) => {
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;
        
        const updatedTask = await api.updateTask(id, { completed: !task.completed });
        
        if (updatedTask) {
            state.tasks = state.tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
            ui.renderTasks();
        }
    },
    
    addTask: async () => {
        const title = elements.taskInput.value.trim();
        
        if (!title) {
            Notiflix.Notify.warning('Будь ласка, введіть текст завдання.');
            return;
        }
        
        const newTask = {
            title,
            completed: false,
            userId: 1
        };
        
        const addedTask = await api.addTask(newTask);
        
        if (addedTask) {
            state.tasks.unshift({...addedTask});
            
            elements.taskInput.value = '';
            ui.renderTasks();
        }
    },
    
    deleteTask: async (id) => {
        const success = await api.deleteTask(id);
        
        if (success) {
            state.tasks = state.tasks.filter(task => task.id !== id);
            ui.renderTasks();
        }
    },
    
    changeFilter: (filter) => {
        state.filter = filter;
        
        Object.keys(elements.filters).forEach(key => {
            if (key === filter) {
                elements.filters[key].classList.add('active');
            } else {
                elements.filters[key].classList.remove('active');
            }
        });
        
        ui.renderTasks();
    }
};

const init = async () => {
    state.tasks = await api.fetchTasks();
    
    ui.renderTasks();
    
    elements.addTaskBtn.addEventListener('click', ui.addTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ui.addTask();
        }
    });
    
    elements.filters.all.addEventListener('click', () => ui.changeFilter('all'));
    elements.filters.active.addEventListener('click', () => ui.changeFilter('active'));
    elements.filters.completed.addEventListener('click', () => ui.changeFilter('completed'));
};

document.addEventListener('DOMContentLoaded', init); 