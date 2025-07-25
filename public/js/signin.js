document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
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
            window.location.href = '/profile'; // Profile as the placeholder homepage for now
        } else {
            alert(result.message || 'Login failed');
        }

    } catch (err) {
        console.error('Login error:', err);
        alert('An error occurred during login. Please try again.');
    }
});
// signin.js
// Add any sign-in page specific JS here

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.signin-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Example: Show loading spinner or disable button
            const button = form.querySelector('.signin-button');
            if (button) {
                button.disabled = true;
                button.textContent = 'Signing In...';
            }
        });
    }
});
