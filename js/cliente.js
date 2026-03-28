document.addEventListener('DOMContentLoaded', async () => {
  if (!document.body.classList.contains('page-client')) return;
  await initializeAppData();
  const session = requireSession(['CLIENTE']);
  if (!session) return;

  document.getElementById('currentClient').textContent = `${session.nombre} (${session.rol})`;

  const searchInput = document.getElementById('clientSearchInput');
  const categoryFilter = document.getElementById('clientCategoryFilter');
  const bodegaFilter = document.getElementById('clientBodegaFilter');

  function fillFilters(productos) {
    const categorias = [...new Set(productos.map((item) => item.categoria).filter(Boolean))];
    const bodegas = [...new Set(productos.map((item) => item.ubicacion?.bodega).filter(Boolean))];

    categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + categorias.map((item) => `<option value="${item}">${item}</option>`).join('');
    bodegaFilter.innerHTML = '<option value="">Todas las bodegas</option>' + bodegas.map((item) => `<option value="${item}">${item}</option>`).join('');
  }

  function getFilteredProducts() {
    const productos = productoService.getAll();
    const search = searchInput.value.trim().toLowerCase();
    const categoria = categoryFilter.value;
    const bodega = bodegaFilter.value;

    return productos.filter((producto) => {
      const locationText = buildLocationText(producto.ubicacion).toLowerCase();
      const matchesSearch = !search || producto.codigo.toLowerCase().includes(search) || producto.nombre.toLowerCase().includes(search) || locationText.includes(search);
      const matchesCategory = !categoria || producto.categoria === categoria;
      const matchesBodega = !bodega || producto.ubicacion?.bodega === bodega;
      return matchesSearch && matchesCategory && matchesBodega;
    });
  }

  function renderAll() {
    const productos = productoService.getAll();
    fillFilters(productos);
    renderSummaryCards(productos, 'clientSummaryCards');
    renderCustomerProducts(getFilteredProducts(), 'productGrid');
    renderCart('cartList', 'cartTotal');
  }

  document.getElementById('productGrid').addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (action !== 'add-cart' || !id) return;

    const quantityInput = document.getElementById(`qty-${id}`);
    const quantity = Number(quantityInput?.value || 1);

    try {
      compraService.addToCart(id, quantity);
      renderCart('cartList', 'cartTotal');
      showMessage('clientMessage', 'Producto agregado al carrito.', 'success');
    } catch (error) {
      showMessage('clientMessage', error.message, 'error');
    }
  });

  document.getElementById('cartList').addEventListener('change', (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (action !== 'cart-qty' || !id) return;

    try {
      compraService.updateCartItem(id, Number(event.target.value));
      renderCart('cartList', 'cartTotal');
    } catch (error) {
      showMessage('clientMessage', error.message, 'error');
      renderCart('cartList', 'cartTotal');
    }
  });

  document.getElementById('cartList').addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    if (action !== 'remove-cart' || !id) return;
    compraService.removeFromCart(id);
    renderCart('cartList', 'cartTotal');
    showMessage('clientMessage', 'Producto retirado del carrito.', 'info');
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    try {
      compraService.checkout(session);
      renderAll();
      showMessage('clientMessage', 'Compra simulada realizada correctamente.', 'success');
    } catch (error) {
      showMessage('clientMessage', error.message, 'error');
    }
  });

  [searchInput, categoryFilter, bodegaFilter].forEach((element) => {
    element.addEventListener('input', renderAll);
    element.addEventListener('change', renderAll);
  });

  document.getElementById('logoutClientBtn').addEventListener('click', logout);
  renderAll();
});
