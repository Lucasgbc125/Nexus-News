// Esta camada fala com a fonte de notícias. Trocar de API no futuro fica concentrado aqui.
const NEWS_API_URL = 'https://content.guardianapis.com/search';
// A chave "test" é pública e aparece na documentação do Guardian.
// Para publicar um projeto real, crie uma chave Developer gratuita e configure-a separadamente.
const GUARDIAN_DEMO_KEY = 'test';

// Busca uma lista pequena de artigos recentes para respeitar a fonte e carregar rápido.
async function loadNews({ section, query, maxRecords = 4 }) {
  const parameters = new URLSearchParams({
    'api-key': GUARDIAN_DEMO_KEY,
    'page-size': String(maxRecords),
    'order-by': 'newest',
    'show-fields': 'thumbnail,trailText',
  });
  if (section) parameters.set('section', section);
  if (query) parameters.set('q', query);

  try {
    const response = await fetch(`${NEWS_API_URL}?${parameters}`);
    if (!response.ok) throw new Error('A API de notícias respondeu com erro.');

    const data = await response.json();
    return data.response?.results || [];
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    throw error;
  }
}

window.newsApi = { loadNews };
