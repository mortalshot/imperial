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
const loadVideoSources = (video) => {
  let isSourceChanged = false;
  video.querySelectorAll("source[data-src]").forEach((source2) => {
    if (source2.getAttribute("src")) return;
    source2.setAttribute("src", source2.dataset.src);
    isSourceChanged = true;
  });
  const source = video.dataset.src;
  if (source && !video.getAttribute("src")) {
    video.setAttribute("src", source);
    isSourceChanged = true;
  }
  return isSourceChanged;
};
const loadActiveSlideVideo = (sliderElement, activeIndex) => {
  const slides = sliderElement.querySelectorAll(".hero__slide");
  const activeSlide = slides[activeIndex];
  const video = activeSlide?.querySelector(".hero-slide__video");
  if (!video) return;
  const isSourceChanged = loadVideoSources(video);
  if (isSourceChanged) {
    video.load();
  }
  const playPromise = video.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
    });
  }
};
const getHeroVideoPoster = (video, fallbackPoster = "") => {
  const matchedSource = [...video.querySelectorAll("source[data-poster]")].find((source) => {
    const media = source.getAttribute("media");
    return !media || window.matchMedia(media).matches;
  });
  return matchedSource?.dataset.poster || fallbackPoster;
};
const syncHeroVideoPoster = (sliderElement) => {
  const fallbackPoster = sliderElement.querySelector(".hero-slide__image")?.currentSrc || sliderElement.querySelector(".hero-slide__image")?.getAttribute("src") || "";
  sliderElement.querySelectorAll(".hero-slide__video").forEach((video) => {
    const poster = getHeroVideoPoster(video, fallbackPoster);
    if (!poster) return;
    if (video.getAttribute("poster") === poster) return;
    video.setAttribute("poster", poster);
  });
};
const initHeroVideoPosterSync = (sliderElement) => {
  syncHeroVideoPoster(sliderElement);
  const mediaList = [
    ...new Set(
      [...sliderElement.querySelectorAll(".hero-slide__video source[media]")].map(
        (source) => source.getAttribute("media")
      )
    )
  ];
  mediaList.forEach((media) => {
    const mediaQuery = window.matchMedia(media);
    const syncPoster = () => syncHeroVideoPoster(sliderElement);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncPoster);
      return;
    }
    mediaQuery.addListener(syncPoster);
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
  if (!$ || !$.fn?.slick || !slider || !hero) return;
  const $slider = $(slider);
  const hasAutoplay = slider.classList.contains("_autoplay");
  if ($slider.hasClass("slick-initialized")) {
    hero.classList.add("_hero-ready");
    return;
  }
  initHeroVideoPosterSync(slider);
  $slider.on("init", (_event, slick) => {
    hero.classList.add("_hero-ready");
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
    autoplay: hasAutoplay,
    autoplaySpeed: 5e3,
    fade: true,
    infinite: true,
    speed: 700,
    cssEase: "ease"
  });
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      $slider.slick("slickPrev");
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      $slider.slick("slickNext");
    });
  }
  initHeroViewportObserver($slider, slider, hero);
};
window.addEventListener("load", () => {
  syncHeroHeaderOffset();
  initHeroSlider();
});
window.addEventListener("resize", () => {
  syncHeroHeaderOffset();
});
