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
