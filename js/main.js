// A chave permite reutilizar o mesmo nome sempre que salvamos o tema no navegador.
const THEME_KEY = 'nexus-news-theme';

const themeButton = document.querySelector('.theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const clocksContainer = document.querySelector('#clocks');
const citySelect = document.querySelector('#city-select');
const currentDate = document.querySelector('#current-date');
const currencyTicker = document.querySelector('#currency-ticker');
const currencyStatus = document.querySelector('#currency-status');
const weatherSection = document.querySelector('#clima');
const mobilityPanel = document.querySelector('#mobility-panel');
const newsSections = [
  { id: 'highlights-news', section: 'world', label: 'DESTAQUE', maxRecords: 5, featured: true },
  { id: 'sao-paulo-news', query: 'São Paulo', label: 'SÃO PAULO', maxRecords: 4 },
  { id: 'economia-news', section: 'business', label: 'ECONOMIA', maxRecords: 4 },
  { id: 'tecnologia-news', section: 'technology', label: 'TECNOLOGIA', maxRecords: 4 },
  { id: 'esportes-news', section: 'sport', label: 'ESPORTES', maxRecords: 4 },
];
let isNewsUpdateRunning = false;

// Cada cidade guarda o fuso horário reconhecido pela API nativa Intl.
const cities = [
  { name: 'Brasília', icon: '🇧🇷', zone: 'America/Sao_Paulo' },
  { name: 'Nova York', icon: '🇺🇸', zone: 'America/New_York' },
  { name: 'Londres', icon: '🇬🇧', zone: 'Europe/London' },
  { name: 'Tóquio', icon: '🇯🇵', zone: 'Asia/Tokyo' },
];

const additionalCities = {
  'America/Los_Angeles': { name: 'Los Angeles', icon: '🇺🇸' },
  'Europe/Paris': { name: 'Paris', icon: '🇫🇷' },
  'Asia/Seoul': { name: 'Seul', icon: '🇰🇷' },
  'Australia/Sydney': { name: 'Sydney', icon: '🇦🇺' },
};

// Aplica o tema escolhido e atualiza os textos acessíveis do botão.
function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  themeButton.querySelector('span').textContent = isDark ? '☀' : '☾';
  themeButton.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
}

// Lê a preferência salva. Sem valor salvo, o portal começa no tema claro.
function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
}

themeButton.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

// No celular, este botão exibe ou recolhe o menu de navegação.
menuButton.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '×' : '☰';
});

// Formata a hora atual para o fuso recebido, sem depender de uma API externa.
function formatTime(timeZone) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(new Date());
}

// Atualiza data e relógios. createElement/textContent evitam inserir HTML dinâmico.
function updateClocks() {
  currentDate.textContent = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
  }).format(new Date());

  clocksContainer.replaceChildren(...cities.map((city) => {
    const card = document.createElement('div');
    const cityName = document.createElement('span');
    const time = document.createElement('strong');
    cityName.textContent = `${city.icon} ${city.name}`;
    time.textContent = formatTime(city.zone);
    card.append(cityName, time);
    return card;
  }));
}

// Atualiza o painel de moedas. A API fornece a taxa em relação ao BRL,
// e o componente converte para exibir quanto custa uma unidade de cada moeda.
async function updateCurrencyPanel() {
  currencyStatus.textContent = 'Atualizando cotações...';

  try {
    const { latest, previous } = await window.currencyApi.loadCurrencies();
    const items = window.currencyApi.CURRENCIES.map((currency) => (
      createCurrencyItem(currency, latest.rates[currency], previous.rates[currency])
    ));

    currencyTicker.replaceChildren(...items);
    const date = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${latest.date}T12:00:00Z`));
    currencyStatus.textContent = `Atualizado em ${date}`;
  } catch (error) {
    currencyTicker.replaceChildren();
    currencyStatus.textContent = 'Não foi possível atualizar as cotações.';
  }
}

// Atualiza as condições atuais e a previsão dos próximos quatro dias.
async function updateWeatherPanel() {
  weatherSection.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'weather-loading';
  loading.textContent = 'Carregando previsão para São Paulo...';
  weatherSection.append(loading);

  try {
    const data = await window.weatherApi.loadWeather();
    weatherSection.replaceChildren(createWeatherCard(data));
    updateMobilityPanel(data);
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'weather-loading';
    message.textContent = 'Não foi possível carregar a previsão do tempo.';
    weatherSection.replaceChildren(message);
    const mobilityMessage = document.createElement('p');
    mobilityMessage.className = 'news-state';
    mobilityMessage.textContent = 'Não foi possível carregar as informações de mobilidade no momento.';
    mobilityPanel.replaceChildren(mobilityMessage);
  }
}

// O alerta de chuva reutiliza a mesma resposta de clima; só a qualidade do ar
// precisa de uma nova consulta, evitando repetir a requisição meteorológica.
async function updateMobilityPanel(weatherData) {
  mobilityPanel.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'news-state';
  loading.textContent = 'Carregando informações de serviço...';
  mobilityPanel.append(loading);

  try {
    const airData = await window.mobilityApi.loadAirQuality();
    mobilityPanel.replaceChildren(createMobilityPanel(weatherData, airData));
  } catch (error) {
    loading.textContent = 'Não foi possível carregar a qualidade do ar no momento.';
  }
}

// Busca e exibe as notícias de uma seção, mantendo a falha isolada das outras seções.
async function updateNewsSection({ id, section, query, label, maxRecords, featured }) {
  const container = document.querySelector(`#${id}`);
  container.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'news-state';
  loading.textContent = 'Carregando notícias...';
  container.append(loading);

  try {
    const articles = await window.newsApi.loadNews({ section, query, maxRecords });
    if (articles.length === 0) {
      loading.textContent = 'Não foram encontradas notícias para esta seção no momento.';
      return;
    }

    container.replaceChildren(...articles.map((article, index) => (
      createNewsCard(article, label, Boolean(featured && index === 0))
    )));
  } catch (error) {
    loading.textContent = 'Não foi possível carregar estas notícias no momento.';
  }
}

// O plano gratuito do Guardian permite uma consulta por segundo. Por isso as
// categorias entram em uma fila, em vez de dispararmos cinco requisições ao mesmo tempo.
function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function updateNews() {
  // Evita uma segunda fila caso a atualização anterior ainda esteja acontecendo.
  if (isNewsUpdateRunning) return;
  isNewsUpdateRunning = true;

  try {
    for (const [index, section] of newsSections.entries()) {
      await updateNewsSection(section);
      if (index < newsSections.length - 1) await wait(1100);
    }
  } finally {
    isNewsUpdateRunning = false;
  }
}

// Inclui a cidade selecionada e mantém no máximo cinco relógios visíveis.
citySelect.addEventListener('change', () => {
  const zone = citySelect.value;
  const city = additionalCities[zone];
  if (city && !cities.some((item) => item.zone === zone)) {
    cities.push({ ...city, zone });
    // As quatro cidades iniciais permanecem; uma nova escolha troca a cidade extra.
    if (cities.length > 5) cities.splice(4, 1);
    updateClocks();
  }
  citySelect.value = '';
});

// A busca será conectada às notícias reais em uma fase futura. Por enquanto,
// evitamos que a tecla Enter recarregue a página durante a demonstração.
document.querySelector('#search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') event.preventDefault();
});

loadSavedTheme();
updateClocks();
// Atualização local a cada segundo: não cria requisições à internet.
setInterval(updateClocks, 1000);
updateCurrencyPanel();
// As cotações da fonte são diárias; uma hora evita requisições desnecessárias.
setInterval(updateCurrencyPanel, 60 * 60 * 1000);
updateWeatherPanel();
// A previsão muda lentamente; uma atualização por hora é suficiente.
setInterval(updateWeatherPanel, 60 * 60 * 1000);
updateNews();
// Notícias mudam mais rápido, mas 30 minutos evita consultas excessivas.
setInterval(updateNews, 30 * 60 * 1000);
