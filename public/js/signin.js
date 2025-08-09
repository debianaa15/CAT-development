// signin.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.signin-form');

    if (form) {
        const button = form.querySelector('.signin-button');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (!button) return;

            // Show loading state
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Signing In...';

            const data = {
                email: form.email.value,
                password: form.password.value
            };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Login successful!');
                    // Redirect based on role
                    switch (result.role) {
                        case 'Trainer':
                            window.location.href = '/trainer';
                            break;
                        case 'Volunteer':
                            window.location.href = '/main';
                            break;
                        case 'Admin':
                            window.location.href = '/adminadoptionrequest';
                            break;
                        default:
                            window.location.href = '/';
                    }
                } else {
                    alert(result.message || 'Login failed');
                    button.disabled = false;
                    button.textContent = originalText;
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An error occurred during login. Please try again.');
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
});
