// O portal consulta o Worker, que guarda a chave do Guardian como Secret.
// Assim, a chave não fica exposta no GitHub Pages nem nos dispositivos visitantes.
const NEWS_API_URL = 'https://nexus-news-proxy.news-proxy.workers.dev/';

// Busca uma lista pequena de artigos recentes para respeitar a fonte e carregar rápido.
async function loadNews({ section, query, maxRecords = 4 }) {
  const parameters = new URLSearchParams({
    limit: String(maxRecords),
  });
  if (section) parameters.set('section', section);
  if (query) parameters.set('q', query);

  try {
    const response = await fetch(NEWS_API_URL + '?' + parameters);
    if (!response.ok) throw new Error('A API de notícias respondeu com erro.');

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    throw error;
  }
}

window.newsApi = { loadNews };
