function renderSummaryCards(productos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalProductos = productos.length;
  const totalUnidades = productos.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
  const stockBajo = productos.filter((item) => Number(item.cantidad) > 0 && Number(item.cantidad) <= Number(item.stockMinimo || 0)).length;
  const agotados = productos.filter((item) => Number(item.cantidad) <= 0).length;

  container.innerHTML = `
    <article class="card stat-card"><span>Total productos</span><strong>${totalProductos}</strong></article>
    <article class="card stat-card"><span>Total unidades</span><strong>${totalUnidades}</strong></article>
    <article class="card stat-card"><span>Stock bajo</span><strong>${stockBajo}</strong></article>
    <article class="card stat-card"><span>Agotados</span><strong>${agotados}</strong></article>
  `;
}

function renderInventoryTable(productos, tableBodyId, actions = true) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;

  if (!productos.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">No hay productos para mostrar.</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map((producto) => {
    const stock = getStockStatus(producto);
    return `
      <tr>
        <td>${producto.codigo}</td>
        <td>${producto.nombre}</td>
        <td>${producto.categoria || '-'}</td>
        <td>${producto.cantidad}</td>
        <td>${formatCurrency(producto.precio)}</td>
        <td><span class="${stock.className}">${stock.label}</span></td>
        <td>${buildLocationText(producto.ubicacion)}</td>
        <td>
          ${actions ? `
            <div class="table-actions">
              <button class="btn small" data-action="edit" data-id="${producto.id}">Editar</button>
              <button class="btn small secondary" data-action="stock" data-id="${producto.id}">+ Stock</button>
              <button class="btn small danger" data-action="delete" data-id="${producto.id}">Eliminar</button>
            </div>` : '<span class="muted">Consulta</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

function renderCustomerProducts(productos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!productos.length) {
    container.innerHTML = '<p class="empty">No hay productos disponibles con esos filtros.</p>';
    return;
  }

  container.innerHTML = productos.map((producto) => {
    const stock = getStockStatus(producto);
    return `
      <article class="card product-card">
        <div>
          <p class="muted">${producto.codigo}</p>
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
        </div>
        <div class="product-meta">
          <span><strong>Categoría:</strong> ${producto.categoria}</span>
          <span><strong>Precio:</strong> ${formatCurrency(producto.precio)}</span>
          <span><strong>Disponible:</strong> ${producto.cantidad}</span>
          <span><strong>Ubicación:</strong> ${buildLocationText(producto.ubicacion)}</span>
          <span class="${stock.className}">${stock.label}</span>
        </div>
        <div class="product-actions">
          <input type="number" min="1" max="${producto.cantidad}" value="1" id="qty-${producto.id}" ${producto.cantidad <= 0 ? 'disabled' : ''} />
          <button class="btn" data-action="add-cart" data-id="${producto.id}" ${producto.cantidad <= 0 ? 'disabled' : ''}>Agregar al carrito</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderCart(containerId, totalId) {
  const container = document.getElementById(containerId);
  const totalEl = document.getElementById(totalId);
  if (!container) return;

  const cart = compraService.getCart();
  if (!cart.length) {
    container.innerHTML = '<p class="empty">El carrito está vacío.</p>';
    if (totalEl) totalEl.textContent = formatCurrency(0);
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((item) => {
    const subtotal = Number(item.precio) * Number(item.cantidad);
    total += subtotal;
    return `
      <div class="cart-item">
        <div>
          <strong>${item.nombre}</strong>
          <p>${item.codigo}</p>
        </div>
        <div>
          <input type="number" min="1" value="${item.cantidad}" data-action="cart-qty" data-id="${item.productoId}" />
        </div>
        <div>${formatCurrency(subtotal)}</div>
        <button class="btn small danger" data-action="remove-cart" data-id="${item.productoId}">Quitar</button>
      </div>
    `;
  }).join('');

  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function renderMovements(tableBodyId, limit = null) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;
  let movimientos = movimientoService.getAll();
  if (limit) movimientos = movimientos.slice(0, limit);

  if (!movimientos.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">No hay movimientos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = movimientos.map((mov) => `
    <tr>
      <td>${mov.tipo}</td>
      <td>${mov.codigoProducto}</td>
      <td>${mov.nombreProducto}</td>
      <td>${mov.cantidad}</td>
      <td>${mov.usuario}</td>
      <td>${mov.detalle}</td>
      <td>${formatDate(mov.fecha)}</td>
    </tr>
  `).join('');
}

window.renderSummaryCards = renderSummaryCards;
window.renderInventoryTable = renderInventoryTable;
window.renderCustomerProducts = renderCustomerProducts;
window.renderCart = renderCart;
window.renderMovements = renderMovements;
