const compraService = {
  getCart() {
    return storage.get(STORAGE_KEYS.carrito, []);
  },
  saveCart(carrito) {
    storage.set(STORAGE_KEYS.carrito, carrito);
  },
  addToCart(productoId, cantidad = 1) {
    const productos = productoService.getAll();
    const producto = productos.find((item) => Number(item.id) === Number(productoId));
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.cantidad <= 0) throw new Error('El producto está agotado');

    const cart = this.getCart();
    const existing = cart.find((item) => Number(item.productoId) === Number(productoId));
    const requested = Number(cantidad);
    const inCart = existing ? Number(existing.cantidad) : 0;

    if ((inCart + requested) > Number(producto.cantidad)) {
      throw new Error('La cantidad supera el stock disponible');
    }

    if (existing) {
      existing.cantidad += requested;
    } else {
      cart.push({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: requested
      });
    }

    this.saveCart(cart);
    return cart;
  },
  updateCartItem(productoId, cantidad) {
    const cart = this.getCart();
    const item = cart.find((entry) => Number(entry.productoId) === Number(productoId));
    if (!item) return;
    if (cantidad <= 0) {
      this.removeFromCart(productoId);
      return;
    }

    const producto = productoService.findById(productoId);
    if (!producto || Number(cantidad) > Number(producto.cantidad)) {
      throw new Error('La cantidad supera el stock disponible');
    }

    item.cantidad = Number(cantidad);
    this.saveCart(cart);
  },
  removeFromCart(productoId) {
    const cart = this.getCart().filter((item) => Number(item.productoId) !== Number(productoId));
    this.saveCart(cart);
  },
  clearCart() {
    this.saveCart([]);
  },
  checkout(usuario) {
    const cart = this.getCart();
    if (!cart.length) throw new Error('El carrito está vacío');

    const productos = productoService.getAll();

    cart.forEach((item) => {
      const producto = productos.find((prod) => Number(prod.id) === Number(item.productoId));
      if (!producto) throw new Error(`Producto ${item.nombre} no encontrado`);
      if (Number(item.cantidad) > Number(producto.cantidad)) {
        throw new Error(`Stock insuficiente para ${item.nombre}`);
      }
    });

    cart.forEach((item) => {
      const producto = productos.find((prod) => Number(prod.id) === Number(item.productoId));
      producto.cantidad = Number(producto.cantidad) - Number(item.cantidad);
      movimientoService.create('COMPRA', producto, item.cantidad, usuario, 'Compra simulada por usuario cliente');
    });

    productoService.saveAll(productos);
    this.clearCart();
  }
};

window.compraService = compraService;
