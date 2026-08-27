const OFFICIAL_LINKS = {
  transit: 'https://www.sptrans.com.br/',
  culture: 'https://spmaiscultura.prefeitura.sp.gov.br/',
  services: 'https://sp156.prefeitura.sp.gov.br/portal/servicos',
  traffic: 'https://www.cetsp.com.br/',
  rodizio: 'https://prefeitura.sp.gov.br/w/servico/rodizio',
};

function airQualityLabel(value) {
  if (value <= 20) return 'Boa';
  if (value <= 40) return 'Razoável';
  if (value <= 60) return 'Moderada';
  if (value <= 80) return 'Ruim';
  if (value <= 100) return 'Muito ruim';
  return 'Extremamente ruim';
}

// A regra segue a tabela oficial. Feriados não são calculados automaticamente,
// por isso o cartão sempre mostra o link da Prefeitura para confirmação.
function getRodizioToday() {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', timeZone: 'America/Sao_Paulo',
  }).format(new Date());
  const plates = { Mon: '1 e 2', Tue: '3 e 4', Wed: '5 e 6', Thu: '7 e 8', Fri: '9 e 0' };
  return plates[weekday]
    ? `Hoje: placas finais ${plates[weekday]} — 7h–10h e 17h–20h (exceto feriados).`
    : 'Hoje não há rodízio regular. Confirme exceções no site oficial.';
}

function rainAlert(weatherCode) {
  return weatherCode >= 51
    ? 'Atenção: há indicação de chuva nas condições atuais. Considere sair com antecedência.'
    : 'Sem indicação de chuva nas condições atuais.';
}

function createServiceLink(title, text, href) {
  const link = document.createElement('a');
  link.className = 'service-link';
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const heading = document.createElement('strong');
  heading.textContent = title;
  const detail = document.createElement('span');
  detail.textContent = text;
  link.append(heading, detail);
  return link;
}

// Reúne dados ao vivo e orientações oficiais sem simular status de transporte.
function createMobilityPanel(weatherData, airData) {
  const panel = document.createElement('div');
  panel.className = 'mobility-grid';
  const air = airData.current;
  const airCard = document.createElement('article');
  airCard.className = 'service-card air-card';
  const airTitle = document.createElement('p');
  airTitle.className = 'eyebrow';
  airTitle.textContent = 'QUALIDADE DO AR · SÃO PAULO';
  const airValue = document.createElement('strong');
  airValue.className = 'air-value';
  airValue.textContent = airQualityLabel(air.european_aqi);
  const airDetail = document.createElement('p');
  airDetail.textContent = `Índice europeu: ${Math.round(air.european_aqi)} · PM2,5: ${air.pm2_5} µg/m³`;
  airCard.append(airTitle, airValue, airDetail);

  const alertCard = document.createElement('article');
  alertCard.className = 'service-card';
  const alertTitle = document.createElement('p');
  alertTitle.className = 'eyebrow';
  alertTitle.textContent = 'ALERTA DE CHUVA';
  const alertText = document.createElement('p');
  alertText.textContent = rainAlert(weatherData.current.weather_code);
  alertCard.append(alertTitle, alertText);

  const rodizioCard = document.createElement('article');
  rodizioCard.className = 'service-card';
  const rodizioTitle = document.createElement('p');
  rodizioTitle.className = 'eyebrow';
  rodizioTitle.textContent = 'RODÍZIO MUNICIPAL';
  const rodizioText = document.createElement('p');
  rodizioText.textContent = getRodizioToday();
  rodizioCard.append(rodizioTitle, rodizioText);

  const links = document.createElement('div');
  links.className = 'service-links';
  links.append(
    createServiceLink('Trânsito e transporte', 'Consulte linhas, ônibus e vias em fontes oficiais.', OFFICIAL_LINKS.transit),
    createServiceLink('Agenda cultural', 'Veja eventos, atividades e programação gratuita.', OFFICIAL_LINKS.culture),
    createServiceLink('Serviços públicos', 'Acesse solicitações e avisos no SP156.', OFFICIAL_LINKS.services),
    createServiceLink('Trânsito CET', 'Acompanhe as informações da CET.', OFFICIAL_LINKS.traffic),
    createServiceLink('Regras do rodízio', 'Confirme feriados, área e exceções.', OFFICIAL_LINKS.rodizio),
  );

  panel.append(airCard, alertCard, rodizioCard, links);
  return panel;
}
