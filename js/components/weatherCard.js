// Os códigos WMO são convertidos para uma descrição e um ícone simples para a interface.
function weatherDescription(code) {
  const conditions = {
    0: ['☀️', 'Céu limpo'], 1: ['🌤️', 'Predominantemente limpo'],
    2: ['⛅', 'Parcialmente nublado'], 3: ['☁️', 'Nublado'],
    45: ['🌫️', 'Neblina'], 48: ['🌫️', 'Neblina com geada'],
    51: ['🌦️', 'Garoa leve'], 53: ['🌦️', 'Garoa'], 55: ['🌧️', 'Garoa intensa'],
    61: ['🌧️', 'Chuva leve'], 63: ['🌧️', 'Chuva'], 65: ['🌧️', 'Chuva intensa'],
    80: ['🌦️', 'Pancadas de chuva'], 81: ['🌦️', 'Pancadas de chuva'], 82: ['🌧️', 'Pancadas intensas'],
    95: ['⛈️', 'Trovoadas'], 96: ['⛈️', 'Trovoadas'], 99: ['⛈️', 'Trovoadas'],
  };
  return conditions[code] || ['🌡️', 'Condições variáveis'];
}

function roundedTemperature(value) {
  return `${Math.round(value)}°`;
}

function forecastLabel(date, index) {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '');
}

// Monta o cartão a partir dos dados confiáveis retornados pela API.
function createWeatherCard(data) {
  const [icon, description] = weatherDescription(data.current.weather_code);
  const card = document.createElement('div');
  card.className = 'weather-content';
  const heading = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'PREVISÃO · SÃO PAULO';
  const title = document.createElement('h2');
  title.textContent = 'Clima';
  heading.append(eyebrow, title);

  const now = document.createElement('div');
  now.className = 'weather-now';
  now.append(document.createTextNode(icon));
  const temperature = document.createElement('strong');
  temperature.textContent = roundedTemperature(data.current.temperature_2m);
  const summary = document.createElement('p');
  summary.textContent = description;
  const feelsLike = document.createElement('small');
  feelsLike.textContent = `Sensação de ${roundedTemperature(data.current.apparent_temperature)}`;
  summary.append(document.createElement('br'), feelsLike);
  now.append(temperature, summary);

  const details = document.createElement('div');
  details.className = 'weather-details';
  const today = [data.daily.temperature_2m_max[0], data.daily.temperature_2m_min[0]];
  [['Máx.', roundedTemperature(today[0])], ['Mín.', roundedTemperature(today[1])],
    ['Umidade', `${data.current.relative_humidity_2m}%`], ['Vento', `${Math.round(data.current.wind_speed_10m)} km/h`]]
    .forEach(([label, value]) => {
      const detail = document.createElement('span');
      detail.textContent = `${label} `;
      const bold = document.createElement('b');
      bold.textContent = value;
      detail.append(bold);
      details.append(detail);
    });

  heading.append(now, details);
  const forecast = document.createElement('div');
  forecast.className = 'forecast';
  data.daily.time.forEach((date, index) => {
    const day = document.createElement('div');
    const dayIcon = weatherDescription(data.daily.weather_code[index])[0];
    const dayName = document.createElement('span');
    const icon = document.createElement('b');
    const maximum = document.createElement('strong');
    dayName.textContent = forecastLabel(date, index);
    icon.textContent = dayIcon;
    maximum.textContent = roundedTemperature(data.daily.temperature_2m_max[index]);
    day.append(dayName, icon, maximum);
    forecast.append(day);
  });

  card.append(heading, forecast);
  return card;
}
