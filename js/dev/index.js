import "./app.min.js";
const syncHeroHeaderOffset = () => {
  const header = document.querySelector(".header");
  const hero = document.querySelector(".hero");
  if (!header || !hero) return;
  const headerOffset = header.classList.contains("header--transparent") ? 0 : header.offsetHeight;
  hero.style.setProperty("--hero-header-offset", `${headerOffset}px`);
};
const pauseAllVideos = (scope) => {
  scope.querySelectorAll(".hero-slide__video").forEach((video) => {
    video.pause();
  });
};
const pauseInactiveVideos = (sliderElement, activeIndex) => {
  const slides = sliderElement.querySelectorAll(".hero__slide");
  slides.forEach((slide, index) => {
    if (index === activeIndex) return;
    const video = slide.querySelector(".hero-slide__video");
    if (!video) return;
    video.pause();
  });
};
const loadActiveSlideVideo = (sliderElement, activeIndex) => {
  const slides = sliderElement.querySelectorAll(".hero__slide");
  const activeSlide = slides[activeIndex];
  const video = activeSlide?.querySelector(".hero-slide__video");
  if (!video) return;
  const source = video.dataset.src;
  if (source && !video.getAttribute("src")) {
    video.setAttribute("src", source);
    video.load();
  }
  const playPromise = video.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
    });
  }
};
const syncHeroVideoPoster = (sliderElement) => {
  const fallbackPoster = sliderElement.querySelector(".hero-slide__image")?.currentSrc || sliderElement.querySelector(".hero-slide__image")?.getAttribute("src") || "";
  if (!fallbackPoster) return;
  sliderElement.querySelectorAll(".hero-slide__video").forEach((video) => {
    if (!video.getAttribute("poster")) {
      video.setAttribute("poster", fallbackPoster);
    }
  });
};
const initHeroViewportObserver = ($slider, sliderElement, heroElement) => {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        pauseAllVideos(heroElement);
        return;
      }
      const currentSlide = $slider.slick("slickCurrentSlide");
      loadActiveSlideVideo(sliderElement, currentSlide);
      pauseInactiveVideos(sliderElement, currentSlide);
    },
    {
      threshold: 0.15
    }
  );
  observer.observe(heroElement);
};
const initHeroSlider = () => {
  const $ = window.jQuery || window.$;
  const slider = document.querySelector(".js-hero-slider");
  const hero = slider?.closest(".hero");
  const prevButton = hero?.querySelector(".hero__arrow--prev");
  const nextButton = hero?.querySelector(".hero__arrow--next");
  if (!$ || !$.fn?.slick || !slider || !hero || !prevButton || !nextButton) return;
  const $slider = $(slider);
  if ($slider.hasClass("slick-initialized")) return;
  syncHeroVideoPoster(slider);
  $slider.on("init", (_event, slick) => {
    pauseInactiveVideos(slider, slick.currentSlide);
    loadActiveSlideVideo(slider, slick.currentSlide);
  });
  $slider.on("beforeChange", (_event, _slick, _currentSlide, nextSlide) => {
    pauseInactiveVideos(slider, nextSlide);
  });
  $slider.on("afterChange", (_event, _slick, currentSlide) => {
    loadActiveSlideVideo(slider, currentSlide);
    pauseInactiveVideos(slider, currentSlide);
  });
  $slider.slick({
    arrows: false,
    dots: false,
    fade: true,
    infinite: true,
    speed: 700,
    cssEase: "ease"
  });
  prevButton.addEventListener("click", () => {
    $slider.slick("slickPrev");
  });
  nextButton.addEventListener("click", () => {
    $slider.slick("slickNext");
  });
  initHeroViewportObserver($slider, slider, hero);
};
window.addEventListener("load", () => {
  syncHeroHeaderOffset();
  initHeroSlider();
});
window.addEventListener("resize", syncHeroHeaderOffset);
const initCategoriesPrevBackgrounds = () => {
  const section = document.querySelector(".s-categories-prev-color");
  if (!section) return;
  section.querySelectorAll("[data-bg]").forEach((card) => {
    const background = card.getAttribute("data-bg");
    if (!background) return;
    card.style.backgroundImage = 'url("' + background + '")';
  });
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCategoriesPrevBackgrounds, { once: true });
} else {
  initCategoriesPrevBackgrounds();
}
