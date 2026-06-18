const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
  menuButton.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let current = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  if (prev) {
    prev.addEventListener('click', () => showSlide(current - 1));
  }

  if (next) {
    next.addEventListener('click', () => showSlide(current + 1));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  window.setInterval(() => showSlide(current + 1), 5000);
}

const filterInput = document.querySelector('[data-filter-input]');
const yearFilter = document.querySelector('[data-year-filter]');
const cards = Array.from(document.querySelectorAll('[data-card]'));

const applyFilters = () => {
  const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
  const year = yearFilter ? yearFilter.value : '';
  let visible = 0;

  cards.forEach((card) => {
    const searchText = card.getAttribute('data-search') || '';
    const cardYear = card.getAttribute('data-year') || '';
    const matchedQuery = !query || searchText.includes(query);
    const matchedYear = !year || cardYear === year;
    const shouldShow = matchedQuery && matchedYear;

    card.style.display = shouldShow ? '' : 'none';

    if (shouldShow) {
      visible += 1;
    }
  });

  const emptyState = document.querySelector('[data-empty-state]');

  if (emptyState) {
    emptyState.classList.toggle('is-visible', visible === 0);
  }
};

if (filterInput) {
  filterInput.addEventListener('input', applyFilters);
}

if (yearFilter) {
  yearFilter.addEventListener('change', applyFilters);
}
