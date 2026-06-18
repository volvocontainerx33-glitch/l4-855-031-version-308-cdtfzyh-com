(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
        });
      }
      window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var cardList = document.querySelector("[data-card-list]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var activeChip = "";

    if (searchInput && searchInput.hasAttribute("data-query-sync")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
    }

    function textOf(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-category") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-keywords") || ""
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesChip = !activeChip || haystack.indexOf(activeChip.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchesTerm && matchesChip));
      });
    }

    function sortCards() {
      if (!sortSelect || !cardList) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === "rating") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        });
      } else if (value === "views") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
      } else if (value === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else {
        sorted.sort(function (a, b) {
          return Number((a.querySelector(".rank-badge") || {}).textContent || a.getAttribute("data-title").length) - Number((b.querySelector(".rank-badge") || {}).textContent || b.getAttribute("data-title").length);
        });
      }
      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
      cards = sorted;
      applyFilters();
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
      applyFilters();
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.getAttribute("data-filter-chip") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilters();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
  });
})();
