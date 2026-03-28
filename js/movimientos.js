const movimientoService = {
  getAll() {
    return storage.get(STORAGE_KEYS.movimientos, []);
  },
  saveAll(movimientos) {
    storage.set(STORAGE_KEYS.movimientos, movimientos);
  },
  create(tipo, producto, cantidad, usuario, detalle) {
    const movimientos = this.getAll();
    movimientos.unshift({
      id: getNextId(movimientos),
      tipo,
      productoId: producto?.id ?? null,
      codigoProducto: producto?.codigo ?? '-',
      nombreProducto: producto?.nombre ?? '-',
      cantidad: Number(cantidad || 0),
      usuario: usuario?.username ?? 'sistema',
      rol: usuario?.rol ?? 'SISTEMA',
      fecha: new Date().toISOString(),
      detalle
    });
    this.saveAll(movimientos);
  }
};

window.movimientoService = movimientoService;
