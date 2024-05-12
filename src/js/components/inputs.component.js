window.autosizeTextarea = function autosizeTextarea() {
  if (document.querySelector('textarea[data-autosize]')) {
    const autosizeTextareaElements = document.querySelectorAll(
      'textarea[data-autosize]'
    );
    autosizeTextareaElements.forEach((textarea) => {
      const startHeight = textarea.offsetHeight;
      textarea.addEventListener('input', autosize);
      function autosize() {
        const el = this;
        const newHeight = el.scrollHeight;
        if (newHeight > startHeight) {
          el.style.minHeight = `${el.scrollHeight}px`;
        } else {
          el.style.minHeight = startHeight;
        }
      }
    });
  }
};
autosizeTextarea();
