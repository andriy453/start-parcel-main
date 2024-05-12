/**
 * Function for disabling Swiper autoscroll when Swiper is not in viewport
 */
export const swiperObserver = (swiperInstance) => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.85,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        swiperInstance.autoplay.start();
      } else {
        swiperInstance.autoplay.stop();
      }
    });
  }, observerOptions);

  observer.observe(swiperInstance.el);
};
