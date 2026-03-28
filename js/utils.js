function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-CO');
}

function buildLocationText(ubicacion = {}) {
  const parts = [ubicacion.bodega, ubicacion.zona, ubicacion.torre, ubicacion.estanteria, ubicacion.modulo, ubicacion.posicion].filter(Boolean);
  return parts.join(' / ');
}

function getStockStatus(producto) {
  const cantidad = Number(producto.cantidad || 0);
  const minimo = Number(producto.stockMinimo || 0);
  if (cantidad <= 0) return { label: 'Agotado', className: 'badge danger' };
  if (cantidad <= minimo) return { label: 'Stock bajo', className: 'badge warning' };
  return { label: 'Disponible', className: 'badge success' };
}

function getNextId(items = []) {
  return items.length ? Math.max(...items.map((item) => Number(item.id || 0))) + 1 : 1;
}

function showMessage(elementId, message, type = 'info') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = `message ${type}`;
  el.textContent = message;
  el.hidden = false;
  setTimeout(() => {
    el.hidden = true;
  }, 3500);
}

function requireSession(allowedRoles = []) {
  const session = storage.get(STORAGE_KEYS.sesion);
  if (!session) {
    window.location.href = './index.html';
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(session.rol)) {
    window.location.href = session.rol === 'ADMIN' ? './admin.html' : './cliente.html';
    return null;
  }

  return session;
}

function logout() {
  storage.remove(STORAGE_KEYS.sesion);
  storage.remove(STORAGE_KEYS.carrito);
  window.location.href = './index.html';
}

window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.buildLocationText = buildLocationText;
window.getStockStatus = getStockStatus;
window.getNextId = getNextId;
window.showMessage = showMessage;
window.requireSession = requireSession;
window.logout = logout;
