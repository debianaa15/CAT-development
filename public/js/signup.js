// signup.js
// Add any signup page specific JS here

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.signup-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Example: Show loading spinner or disable button
            const button = form.querySelector('.signup-button');
            if (button) {
                button.disabled = true;
                button.textContent = 'Signing Up...';
            }
        });
    }
});
