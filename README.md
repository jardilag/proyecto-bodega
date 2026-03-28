# Sistema web para logística de productos en bodega

Proyecto universitario desarrollado con HTML, CSS y JavaScript puro.

## Funcionalidades
- Login simulado con dos usuarios fijos.
- CRUD de productos para el administrador.
- Ubicación completa del producto: bodega, zona, torre, estantería, módulo y posición.
- Consulta de inventario y filtros.
- Compra simulada para cliente.
- Historial de movimientos.
- Persistencia con localStorage.
- Datos iniciales desde `data/usuarios.json` y `data/productos.json`.

## Usuarios de prueba
- Administrador: `admin / admin`
- Cliente: `cliente / cliente`

## Ejecución recomendada
Como el proyecto usa `fetch` para leer los JSON iniciales, se recomienda abrirlo con un servidor local sencillo.

Ejemplo con VS Code + Live Server, o con Python:

```bash
python -m http.server 5500
```

Luego abrir:

```text
http://localhost:5500
```

## Estructura
- `index.html`: login
- `admin.html`: panel administrador
- `cliente.html`: vista cliente
- `movimientos.html`: historial de movimientos
- `data/`: semillas de usuarios y productos
- `js/`: lógica del sistema
- `css/`: estilos
# proyecto-bodega
