document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.adoption-cat-card').forEach(function(card) {
    const button = card.querySelector('.adoption-cat-btn');
    const nameEl = card.querySelector('.adoption-cat-name');
    const catId = card.getAttribute('data-cat-id'); // make sure your HTML cards have data-cat-id

    if (!button || !nameEl) return;

    button.addEventListener('click', async function() {
      const catName = nameEl.textContent.trim();
      console.log("🐱 Sending application for:", { catName, catId });

      try {
        const res = await fetch('/adoption/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catName, catId })
        });

        const data = await res.json();
        console.log("📬 Server response:", data);

        if (!res.ok) {
          alert(data.message || 'Could not submit application.');
          return;
        }
        alert(`Application submitted for ${catName}! Status: ${data.application.status}`);
      } catch (e) {
        console.error("💥 Network error:", e);
        alert('Network error. Please try again.');
      }
    });
  });
});
