// Centraliza a consulta de clima. São Paulo foi fixada nesta fase para manter o exemplo simples.
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo' };

// Consulta apenas os campos que o layout utiliza, reduzindo o tamanho da resposta.
async function loadWeather() {
  const parameters = new URLSearchParams({
    latitude: SAO_PAULO.latitude,
    longitude: SAO_PAULO.longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: SAO_PAULO.timezone,
    forecast_days: '4',
  });

  try {
    const response = await fetch(`${WEATHER_API_URL}?${parameters}`);
    if (!response.ok) throw new Error('A API de clima respondeu com erro.');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar clima:', error);
    throw error;
  }
}

window.weatherApi = { loadWeather };
