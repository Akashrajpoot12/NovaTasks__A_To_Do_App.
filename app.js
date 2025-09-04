// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const categoryInput = document.getElementById('categoryInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const focusModeBtn = document.getElementById('focusModeBtn');
const aiSuggestion = document.getElementById('aiSuggestion');
const aiText = document.getElementById('aiText');
const submitBtn = document.getElementById('submitBtn');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Format Date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

// Render Tasks
function renderTasks(filteredTasks = tasks) {
  taskList.innerHTML = '';
  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `p-4 hover:bg-gray-50 dark:hover:bg-gray-750/40 transition-all duration-300 group flex items-center gap-3 border-b dark:border-gray-700/50 ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const priorityColor = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' }[task.priority];

    li.innerHTML = `
      <input type="checkbox" class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer" ${task.completed ? 'checked' : ''}>
      <span class="flex-grow cursor-text font-medium text-gray-800 dark:text-gray-200" contenteditable="false">${task.text}</span>
      <span class="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">${task.category}</span>
      <i class="fas fa-star ${priorityColor} text-xs"></i>
      ${task.dueDate ? `<span class="text-xs text-gray-500 dark:text-gray-400">${formatDate(task.dueDate)}</span>` : ''}
      <button class="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-transform duration-200 scale-90 hover:scale-110">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    // Toggle completion
    li.querySelector('input').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      if (task.completed) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4c1d95', '#7c3aed', '#ec4899', '#f59e0b']
        });
      }
    });

    // Edit task
    const textSpan = li.querySelector('span:nth-child(2)');
    textSpan.addEventListener('click', () => {
      if (document.querySelector('[contenteditable="true"]')) return;
      textSpan.contentEditable = true;
      textSpan.focus();
    });

    textSpan.addEventListener('blur', () => {
      const newText = textSpan.innerText.trim();
      if (newText) {
        tasks = tasks.map(t => t.id === task.id ? { ...t, text: newText } : t);
        saveTasks();
      }
      textSpan.contentEditable = false;
    });

    textSpan.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textSpan.blur();
      }
    });

    // Delete task
    li.querySelector('button').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      suggestAI();
    });

    taskList.appendChild(li);
  });
}

// Add Task with Feedback
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  // Button Animation
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  }, 600);

  const newTask = {
    id: Date.now(),
    text,
    dueDate: dueDateInput.value || null,
    priority: priorityInput.value,
    category: categoryInput.value,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  suggestAI();

  // Reset form
  taskInput.value = '';
  dueDateInput.value = '';
});

// Search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = tasks.filter(t => t.text.toLowerCase().includes(query));
  renderTasks(filtered);
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const icon = themeToggle.querySelector('i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Focus Mode
focusModeBtn.addEventListener('click', () => {
  const incomplete = tasks.filter(t => !t.completed);
  if (incomplete.length === 0) {
    alert('🎉 All tasks completed! Great job!');
    return;
  }
  const nextTask = incomplete[0];
  document.body.innerHTML = `
    <div class="focus-mode">
      <h1>${nextTask.text}</h1>
      <p class="text-lg opacity-90">Category: ${nextTask.category}</p>
      <button>Exit Focus Mode</button>
    </div>
  `;
});

// Load on Start
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }
  renderTasks();
  suggestAI();

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(e => console.log('SW failed:', e));
  }
});