import './style.css'

const API_URL = 'http://127.0.0.1:8000/tasks';

const taskForm = document.getElementById('task-form') as HTMLFormElement;
const tasksContainer = document.getElementById('tasks-container') as HTMLElement;
const summaryPanel = document.getElementById('summary-panel') as HTMLElement;
const filterEstado = document.getElementById('filter-estado') as HTMLSelectElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

let currentTasks: any[] = [];
let editingTaskId: number | null = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    fetchSummary();
});

async function fetchTasks(estadoFiltro: string = '') {
    let url = API_URL;
    if (estadoFiltro) url += `?estado=${estadoFiltro}`;
    
    try {
        const response = await fetch(url);
        currentTasks = await response.json();
        renderTasks(currentTasks);
    } catch (error) {
        console.error("Error al obtener tareas:", error);
    }
}

function renderTasks(tasks: any[]) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-sm text-stone-500 text-center py-8">No hay tareas registradas.</p>';
        return;
    }

    tasks.forEach(task => {
        // Colores suaves para los estados
        let statusClass = 'bg-stone-100 text-stone-600 border-stone-200';
        if (task.estado.toLowerCase() === 'pendiente') statusClass = 'bg-amber-50 text-amber-600 border-amber-200';
        if (task.estado.toLowerCase() === 'en proceso') statusClass = 'bg-blue-50 text-blue-600 border-blue-200';
        if (task.estado.toLowerCase() === 'finalizada') statusClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';

        // Colores suaves y tenues para todas las prioridades
        let priorityClass = 'bg-stone-100 text-stone-600 border-stone-200';
        if (task.prioridad.toLowerCase() === 'alta') priorityClass = 'bg-red-50 text-red-500 border-red-200';
        if (task.prioridad.toLowerCase() === 'media') priorityClass = 'bg-sky-50 text-sky-600 border-sky-200';
        if (task.prioridad.toLowerCase() === 'baja') priorityClass = 'bg-zinc-100 text-zinc-500 border-zinc-200';

        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <div class="flex items-center space-x-2 mb-1">
                    <h3 class="font-medium text-stone-800">${task.titulo}</h3>
                    <span class="text-xs px-2 py-0.5 rounded border ${statusClass}">${task.estado}</span>
                    <span class="text-xs px-2 py-0.5 rounded border ${priorityClass}">Prioridad: ${task.prioridad}</span>
                </div>
                <p class="text-sm text-stone-500">${task.descripcion}</p>
                <div class="text-xs text-stone-400 mt-2 flex space-x-4">
                    <span>📚 ${task.asignatura}</span>
                    <span>📅 Entrega: ${task.fecha_entrega}</span>
                </div>
            </div>
            <div class="flex flex-col space-y-2 text-right ml-4">
                <button onclick="editTask(${task.id})" class="text-indigo-400 hover:text-indigo-600 text-sm transition">Editar</button>
                <button onclick="deleteTask(${task.id})" class="text-red-400 hover:text-red-600 text-sm transition">Eliminar</button>
            </div>
        `;
        tasksContainer.appendChild(div);
    });
}

async function fetchSummary() {
    try {
        const response = await fetch(`${API_URL}/summary`);
        const summary = await response.json();
        
        summaryPanel.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-stone-100 text-center">
                <p class="text-2xl font-light text-stone-800">${summary.total_tareas}</p>
                <p class="text-xs text-stone-500 uppercase tracking-wide">Total</p>
            </div>
            <div class="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100 text-center">
                <p class="text-2xl font-light text-amber-700">${summary.tareas_pendientes}</p>
                <p class="text-xs text-amber-600 uppercase tracking-wide">Pendientes</p>
            </div>
            <div class="bg-emerald-50 p-4 rounded-lg shadow-sm border border-emerald-100 text-center">
                <p class="text-2xl font-light text-emerald-700">${summary.tareas_finalizadas}</p>
                <p class="text-xs text-emerald-600 uppercase tracking-wide">Finalizadas</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 text-center">
                <p class="text-2xl font-light text-red-700">${summary.tareas_alta_prioridad}</p>
                <p class="text-xs text-red-600 uppercase tracking-wide">Alta Prioridad</p>
            </div>
        `;
    } catch (error) {
        console.error("Error al obtener resumen:", error);
    }
}

(window as any).editTask = (id: number) => {
    const task = currentTasks.find(t => t.id === id);
    if (task) {
        (document.getElementById('titulo') as HTMLInputElement).value = task.titulo;
        (document.getElementById('descripcion') as HTMLTextAreaElement).value = task.descripcion;
        (document.getElementById('asignatura') as HTMLInputElement).value = task.asignatura;
        (document.getElementById('fecha_entrega') as HTMLInputElement).value = task.fecha_entrega;
        (document.getElementById('prioridad') as HTMLSelectElement).value = task.prioridad.toLowerCase();
        (document.getElementById('estado') as HTMLSelectElement).value = task.estado.toLowerCase();
        
        editingTaskId = id;
        submitBtn.textContent = 'Actualizar Tarea';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

function resetForm() {
    taskForm.reset();
    editingTaskId = null;
    submitBtn.textContent = 'Registrar Tarea';
    cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        titulo: (document.getElementById('titulo') as HTMLInputElement).value,
        descripcion: (document.getElementById('descripcion') as HTMLTextAreaElement).value,
        asignatura: (document.getElementById('asignatura') as HTMLInputElement).value,
        fecha_entrega: (document.getElementById('fecha_entrega') as HTMLInputElement).value,
        prioridad: (document.getElementById('prioridad') as HTMLSelectElement).value,
        estado: (document.getElementById('estado') as HTMLSelectElement).value,
    };

    const method = editingTaskId ? 'PUT' : 'POST';
    const url = editingTaskId ? `${API_URL}/${editingTaskId}` : API_URL;

    try {
        await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        resetForm();
        fetchTasks();
        fetchSummary();
    } catch (error) {
        console.error("Error al guardar tarea:", error);
    }
});

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

filterEstado.addEventListener('change', (e) => {
    const estado = (e.target as HTMLSelectElement).value;
    fetchTasks(estado);
});