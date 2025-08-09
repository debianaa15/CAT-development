// signup.js

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.signup-form');

    if (form) {
        const button = form.querySelector('.signup-button');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            if (button) {
                button.disabled = true;
                const originalText = button.textContent;
                button.textContent = 'Signing Up...';

                const data = {
                    firstName: form.firstName.value,
                    lastName: form.lastName.value,
                    email: form.email.value,
                    idNumber: form.idNumber.value,
                    role: form.role.value,
                    password: form.password.value
                };

                try {
                    const response = await fetch('/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert('Signup successful!');
                        window.location.href = '/signin';
                    } else {
                        alert(result.message || 'Signup failed.');
                        button.disabled = false;
                        button.textContent = originalText;
                    }
                } catch (err) {
                    console.error('Signup error:', err);
                    alert('An error occurred. Please try again.');
                    button.disabled = false;
                    button.textContent = originalText;
                }
            }
        });
    }
});
