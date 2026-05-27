import './style.css'

const API_URL = 'http://127.0.0.1:8000/tasks';

// Referencias al DOM
const taskForm = document.getElementById('task-form') as HTMLFormElement;
const tasksContainer = document.getElementById('tasks-container') as HTMLElement;
const summaryPanel = document.getElementById('summary-panel') as HTMLElement;
const filterEstado = document.getElementById('filter-estado') as HTMLSelectElement;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    fetchSummary();
});

// Obtener y renderizar tareas
async function fetchTasks(estadoFiltro: string = '') {
    let url = API_URL;
    if (estadoFiltro) {
        url += `?estado=${estadoFiltro}`;
    }
    
    try {
        const response = await fetch(url);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error("Error al obtener tareas:", error);
    }
}

// Renderizar las tareas en el HTML
function renderTasks(tasks: any[]) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-sm text-stone-500 text-center py-8">No hay tareas registradas.</p>';
        return;
    }

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <div class="flex items-center space-x-2 mb-1">
                    <h3 class="font-medium text-stone-800">${task.titulo}</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">${task.estado}</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">Prioridad: ${task.prioridad}</span>
                </div>
                <p class="text-sm text-stone-500">${task.descripcion}</p>
                <div class="text-xs text-stone-400 mt-2 flex space-x-4">
                    <span>📚 ${task.asignatura}</span>
                    <span>📅 Entrega: ${task.fecha_entrega}</span>
                </div>
            </div>
            <button onclick="deleteTask(${task.id})" class="text-red-400 hover:text-red-600 text-sm transition">Eliminar</button>
        `;
        tasksContainer.appendChild(div);
    });
}

// Obtener y renderizar resumen
async function fetchSummary() {
    try {
        const response = await fetch(`${API_URL}/summary`);
        const summary = await response.json();
        
        summaryPanel.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-stone-100 text-center">
                <p class="text-2xl font-light text-stone-800">${summary.total_tareas}</p>
                <p class="text-xs text-stone-500 uppercase tracking-wide">Total</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border border-stone-100 text-center">
                <p class="text-2xl font-light text-stone-800">${summary.tareas_pendientes}</p>
                <p class="text-xs text-stone-500 uppercase tracking-wide">Pendientes</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border border-stone-100 text-center">
                <p class="text-2xl font-light text-stone-800">${summary.tareas_finalizadas}</p>
                <p class="text-xs text-stone-500 uppercase tracking-wide">Finalizadas</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-sm border border-stone-100 text-center">
                <p class="text-2xl font-light text-stone-800">${summary.tareas_alta_prioridad}</p>
                <p class="text-xs text-stone-500 uppercase tracking-wide">Alta Prioridad</p>
            </div>
        `;
    } catch (error) {
        console.error("Error al obtener resumen:", error);
    }
}

// Crear nueva tarea
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newTask = {
        titulo: (document.getElementById('titulo') as HTMLInputElement).value,
        descripcion: (document.getElementById('descripcion') as HTMLTextAreaElement).value,
        asignatura: (document.getElementById('asignatura') as HTMLInputElement).value,
        fecha_entrega: (document.getElementById('fecha_entrega') as HTMLInputElement).value,
        prioridad: (document.getElementById('prioridad') as HTMLSelectElement).value,
        estado: (document.getElementById('estado') as HTMLSelectElement).value,
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
        
        taskForm.reset();
        fetchTasks();
        fetchSummary();
    } catch (error) {
        console.error("Error al crear tarea:", error);
    }
});

// Eliminar tarea (Debe estar en el ámbito global para el onclick del HTML)
(window as any).deleteTask = async (id: number) => {
    if(confirm('¿Estás seguro de eliminar esta tarea?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchTasks();
            fetchSummary();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

// Filtro por estado
filterEstado.addEventListener('change', (e) => {
    const estado = (e.target as HTMLSelectElement).value;
    fetchTasks(estado);
});