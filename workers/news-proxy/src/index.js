const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';
const ALLOWED_SECTIONS = new Set(['world', 'business', 'technology', 'sport']);

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body, status, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

function validLimit(value) {
  const parsed = Number.parseInt(value || '4', 10);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 5) : 4;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const allowedOrigin = env.ALLOWED_ORIGIN;

    if (request.method === 'OPTIONS') {
      if (origin !== allowedOrigin) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    if (request.method !== 'GET' || origin !== allowedOrigin) {
      return json({ error: 'Origem ou método não permitido.' }, 403, allowedOrigin);
    }

    if (!env.GUARDIAN_API_KEY) {
      return json({ error: 'Proxy ainda não configurado.' }, 503, allowedOrigin);
    }

    const incoming = new URL(request.url);
    const section = incoming.searchParams.get('section');
    const query = (incoming.searchParams.get('q') || '').trim();

    if (section && !ALLOWED_SECTIONS.has(section)) {
      return json({ error: 'Seção inválida.' }, 400, allowedOrigin);
    }
    if (!section && !query) {
      return json({ error: 'Informe uma seção ou busca.' }, 400, allowedOrigin);
    }

    const cache = caches.default;
    const cached = await cache.match(request);
    if (cached) return cached;

    const parameters = new URLSearchParams({
      'api-key': env.GUARDIAN_API_KEY,
      'page-size': String(validLimit(incoming.searchParams.get('limit'))),
      'order-by': 'newest',
      'show-fields': 'thumbnail,trailText',
    });
    if (section) parameters.set('section', section);
    if (query) parameters.set('q', query.slice(0, 100));

    try {
      const response = await fetch(GUARDIAN_API_URL + '?' + parameters);
      if (!response.ok) {
        return json({ error: 'A fonte de notícias não respondeu agora.' }, 502, allowedOrigin);
      }

      const data = await response.json();
      const results = (data.response?.results || []).map((article) => ({
        webTitle: article.webTitle,
        webUrl: article.webUrl,
        webPublicationDate: article.webPublicationDate,
        fields: { thumbnail: article.fields?.thumbnail || null },
      }));
      const publicResponse = json(
        { results },
        200,
        allowedOrigin,
        { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
      );
      ctx.waitUntil(cache.put(request, publicResponse.clone()));
      return publicResponse;
    } catch {
      return json({ error: 'Não foi possível consultar a fonte de notícias.' }, 502, allowedOrigin);
    }
  },
};
