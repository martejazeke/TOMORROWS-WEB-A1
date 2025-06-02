new Swiper(".swiper", {
  slidesPerView: 3,
  spaceBetween: 24,
  centeredSlides: true,
  loop: true,
  watchSlidesProgress: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    // Mobile 
    320: {
      slidesPerView: 1,
      spaceBetween: 16,
      centeredSlides: false
    },
    // Tablet
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
      centeredSlides: false
    },
    // Desktop
    1024: {
      slidesPerView: 3,
      spaceBetween: 24,
      centeredSlides: true,
      initialSlide: 1
    }
  }
});
