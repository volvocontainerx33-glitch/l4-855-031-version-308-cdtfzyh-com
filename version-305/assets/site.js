(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobileNav.classList.toggle("open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    const searchInputs = Array.from(document.querySelectorAll(".js-search"));
    const yearSelects = Array.from(document.querySelectorAll(".js-year-filter"));

    function applyFilters() {
        const query = searchInputs
            .map(function (input) {
                return input.value.trim().toLowerCase();
            })
            .filter(Boolean)
            .join(" ");

        const selectedYear = yearSelects.length ? yearSelects[0].value : "";
        const cards = Array.from(document.querySelectorAll(".movie-card"));
        let visibleCount = 0;

        cards.forEach(function (card) {
            const haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();

            const matchesQuery = !query || haystack.includes(query);
            const matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
            const visible = matchesQuery && matchesYear;

            card.style.display = visible ? "" : "none";
            if (visible) {
                visibleCount += 1;
            }
        });

        document.querySelectorAll(".empty-state").forEach(function (node) {
            node.style.display = visibleCount === 0 ? "block" : "none";
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
    });

    yearSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });
})();
