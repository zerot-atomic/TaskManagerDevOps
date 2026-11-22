const API = '/tasks';

const ESTADOS = { pendiente: 'Pendiente', en_proceso: 'En proceso', terminada: 'Terminada' };
const PRIORIDADES = { alta: 'Alta', media: 'Media', baja: 'Baja' };

const form = document.getElementById('task-form');
const idInput = document.getElementById('task-id');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const statusInput = document.getElementById('status');
const titleError = document.getElementById('title-error');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const list = document.getElementById('task-list');
const empty = document.getElementById('empty');
const count = document.getElementById('count');
const filter = document.getElementById('filter-status');
const toast = document.getElementById('toast');

let tasks = [];

// ---------- Utilidades ----------
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(msg || `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- RF02: Consultar tareas ----------
async function loadTasks() {
  try {
    tasks = await request(API);
    render();
  } catch (err) {
    showToast('No se pudieron cargar las tareas: ' + err.message, true);
  }
}

function render() {
  const visible = filter.value ? tasks.filter((t) => t.status === filter.value) : tasks;
  count.textContent = visible.length;
  empty.hidden = visible.length > 0;

  list.innerHTML = visible
    .map(
      (t) => `
      <li class="task ${t.priority} ${t.status}">
        <div class="task-top">
          <span class="task-title">${escapeHtml(t.title)}</span>
          <span class="badge ${t.priority}">${PRIORIDADES[t.priority]}</span>
        </div>
        ${t.description ? `<p class="task-desc">${escapeHtml(t.description)}</p>` : ''}
        <div class="task-meta">Creada: ${new Date(t.createdAt).toLocaleString('es-MX')}</div>
        <div class="task-bottom">
          <select data-action="status" data-id="${t.id}" aria-label="Cambiar estado">
            ${Object.entries(ESTADOS)
              .map(([v, l]) => `<option value="${v}" ${t.status === v ? 'selected' : ''}>${l}</option>`)
              .join('')}
          </select>
          <div class="task-buttons">
            <button class="btn small" data-action="edit" data-id="${t.id}">Editar</button>
            <button class="btn small danger" data-action="delete" data-id="${t.id}">Eliminar</button>
          </div>
        </div>
      </li>`,
    )
    .join('');
}

// ---------- RF01 / RF03: Registrar y editar ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = 'El nombre de la tarea es obligatorio.';
    titleInput.classList.add('invalid');
    titleInput.focus();
    return;
  }
  titleError.textContent = '';
  titleInput.classList.remove('invalid');

  const data = {
    title,
    description: descInput.value.trim(),
    priority: priorityInput.value,
    status: statusInput.value,
  };

  try {
    if (idInput.value) {
      await request(`${API}/${idInput.value}`, { method: 'PUT', body: JSON.stringify(data) });
      showToast('Tarea actualizada correctamente');
    } else {
      await request(API, { method: 'POST', body: JSON.stringify(data) });
      showToast('Tarea registrada correctamente');
    }
    resetForm();
    loadTasks();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
});

function startEdit(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  idInput.value = t.id;
  titleInput.value = t.title;
  descInput.value = t.description ?? '';
  priorityInput.value = t.priority;
  statusInput.value = t.status;
  formTitle.textContent = 'Editar tarea';
  submitBtn.textContent = 'Actualizar tarea';
  cancelBtn.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  titleInput.focus();
}

function resetForm() {
  form.reset();
  idInput.value = '';
  titleError.textContent = '';
  titleInput.classList.remove('invalid');
  formTitle.textContent = 'Nueva tarea';
  submitBtn.textContent = 'Guardar tarea';
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener('click', resetForm);

// ---------- RF04: Eliminar / RF05: Cambiar estado ----------
list.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'edit') startEdit(id);

  if (action === 'delete') {
    const t = tasks.find((x) => x.id === id);
    if (!confirm(`¿Eliminar la tarea "${t?.title}"?`)) return;
    try {
      await request(`${API}/${id}`, { method: 'DELETE' });
      showToast('Tarea eliminada');
      if (idInput.value === id) resetForm();
      loadTasks();
    } catch (err) {
      showToast('Error: ' + err.message, true);
    }
  }
});

list.addEventListener('change', async (e) => {
  const sel = e.target.closest('select[data-action="status"]');
  if (!sel) return;
  try {
    await request(`${API}/${sel.dataset.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: sel.value }),
    });
    showToast(`Estado cambiado a "${ESTADOS[sel.value]}"`);
    loadTasks();
  } catch (err) {
    showToast('Error: ' + err.message, true);
  }
});

filter.addEventListener('change', render);

loadTasks();
