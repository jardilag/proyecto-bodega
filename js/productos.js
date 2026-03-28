const productoService = {
  getAll() {
    return storage.get(STORAGE_KEYS.productos, []);
  },
  saveAll(productos) {
    storage.set(STORAGE_KEYS.productos, productos);
  },
  findById(id) {
    return this.getAll().find((item) => Number(item.id) === Number(id));
  },
  existsCodigo(codigo, excludeId = null) {
    return this.getAll().some((item) => item.codigo.toLowerCase() === codigo.toLowerCase() && Number(item.id) !== Number(excludeId));
  },
  create(data, usuario) {
    const productos = this.getAll();
    const producto = { ...data, id: getNextId(productos), activo: true, fechaCreacion: new Date().toISOString() };
    productos.push(producto);
    this.saveAll(productos);
    movimientoService.create('CREACION', producto, data.cantidad, usuario, 'Producto registrado');
    return producto;
  },
  update(id, data, usuario) {
    const productos = this.getAll();
    const index = productos.findIndex((item) => Number(item.id) === Number(id));
    if (index === -1) throw new Error('Producto no encontrado');
    productos[index] = { ...productos[index], ...data };
    this.saveAll(productos);
    movimientoService.create('ACTUALIZACION', productos[index], data.cantidad, usuario, 'Producto actualizado');
    return productos[index];
  },
  remove(id, usuario) {
    const productos = this.getAll();
    const product = productos.find((item) => Number(item.id) === Number(id));
    const filtered = productos.filter((item) => Number(item.id) !== Number(id));
    this.saveAll(filtered);
    if (product) movimientoService.create('ELIMINACION', product, product.cantidad, usuario, 'Producto eliminado');
  },
  adjustStock(id, cantidad, usuario) {
    const productos = this.getAll();
    const producto = productos.find((item) => Number(item.id) === Number(id));
    if (!producto) throw new Error('Producto no encontrado');
    producto.cantidad = Number(producto.cantidad) + Number(cantidad);
    if (producto.cantidad < 0) throw new Error('La cantidad no puede ser negativa');
    this.saveAll(productos);
    movimientoService.create('AJUSTE_STOCK', producto, cantidad, usuario, 'Ajuste manual de stock');
    return producto;
  }
};

window.productoService = productoService;
