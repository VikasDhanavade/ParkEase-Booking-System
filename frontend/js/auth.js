document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorAlert = document.getElementById('errorAlert');

    function showError(msg) {
        errorAlert.textContent = msg;
        errorAlert.classList.remove('d-none');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                saveToken(res.token);
                saveUser(res.user);
                
                if (res.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (err) {
                showError(err.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value;

            try {
                const res = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, phone })
                });

                saveToken(res.token);
                saveUser(res.user);
                
                window.location.href = 'dashboard.html';
            } catch (err) {
                showError(err.message);
            }
        });
    }
});
