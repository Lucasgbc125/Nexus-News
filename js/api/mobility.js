// A qualidade do ar usa uma API pública diferente da previsão do tempo.
// Mantemos a consulta isolada para facilitar uma futura troca de fonte.
const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

async function loadAirQuality() {
  const parameters = new URLSearchParams({
    latitude: '-23.5505',
    longitude: '-46.6333',
    current: 'european_aqi,pm2_5,pm10',
    timezone: 'America/Sao_Paulo',
  });

  try {
    const response = await fetch(`${AIR_QUALITY_API_URL}?${parameters}`);
    if (!response.ok) throw new Error('A API de qualidade do ar respondeu com erro.');
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar qualidade do ar:', error);
    throw error;
  }
}

window.mobilityApi = { loadAirQuality };
