document.addEventListener('DOMContentLoaded', () => {
  const mainDetailImage = document.querySelector('#mainDetailImage');
  const thumbs = document.querySelectorAll('[data-gallery-thumb]');

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((button) => button.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainDetailImage) {
        mainDetailImage.src = thumb.dataset.image;
      }
    });
  });

  const coverInput = document.querySelector('#coverImage');
  const previewImage = document.querySelector('#previewImage');
  const previewTitle = document.querySelector('#previewTitle');
  const previewCategory = document.querySelector('#previewCategory');
  const previewDescription = document.querySelector('#previewDescription');
  const previewType = document.querySelector('#previewType');

  const titleInput = document.querySelector('[data-preview-title]');
  const categoryInput = document.querySelector('[data-preview-category]');
  const descriptionInput = document.querySelector('[data-preview-description]');
  const typeInputs = document.querySelectorAll('input[name="exchange_type"]');

  if (coverInput && previewImage) {
    coverInput.addEventListener('change', () => {
      const [file] = coverInput.files || [];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      previewImage.src = objectUrl;
    });
  }

  if (titleInput && previewTitle) {
    titleInput.addEventListener('input', () => {
      previewTitle.textContent = titleInput.value.trim() || 'Your title will appear here';
    });
  }

  if (categoryInput && previewCategory) {
    categoryInput.addEventListener('change', () => {
      previewCategory.textContent = categoryInput.options[categoryInput.selectedIndex]?.text || 'Select category';
    });
  }

  if (descriptionInput && previewDescription) {
    descriptionInput.addEventListener('input', () => {
      previewDescription.textContent = descriptionInput.value.trim() || 'Short description preview for your listing.';
    });
  }

  typeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (!input.checked || !previewType) return;
      previewType.textContent = input.value;
      previewType.className = `exchange-pill exchange-${input.value.toLowerCase()}`;
    });
  });
});
