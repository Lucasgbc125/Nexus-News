// Confere se a URL realmente é HTTP(S) antes de atribuí-la a links ou imagens.
function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function formatNewsDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
}

// Cria um card sem confiar cegamente em campos externos da API.
function createNewsCard(article, category, isFeatured = false) {
  const card = document.createElement('article');
  card.className = `news-card-live${isFeatured ? ' news-card-featured' : ''}`;
  const link = document.createElement('a');
  const articleUrl = safeUrl(article.webUrl);
  link.href = articleUrl || '#';
  link.setAttribute('aria-label', `Abrir notícia: ${article.webTitle || 'sem título'}`);

  const imageUrl = safeUrl(article.fields?.thumbnail);
  const imageBox = document.createElement('div');
  imageBox.className = 'news-image';
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => image.remove());
    imageBox.append(image);
  }

  const content = document.createElement('div');
  content.className = 'news-copy';
  const tag = document.createElement('p');
  tag.className = 'tag';
  tag.textContent = category;
  const title = document.createElement(isFeatured ? 'h2' : 'h3');
  title.textContent = article.webTitle || 'Notícia sem título disponível';
  const meta = document.createElement('p');
  meta.className = 'story-meta';
  meta.textContent = `The Guardian · ${formatNewsDate(article.webPublicationDate)}`;
  content.append(tag, title, meta);
  link.append(imageBox, content);
  card.append(link);

  // Abre a matéria no Google Tradutor. Não envia a notícia a uma API própria
  // e não exige chave; o leitor continua no controle da tradução.
  if (articleUrl) {
    const translate = document.createElement('a');
    translate.className = 'translate-link';
    translate.href = `https://translate.google.com/translate?sl=auto&tl=pt&u=${encodeURIComponent(articleUrl)}`;
    translate.target = '_blank';
    translate.rel = 'noopener noreferrer';
    translate.textContent = 'Traduzir para português ↗';
    translate.setAttribute('aria-label', `Traduzir para português: ${article.webTitle || 'notícia'}`);
    card.append(translate);
  }

  return card;
}
