document.addEventListener('DOMContentLoaded', async () => {
  if (!document.body.classList.contains('page-admin')) return;

  await initializeAppData();
  const session = requireSession(['ADMIN']);
  if (!session) return;

  document.getElementById('currentUser').textContent = `${session.nombre} (${session.rol})`;

  const form = document.getElementById('productForm');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const resetBtn = document.getElementById('resetSystemBtn');
  const searchInput = document.getElementById('searchInput');
  const bodegaFilter = document.getElementById('bodegaFilter');
  const estadoFilter = document.getElementById('estadoFilter');
  const tableBody = document.getElementById('inventoryTableBody');
  const formTitle = document.getElementById('formTitle');

  const productModal = document.getElementById('productModal');
  const openProductModalBtn = document.getElementById('openProductModalBtn');
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const closeProductModalOverlay = document.getElementById('closeProductModalOverlay');

  function openProductModal() {
    if (productModal) {
      productModal.hidden = false;
    }
  }

  function closeProductModal() {
    if (productModal) {
      productModal.hidden = true;
    }
  }

  function fillBodegaFilter(productos) {
    const bodegas = [
      ...new Set(productos.map((item) => item.ubicacion?.bodega).filter(Boolean))
    ];

    bodegaFilter.innerHTML =
      '<option value="">Todas las bodegas</option>' +
      bodegas.map((bodega) => `<option value="${bodega}">${bodega}</option>`).join('');
  }

  function getFilteredProducts() {
    const productos = productoService.getAll();
    const search = searchInput.value.trim().toLowerCase();
    const bodega = bodegaFilter.value;
    const estado = estadoFilter.value;

    return productos.filter((producto) => {
      const locationText = buildLocationText(producto.ubicacion).toLowerCase();
      const stock = getStockStatus(producto).label;

      const matchesSearch =
        !search ||
        producto.codigo.toLowerCase().includes(search) ||
        producto.nombre.toLowerCase().includes(search) ||
        (producto.categoria || '').toLowerCase().includes(search) ||
        locationText.includes(search);

      const matchesBodega = !bodega || producto.ubicacion?.bodega === bodega;
      const matchesEstado = !estado || stock === estado;

      return matchesSearch && matchesBodega && matchesEstado;
    });
  }

  function renderAll() {
    const productos = productoService.getAll();
    fillBodegaFilter(productos);
    renderSummaryCards(productos, 'summaryCards');
    renderInventoryTable(getFilteredProducts(), 'inventoryTableBody', true);
    renderMovements('movementTableBody', 8);
  }

  function resetForm() {
    form.reset();
    document.getElementById('productId').value = '';
    formTitle.textContent = 'Registrar producto';
    cancelBtn.hidden = true;
  }

  function loadProductIntoForm(producto) {
    document.getElementById('productId').value = producto.id;
    document.getElementById('codigo').value = producto.codigo;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('categoria').value = producto.categoria || '';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('cantidad').value = producto.cantidad;
    document.getElementById('stockMinimo').value = producto.stockMinimo;
    document.getElementById('bodega').value = producto.ubicacion?.bodega || '';
    document.getElementById('zona').value = producto.ubicacion?.zona || '';
    document.getElementById('torre').value = producto.ubicacion?.torre || '';
    document.getElementById('estanteria').value = producto.ubicacion?.estanteria || '';
    document.getElementById('modulo').value = producto.ubicacion?.modulo || '';
    document.getElementById('posicion').value = producto.ubicacion?.posicion || '';
    formTitle.textContent = 'Editar producto';
    cancelBtn.hidden = false;
  }

  function getFormData() {
    const data = {
      codigo: document.getElementById('codigo').value.trim(),
      nombre: document.getElementById('nombre').value.trim(),
      descripcion: document.getElementById('descripcion').value.trim(),
      categoria: document.getElementById('categoria').value.trim(),
      precio: Number(document.getElementById('precio').value),
      cantidad: Number(document.getElementById('cantidad').value),
      stockMinimo: Number(document.getElementById('stockMinimo').value),
      ubicacion: {
        bodega: document.getElementById('bodega').value.trim(),
        zona: document.getElementById('zona').value.trim(),
        torre: document.getElementById('torre').value.trim(),
        estanteria: document.getElementById('estanteria').value.trim(),
        modulo: document.getElementById('modulo').value.trim(),
        posicion: document.getElementById('posicion').value.trim()
      }
    };

    if (
      !data.codigo ||
      !data.nombre ||
      Number.isNaN(data.precio) ||
      Number.isNaN(data.cantidad) ||
      !data.ubicacion.bodega ||
      !data.ubicacion.zona ||
      !data.ubicacion.torre ||
      !data.ubicacion.estanteria ||
      !data.ubicacion.modulo ||
      !data.ubicacion.posicion
    ) {
      throw new Error('Todos los campos principales y la ubicación completa son obligatorios.');
    }

    if (data.precio < 0 || data.cantidad < 0 || data.stockMinimo < 0) {
      throw new Error('Precio, cantidad y stock mínimo deben ser valores positivos.');
    }

    return data;
  }

  if (openProductModalBtn) {
    openProductModalBtn.addEventListener('click', () => {
      resetForm();
      openProductModal();
    });
  }

  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener('click', () => {
      closeProductModal();
    });
  }

  if (closeProductModalOverlay) {
    closeProductModalOverlay.addEventListener('click', () => {
      closeProductModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && productModal && !productModal.hidden) {
      closeProductModal();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      const id = document.getElementById('productId').value;
      const data = getFormData();

      if (productoService.existsCodigo(data.codigo, id || null)) {
        throw new Error('Ya existe un producto con ese código.');
      }

      if (id) {
        productoService.update(id, data, session);
        showMessage('adminMessage', 'Producto actualizado correctamente.', 'success');
      } else {
        productoService.create(data, session);
        showMessage('adminMessage', 'Producto creado correctamente.', 'success');
      }

      resetForm();
      renderAll();
      closeProductModal();
    } catch (error) {
      showMessage('adminMessage', error.message, 'error');
    }
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
    closeProductModal();
  });

  [searchInput, bodegaFilter, estadoFilter].forEach((element) => {
    element.addEventListener('input', renderAll);
    element.addEventListener('change', renderAll);
  });

  tableBody.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;

    if (!action || !id) return;

    const producto = productoService.findById(id);

    if (!producto) {
      showMessage('adminMessage', 'Producto no encontrado.', 'error');
      return;
    }

    if (action === 'edit') {
      loadProductIntoForm(producto);
      openProductModal();
      return;
    }

    if (action === 'delete') {
      if (confirm(`¿Eliminar el producto ${producto.nombre}?`)) {
        productoService.remove(id, session);
        showMessage('adminMessage', 'Producto eliminado correctamente.', 'success');
        renderAll();
      }
      return;
    }

    if (action === 'stock') {
      const cantidad = prompt(`Ingrese la cantidad a sumar para ${producto.nombre}:`, '1');
      if (cantidad === null) return;

      try {
        productoService.adjustStock(id, Number(cantidad), session);
        showMessage('adminMessage', 'Stock ajustado correctamente.', 'success');
        renderAll();
      } catch (error) {
        showMessage('adminMessage', error.message, 'error');
      }
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);

  resetBtn.addEventListener('click', async () => {
    if (!confirm('Esto borrará localStorage y recargará los datos iniciales. ¿Continuar?')) return;

    storage.clearAppData();
    await initializeAppData();
    resetForm();
    showMessage('adminMessage', 'Sistema restablecido correctamente.', 'success');
    renderAll();
  });

  renderAll();
});