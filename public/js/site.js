// Optional form helpers for the portal

// Mark the page as script enabled
document.documentElement.classList.add('js');

// Update the remaining character count
document.querySelectorAll('textarea[maxlength]').forEach((area) => {
  const limit = area.maxLength;
  if (limit <= 0 || !area.parentElement) return;

  const counter = document.createElement('p');
  counter.className = 'field-count';
  area.parentElement.appendChild(counter);

  const update = () => {
    const left = limit - area.value.length;
    counter.textContent = `${left.toLocaleString('en-US')} ${left === 1 ? 'character' : 'characters'} left`;
    counter.classList.toggle('low', left <= 100);
  };

  area.addEventListener('input', update);
  update();
});

// Disable submit buttons after submission to prevent duplicate requests
document.querySelectorAll('form[method="post"]').forEach((form) => {
  form.addEventListener('submit', () => {
    form.querySelectorAll('button[type="submit"]').forEach((button) => {
      button.disabled = true;
    });
  });
});

// Restore buttons when returning with the Back button
window.addEventListener('pageshow', () => {
  document.querySelectorAll('form[method="post"] button[type="submit"]').forEach((button) => {
    button.disabled = false;
  });
});
