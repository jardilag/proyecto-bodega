document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  await initializeAppData();

  const session = storage.get(STORAGE_KEYS.sesion);
  if (session) {
    window.location.href = session.rol === 'ADMIN' ? './admin.html' : './cliente.html';
    return;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = storage.get(STORAGE_KEYS.usuarios, []);

    const user = users.find((item) => item.username === username && item.password === password);

    if (!user) {
      showMessage('loginMessage', 'Credenciales inválidas. Usa admin/admin o cliente/cliente.', 'error');
      return;
    }

    storage.set(STORAGE_KEYS.sesion, user);
    window.location.href = user.rol === 'ADMIN' ? './admin.html' : './cliente.html';
  });

  document.getElementById('resetDataBtn')?.addEventListener('click', async () => {
    storage.clearAppData();
    await initializeAppData();
    showMessage('loginMessage', 'Datos reiniciados correctamente.', 'success');
  });
});
