const buttons = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');
const underline = document.getElementById('tabUnderline');
const container = document.getElementById('tabContainer');

function moveUnderline(button) {
  const rect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  underline.style.width = `${button.offsetWidth}px`;
  underline.style.left = `${button.offsetLeft}px`;
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Activate button
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show corresponding tab content
    const target = btn.getAttribute('data-tab');
    contents.forEach(c => {
      c.classList.remove('active');
      if (c.id === target) c.classList.add('active');
    });

    // Move underline
    moveUnderline(btn);
  });
});

// Set initial underline position
window.addEventListener('load', () => {
  const activeBtn = document.querySelector('.tab-button.active');
  if (activeBtn) moveUnderline(activeBtn);
});

// Adjust underline on window resize
window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.tab-button.active');
  if (activeBtn) moveUnderline(activeBtn);
});