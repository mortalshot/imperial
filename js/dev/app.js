(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const initTransparentHeader = () => {
  const header = document.querySelector(".header");
  const page = document.querySelector(".page");
  const firstSection = page?.firstElementChild;
  if (!header) return;
  header.classList.toggle("header--transparent", Boolean(firstSection?.classList.contains("hero")));
};
const initInnerPageLegacyScrollGuard = () => {
  const detailFilter = document.querySelector(".detail_filter");
  const handleInnerScroll = () => {
    if (!detailFilter) return;
    const detailFilterOffset = detailFilter.getBoundingClientRect().top + window.scrollY;
    detailFilter.classList.toggle("fixed", window.pageYOffset > detailFilterOffset - 100);
  };
  window.onscroll = handleInnerScroll;
  window.addEventListener("resize", handleInnerScroll);
  handleInnerScroll();
};
const initTouchDropdowns = () => {
  const menuItems = document.querySelectorAll(".main-nav__item");
  const heads = document.querySelectorAll(".main-nav__title");
  const mobileMedia = window.matchMedia("(max-width: 991.98px)");
  if (!heads.length) return;
  const closeAll = (exceptItem = null) => {
    menuItems.forEach((item) => {
      if (item === exceptItem) return;
      item.classList.remove("is-active");
      const toggle = item.querySelector(".main-nav__toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };
  heads.forEach((head) => {
    head.addEventListener("click", (event) => {
      if (!mobileMedia.matches) return;
      const item = head.closest(".main-nav__item");
      const toggle = head.querySelector(".main-nav__toggle");
      if (!item || !toggle) return;
      event.preventDefault();
      event.stopPropagation();
      const isActive = item.classList.contains("is-active");
      closeAll(item);
      item.classList.toggle("is-active", !isActive);
      toggle.setAttribute("aria-expanded", String(!isActive));
    });
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".main-nav")) return;
    closeAll();
  });
};
const initCategoryDropdowns = () => {
  const items = document.querySelectorAll(".category-nav__item");
  const heads = document.querySelectorAll(".category-nav__head");
  const mobileMedia = window.matchMedia("(max-width: 991.98px)");
  if (!heads.length) return;
  const closeAll = (exceptItem = null) => {
    items.forEach((item) => {
      if (item === exceptItem) return;
      item.classList.remove("is-active");
      const toggle = item.querySelector(".category-nav__toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };
  heads.forEach((head) => {
    head.addEventListener("click", (event) => {
      if (!mobileMedia.matches) return;
      const item = head.closest(".category-nav__item");
      const toggle = head.querySelector(".category-nav__toggle");
      if (!item || !toggle) return;
      event.preventDefault();
      event.stopPropagation();
      const isActive = item.classList.contains("is-active");
      closeAll(item);
      item.classList.toggle("is-active", !isActive);
      toggle.setAttribute("aria-expanded", String(!isActive));
      if (!isActive) {
        window.setTimeout(() => {
          item.scrollIntoView({
            block: "start",
            behavior: "smooth"
          });
        }, 40);
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".category-nav")) return;
    closeAll();
  });
};
const initMobileSearch = () => {
  const header = document.querySelector(".header");
  const searchLine = document.querySelector(".search-line");
  const searchToggle = document.querySelector(".search-line__toggle");
  const searchInput = document.querySelector(".search-line__input");
  const searchClose = document.querySelector(".search-line__close");
  const searchDropdown = document.querySelector(".search-line__dropdown");
  const searchDropdownList = document.querySelector(".search-dropdown__list");
  const searchDropdownEmpty = document.querySelector(".search-dropdown__empty");
  if (!header || !searchLine || !searchToggle || !searchInput || !searchClose || !searchDropdown || !searchDropdownList || !searchDropdownEmpty) {
    return;
  }
  const mobileResults = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];
  const isDropdownVisible = () => searchDropdown.classList.contains("is-visible");
  const updateFilledState = () => {
    searchLine.classList.toggle("is-filled", Boolean(searchInput.value.trim()));
  };
  const renderResults = () => {
    searchDropdown.hidden = false;
    searchDropdownEmpty.textContent = "";
    searchDropdownEmpty.hidden = true;
    searchDropdownList.innerHTML = mobileResults.map((item) => `<li class="search-dropdown__item"><button class="search-dropdown__button" type="button">${item}</button></li>`).join("");
    window.requestAnimationFrame(() => {
      searchDropdown.classList.add("is-visible");
    });
  };
  const hideDropdown = () => {
    searchDropdown.classList.remove("is-visible");
    window.setTimeout(() => {
      if (!isDropdownVisible()) {
        searchDropdown.hidden = true;
      }
    }, 300);
  };
  const openSearch = () => {
    header.classList.add("is-search-open");
    searchLine.classList.add("is-open");
    searchToggle.setAttribute("aria-expanded", "true");
    updateFilledState();
    renderResults();
    window.setTimeout(() => {
      searchInput.focus();
    }, 0);
  };
  const closeSearch = () => {
    header.classList.remove("is-search-open");
    searchLine.classList.remove("is-open", "is-filled");
    searchToggle.setAttribute("aria-expanded", "false");
    hideDropdown();
    searchDropdownList.innerHTML = "";
    searchDropdownEmpty.textContent = "";
    searchDropdownEmpty.hidden = false;
  };
  searchToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (header.classList.contains("is-search-open")) {
      closeSearch();
      return;
    }
    openSearch();
  });
  searchClose.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    searchInput.value = "";
    updateFilledState();
    searchInput.focus();
  }, true);
  searchInput.addEventListener("input", () => {
    updateFilledState();
  });
  searchInput.addEventListener("focus", () => {
    renderResults();
  });
  searchInput.addEventListener("click", () => {
    renderResults();
  });
  searchDropdown.addEventListener("click", (event) => {
    const button = event.target.closest(".search-dropdown__button");
    if (!button) return;
    searchInput.value = button.textContent?.trim() || "";
    updateFilledState();
    hideDropdown();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".header__search-line")) return;
    if (header.classList.contains("is-search-open")) {
      closeSearch();
      return;
    }
    hideDropdown();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (header.classList.contains("is-search-open")) {
      closeSearch();
      return;
    }
    hideDropdown();
  });
};
const initCategorySubDropdowns = () => {
  const items = document.querySelectorAll(".category-subnav__item");
  const heads = document.querySelectorAll(".category-subnav__head");
  const mobileMedia = window.matchMedia("(max-width: 991.98px)");
  if (!heads.length) return;
  const closeSiblings = (currentItem) => {
    const parentList = currentItem.closest(".category-subnav__list");
    if (!parentList) return;
    parentList.querySelectorAll(":scope > .category-subnav__item").forEach((item) => {
      if (item === currentItem) return;
      item.classList.remove("is-active");
      const toggle = item.querySelector(":scope > .category-subnav__head .category-subnav__toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };
  heads.forEach((head) => {
    head.addEventListener("click", (event) => {
      if (!mobileMedia.matches) return;
      const item = head.closest(".category-subnav__item");
      const toggle = head.querySelector(".category-subnav__toggle");
      if (!item || !toggle) return;
      event.preventDefault();
      event.stopPropagation();
      const isActive = item.classList.contains("is-active");
      closeSiblings(item);
      item.classList.toggle("is-active", !isActive);
      toggle.setAttribute("aria-expanded", String(!isActive));
      if (!isActive) {
        window.setTimeout(() => {
          item.scrollIntoView({
            block: "start",
            behavior: "smooth"
          });
        }, 40);
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".category-subnav")) return;
    items.forEach((item) => {
      item.classList.remove("is-active");
      const toggle = item.querySelector(":scope > .category-subnav__head .category-subnav__toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
};
const initCategoryNavSticky = () => {
  const header = document.querySelector(".header");
  const categoryNav = header?.querySelector(".header__category-nav");
  const categoryNavContainer = categoryNav?.querySelector(".container");
  const basket = header?.querySelector(".header__basket-mini");
  const desktopMedia = window.matchMedia("(min-width: 992px)");
  if (!header || !categoryNav || !categoryNavContainer || !basket) return;
  let rafId = 0;
  let basketStart = 0;
  let stickyStart = 0;
  let canUseSticky = true;
  const basketAnchor = document.createComment("header-basket-anchor");
  const basketPlaceholder = document.createElement("div");
  const basketParent = basket.parentNode;
  const basketSlot = document.createElement("div");
  basketPlaceholder.className = "header__basket-placeholder";
  basketPlaceholder.setAttribute("aria-hidden", "true");
  basketSlot.className = "category-nav__basket-slot";
  categoryNavContainer.append(basketSlot);
  basketParent.insertBefore(basketAnchor, basket);
  const setCategoryNavHeight = () => {
    header.style.setProperty("--category-nav-fixed-height", `${categoryNav.offsetHeight}px`);
  };
  const setStickyStart = () => {
    const headerTop = header.getBoundingClientRect().top + window.scrollY;
    basketStart = headerTop + categoryNav.offsetTop + categoryNav.offsetHeight;
    stickyStart = basketStart + 320;
    const maxScrollableY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    canUseSticky = maxScrollableY > stickyStart;
  };
  const moveBasketToHeaderMain = () => {
    basketPlaceholder.remove();
    if (basket.parentNode === basketParent && basket.previousSibling === basketAnchor) return;
    basketParent.insertBefore(basket, basketAnchor.nextSibling);
  };
  const moveBasketToCategoryNav = () => {
    if (basket.parentNode === basketSlot) return;
    const basketRect = basket.getBoundingClientRect();
    basketPlaceholder.style.width = `${basketRect.width}px`;
    basketPlaceholder.style.minWidth = `${basketRect.width}px`;
    basketPlaceholder.style.height = `${basketRect.height}px`;
    if (basketPlaceholder.parentNode !== basketParent) {
      basketParent.insertBefore(basketPlaceholder, basketAnchor.nextSibling);
    }
    basketSlot.append(basket);
  };
  const toggleStickyState = () => {
    rafId = 0;
    categoryNav.classList.remove("is-fixed");
    if (!canUseSticky) {
      categoryNav.classList.remove("is-sticky", "is-unfixing");
      header.classList.remove("has-fixed-category-nav");
      header.style.removeProperty("--category-nav-fixed-height");
      moveBasketToHeaderMain();
      return;
    }
    const shouldMoveBasket = desktopMedia.matches && !header.classList.contains("is-open") && !header.classList.contains("is-search-open") && window.scrollY >= basketStart;
    const shouldFix = desktopMedia.matches && !header.classList.contains("is-open") && !header.classList.contains("is-search-open") && window.scrollY >= stickyStart;
    if (shouldMoveBasket) {
      moveBasketToCategoryNav();
    } else {
      moveBasketToHeaderMain();
    }
    if (shouldFix) {
      categoryNav.classList.remove("is-unfixing");
      header.classList.add("has-fixed-category-nav");
      categoryNav.classList.add("is-sticky");
      moveBasketToCategoryNav();
      setCategoryNavHeight();
      return;
    }
    if (!categoryNav.classList.contains("is-sticky")) {
      header.classList.remove("has-fixed-category-nav");
      header.style.removeProperty("--category-nav-fixed-height");
      return;
    }
    categoryNav.classList.remove("is-sticky", "is-unfixing");
    header.classList.remove("has-fixed-category-nav");
    header.style.removeProperty("--category-nav-fixed-height");
    if (window.scrollY < basketStart) {
      moveBasketToHeaderMain();
      return;
    }
    moveBasketToCategoryNav();
  };
  const requestStickyUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(toggleStickyState);
  };
  const updateStickyMetrics = () => {
    categoryNav.classList.remove("is-fixed");
    const isFixed = categoryNav.classList.contains("is-sticky");
    if (isFixed) {
      header.classList.remove("has-fixed-category-nav");
      categoryNav.classList.remove("is-sticky");
      header.style.removeProperty("--category-nav-fixed-height");
    }
    setStickyStart();
    if (isFixed) {
      toggleStickyState();
      return;
    }
    requestStickyUpdate();
  };
  const resizeObserver = new ResizeObserver(() => {
    updateStickyMetrics();
  });
  resizeObserver.observe(categoryNav);
  window.addEventListener("scroll", requestStickyUpdate, { passive: true });
  window.addEventListener("resize", updateStickyMetrics);
  desktopMedia.addEventListener("change", updateStickyMetrics);
  updateStickyMetrics();
};
const initMobileCategoryNavScroll = () => {
  const header = document.querySelector(".header");
  const categoryNav = header?.querySelector(".category-nav");
  const categoryNavToggle = categoryNav?.querySelector(".category-nav-mobile");
  const mobileMedia = window.matchMedia("(max-width: 991.98px)");
  if (!header || !categoryNav || !categoryNavToggle) return;
  const scrollCategoryNavIntoView = () => {
    if (!mobileMedia.matches) return;
    if (!header.classList.contains("is-open")) return;
    if (!categoryNav.classList.contains("is-open")) return;
    window.requestAnimationFrame(() => {
      categoryNav.scrollIntoView({
        block: "start",
        behavior: "smooth"
      });
    });
  };
  categoryNavToggle.addEventListener("click", () => {
    window.setTimeout(scrollCategoryNavIntoView, 40);
  });
};
const initMobileHeaderOffset = () => {
  const header = document.querySelector(".header");
  const headerMain = header?.querySelector(".header__main");
  const mobileMedia = window.matchMedia("(max-width: 991.98px)");
  if (!header || !headerMain) return;
  const setOffset = () => {
    const offset = mobileMedia.matches && !header.classList.contains("header--transparent") ? headerMain.offsetHeight : 0;
    document.documentElement.style.setProperty("--mobile-header-offset", `${offset}px`);
  };
  const resizeObserver = new ResizeObserver(setOffset);
  resizeObserver.observe(headerMain);
  window.addEventListener("resize", setOffset);
  mobileMedia.addEventListener("change", setOffset);
  setOffset();
};
initTransparentHeader();
initTouchDropdowns();
initCategoryDropdowns();
initCategorySubDropdowns();
initMobileSearch();
initCategoryNavSticky();
initMobileCategoryNavScroll();
initMobileHeaderOffset();
window.addEventListener("load", initInnerPageLegacyScrollGuard);
function addLoadedAttr() {
  if (!document.documentElement.hasAttribute("data-fls-preloader-loading")) {
    window.addEventListener("load", function() {
      setTimeout(function() {
        document.documentElement.setAttribute("data-fls-loaded", "");
      }, 0);
    });
  }
}
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
addLoadedAttr();
