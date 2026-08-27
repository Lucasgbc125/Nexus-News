// Converte a taxa recebida (1 BRL = X moeda) para a apresentação em reais.
function rateInReais(rate) {
  return 1 / rate;
}

// Formata cada moeda respeitando o número de casas decimais esperado.
function formatCurrencyValue(value, currency) {
  const digits = currency === 'JPY' ? 4 : 2;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// Cria um item do painel usando somente textContent, sem inserir HTML da API.
function createCurrencyItem(currency, latestRate, previousRate) {
  const latestInReais = rateInReais(latestRate);
  const previousInReais = rateInReais(previousRate);
  const change = ((latestInReais - previousInReais) / previousInReais) * 100;
  const isUp = change >= 0;
  const item = document.createElement('span');
  const value = document.createElement('strong');
  const variation = document.createElement('b');

  item.append(document.createTextNode(`${currency} `));
  value.textContent = formatCurrencyValue(latestInReais, currency);
  variation.className = isUp ? 'up' : 'down';
  variation.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;
  item.append(value, variation);
  return item;
}
