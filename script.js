// 任务管理器类
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingTask = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    // 初始化DOM元素
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addBtn = document.getElementById('addBtn');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
    }

    // 绑定事件
    bindEvents() {
        // 添加任务
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 过滤器
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // 排序
        this.sortSelect.addEventListener('change', () => {
            this.currentSort = this.sortSelect.value;
            this.renderTasks();
        });

        // 输入框实时验证
        this.taskInput.addEventListener('input', () => {
            this.validateInput();
        });
    }

    // 输入验证
    validateInput() {
        const value = this.taskInput.value.trim();
        if (value.length === 0) {
            this.addBtn.disabled = true;
            this.addBtn.style.opacity = '0.6';
        } else {
            this.addBtn.disabled = false;
            this.addBtn.style.opacity = '1';
        }
    }

    // 添加任务
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        if (this.editingTask) {
            // 编辑模式
            this.editingTask.text = text;
            this.editingTask.priority = this.prioritySelect.value;
            this.editingTask = null;
            this.addBtn.innerHTML = '<i class="fas fa-plus"></i> 添加';
        } else {
            // 新增模式
            const task = {
                id: Date.now(),
                text,
                priority: this.prioritySelect.value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.tasks.unshift(task);
        }

        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.validateInput();

        // 添加成功反馈
        this.showNotification('任务添加成功！');
    }

    // 切换任务完成状态
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? '任务已完成！' : '任务标记为未完成';
            this.showNotification(message);
        }
    }

    // 编辑任务
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.taskInput.value = task.text;
            this.prioritySelect.value = task.priority;
            this.editingTask = task;
            this.addBtn.innerHTML = '<i class="fas fa-save"></i> 保存';
            this.taskInput.focus();
        }
    }

    // 删除任务
    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            const taskElement = document.querySelector(`[data-id="${id}"]`);
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('任务已删除');
            }, 300);
        }
    }

    // 设置过滤器
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTasks();
    }

    // 获取过滤后的任务
    getFilteredTasks() {
        let filtered = [...this.tasks];

        // 应用过滤器
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
        }

        // 应用排序
        switch (this.currentSort) {
            case 'date':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                filtered.sort((a, b) => a.text.localeCompare(b.text));
                break;
        }

        return filtered;
    }

    // 渲染任务列表
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.tasksList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.tasksList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        }
    }

    // 创建任务HTML
    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const checkedClass = task.completed ? 'checked' : '';
        const createdDate = new Date(task.createdAt).toLocaleDateString('zh-CN');
        const createdTime = new Date(task.createdAt).toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="task-item ${completedClass}" data-id="${task.id}">
                <div class="task-checkbox ${checkedClass}" onclick="taskManager.toggleTask(${task.id})">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${priorityClass}">${this.getPriorityText(task.priority)}</span>
                        <span class="task-date"><i class="far fa-clock"></i> ${createdDate} ${createdTime}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="taskManager.editTask(${task.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="taskManager.deleteTask(${task.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 获取优先级文本
    getPriorityText(priority) {
        const texts = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };
        return texts[priority] || '中优先级';
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 更新统计信息
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        this.animateNumber(this.totalTasksEl, totalTasks);
        this.animateNumber(this.completedTasksEl, completedTasks);
    }

    // 数字动画
    animateNumber(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        const increment = targetNumber > currentNumber ? 1 : -1;
        
        if (currentNumber !== targetNumber) {
            element.textContent = currentNumber + increment;
            setTimeout(() => this.animateNumber(element, targetNumber), 50);
        }
    }

    // 显示通知
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: 500;
            transform: translateX(300px);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(300px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 保存到本地存储
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // 导出数据
    exportData() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('数据导出成功！');
    }

    // 导入数据
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                        this.tasks = data.tasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.updateStats();
                        this.showNotification('数据导入成功！');
                    }
                }
            } catch (error) {
                this.showNotification('数据格式错误，导入失败！');
            }
        };
        reader.readAsText(file);
    }

    // 清空所有数据
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('所有数据已清空');
        }
    }
}

// 初始化应用
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 快速添加任务
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            taskManager.addTask();
        }
        
        // Escape 取消编辑
        if (e.key === 'Escape' && taskManager.editingTask) {
            taskManager.editingTask = null;
            taskManager.taskInput.value = '';
            taskManager.prioritySelect.value = 'medium';
            taskManager.addBtn.innerHTML = '<i class="fas fa-plus"></i> 添加';
        }
    });
    
    // 添加右键菜单（可选功能）
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // 这里可以添加自定义右键菜单
    });
});

// 检查本地存储支持
if (typeof Storage === "undefined") {
    alert('您的浏览器不支持本地存储功能，数据将不会被保存。');
}

// PWA 支持检测
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 这里可以注册 Service Worker
        console.log('PWA 支持已就绪');
    });
}