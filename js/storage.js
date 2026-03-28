const STORAGE_KEYS = {
  usuarios: 'bodega_usuarios',
  productos: 'bodega_productos',
  movimientos: 'bodega_movimientos',
  sesion: 'bodega_sesion',
  carrito: 'bodega_carrito'
};

const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: 'admin', rol: 'ADMIN', nombre: 'Administrador de Bodega' },
  { id: 2, username: 'cliente', password: 'cliente', rol: 'CLIENTE', nombre: 'Usuario Comprador' }
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    codigo: 'PROD-001',
    nombre: 'Caja de guantes nitrilo',
    descripcion: 'Guantes desechables talla M',
    categoria: 'Bioseguridad',
    precio: 28000,
    cantidad: 45,
    stockMinimo: 10,
    ubicacion: { bodega: 'Bodega Norte', zona: 'A', torre: 'T1', estanteria: 'E2', modulo: 'M1', posicion: 'P3' },
    activo: true,
    fechaCreacion: '2026-03-24T08:00:00'
  },
  {
    id: 2,
    codigo: 'PROD-002',
    nombre: 'Resma papel carta',
    descripcion: 'Papel blanco 75 gr',
    categoria: 'Papelería',
    precio: 19000,
    cantidad: 12,
    stockMinimo: 8,
    ubicacion: { bodega: 'Bodega Norte', zona: 'B', torre: 'T1', estanteria: 'E1', modulo: 'M2', posicion: 'P1' },
    activo: true,
    fechaCreacion: '2026-03-24T08:30:00'
  },
  {
    id: 3,
    codigo: 'PROD-003',
    nombre: 'Monitor 24 pulgadas',
    descripcion: 'Monitor LED Full HD',
    categoria: 'Tecnología',
    precio: 520000,
    cantidad: 6,
    stockMinimo: 5,
    ubicacion: { bodega: 'Bodega Sur', zona: 'C', torre: 'T2', estanteria: 'E3', modulo: 'M4', posicion: 'P2' },
    activo: true,
    fechaCreacion: '2026-03-24T09:00:00'
  },
  {
    id: 4,
    codigo: 'PROD-004',
    nombre: 'Silla ergonómica',
    descripcion: 'Silla ejecutiva negra',
    categoria: 'Mobiliario',
    precio: 780000,
    cantidad: 3,
    stockMinimo: 2,
    ubicacion: { bodega: 'Bodega Central', zona: 'A', torre: 'T3', estanteria: 'E1', modulo: 'M1', posicion: 'P5' },
    activo: true,
    fechaCreacion: '2026-03-24T09:15:00'
  },
  {
    id: 5,
    codigo: 'PROD-005',
    nombre: 'Botella de limpieza',
    descripcion: 'Desinfectante multiusos 1L',
    categoria: 'Aseo',
    precio: 15000,
    cantidad: 0,
    stockMinimo: 6,
    ubicacion: { bodega: 'Bodega Central', zona: 'D', torre: 'T1', estanteria: 'E4', modulo: 'M3', posicion: 'P6' },
    activo: true,
    fechaCreacion: '2026-03-24T09:30:00'
  }
];

async function fetchJsonOrFallback(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('No se pudo cargar ' + path);
    return await response.json();
  } catch (error) {
    console.warn('Usando datos por defecto para', path, error);
    return fallback;
  }
}

const storage = {
  get(key, fallback = null) {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parseando localStorage', key, error);
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clearAppData() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }
};

async function initializeAppData() {
  const usuarios = storage.get(STORAGE_KEYS.usuarios);
  const productos = storage.get(STORAGE_KEYS.productos);
  const movimientos = storage.get(STORAGE_KEYS.movimientos);
  const carrito = storage.get(STORAGE_KEYS.carrito);

  if (!usuarios) {
    const users = await fetchJsonOrFallback('./data/usuarios.json', DEFAULT_USERS);
    storage.set(STORAGE_KEYS.usuarios, users);
  }

  if (!productos) {
    const items = await fetchJsonOrFallback('./data/productos.json', DEFAULT_PRODUCTS);
    storage.set(STORAGE_KEYS.productos, items);
  }

  if (!movimientos) storage.set(STORAGE_KEYS.movimientos, []);
  if (!carrito) storage.set(STORAGE_KEYS.carrito, []);
}

window.STORAGE_KEYS = STORAGE_KEYS;
window.storage = storage;
window.initializeAppData = initializeAppData;
