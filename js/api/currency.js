// Este arquivo concentra a comunicação com a API de moedas.
// Se futuramente você trocar de serviço, a alteração fica principalmente aqui.
const CURRENCY_API_URL = 'https://api.frankfurter.dev/v1';
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];

// Retorna uma data anterior no formato aceito pela API (AAAA-MM-DD).
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

// Esta função consulta as cotações em relação ao real brasileiro (BRL).
async function loadCurrencies() {
  const symbols = CURRENCIES.join(',');
  const latestUrl = `${CURRENCY_API_URL}/latest?base=BRL&symbols=${symbols}`;
  // A janela de sete dias encontra o último dia útil mesmo após fins de semana e feriados.
  const previousUrl = `${CURRENCY_API_URL}/${getDateDaysAgo(7)}..${getDateDaysAgo(1)}?base=BRL&symbols=${symbols}`;

  try {
    const [latestResponse, previousResponse] = await Promise.all([
      fetch(latestUrl),
      fetch(previousUrl),
    ]);

    if (!latestResponse.ok || !previousResponse.ok) {
      throw new Error('A API de cotações respondeu com erro.');
    }

    const [latest, previous] = await Promise.all([
      latestResponse.json(),
      previousResponse.json(),
    ]);

    const availableDates = Object.keys(previous.rates).sort();
    const lastAvailableDate = availableDates.at(-1);

    if (!lastAvailableDate) {
      throw new Error('A API não retornou uma cotação anterior para comparação.');
    }

    return {
      latest,
      previous: {
        date: lastAvailableDate,
        rates: previous.rates[lastAvailableDate],
      },
    };
  } catch (error) {
    console.error('Erro ao carregar moedas:', error);
    throw error;
  }
}

window.currencyApi = { loadCurrencies, CURRENCIES };
