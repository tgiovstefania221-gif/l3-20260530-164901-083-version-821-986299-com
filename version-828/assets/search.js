const input = document.querySelector('[data-site-search]');
const results = document.querySelector('[data-search-results]');

const renderResults = (items) => {
  if (!results) {
    return;
  }

  results.innerHTML = items.map((item) => {
    const text = `${item.region} · ${item.year} · ${item.type} · ${item.genre}`;

    return `
      <article class="search-result-card">
        <a href="${item.file}">
          <img src="./${item.cover}" alt="${item.title}" loading="lazy">
        </a>
        <div>
          <h2><a href="${item.file}">${item.title}</a></h2>
          <div class="movie-meta">
            <span>${text}</span>
          </div>
          <p>${item.oneLine}</p>
          <a class="btn btn-dark" href="${item.file}">查看详情</a>
        </div>
      </article>`;
  }).join('');
};

const findItems = () => {
  const query = input ? input.value.trim().toLowerCase() : '';

  if (!query) {
    renderResults(SEARCH_MOVIES.slice(0, 30));
    return;
  }

  const matched = SEARCH_MOVIES.filter((item) => {
    const text = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.tags,
      item.oneLine
    ].join(' ').toLowerCase();

    return text.includes(query);
  }).slice(0, 80);

  renderResults(matched);
};

if (input) {
  input.addEventListener('input', findItems);
}

findItems();
