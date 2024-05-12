window.uploadFile = function uploadFile() {
  if (document.querySelector('[data-upload-file-animation]')) {
    const uploadFileBlocksArr = document.querySelectorAll(
      '[data-upload-file-animation]'
    );
    uploadFileBlocksArr.forEach((fileUpload) => {
      fileUpload.addEventListener('dragover', function () {
        this.classList.add('drag');
        this.classList.remove('drop', 'done');
      });

      fileUpload.addEventListener('dragleave', function () {
        this.classList.remove('drag');
      });

      fileUpload.addEventListener('drop', start, false);
      fileUpload.addEventListener('change', start, false);

      function start() {
        this.classList.remove('drag');
        this.classList.add('drop');
        setTimeout(() => this.classList.add('done'), 500);
      }
    });
  }
};
uploadFile();
