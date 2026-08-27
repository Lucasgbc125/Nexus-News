# Nexus News

Portal de notícias fictício criado de forma progressiva para estudar HTML, CSS e JavaScript.

## Fases 1 a 6 — layout, tema, relógios, moedas, clima, notícias e serviços

O portal possui a estrutura visual com dados fictícios: cabeçalho, navegação, indicadores, seções de notícias, clima, mais lidas e rodapé. O modo escuro é salvo com `localStorage`.

Na Fase 2, os relógios usam `Intl.DateTimeFormat`, recurso nativo que converte a hora atual para cada fuso horário. Eles atualizam a cada segundo e o seletor permite acrescentar uma cidade.

Na Fase 3, o painel de moedas consulta a [Frankfurter](https://frankfurter.dev/v1/), uma API pública que não exige chave. As cotações de USD, EUR, GBP e JPY são exibidas em reais e comparadas com o último dia útil. A consulta é repetida a cada hora; em caso de erro, uma mensagem aparece no painel sem quebrar a página.

Na Fase 4, a previsão de São Paulo usa a [Open-Meteo](https://open-meteo.com/en/docs), também sem chave. O cartão mostra condições atuais, sensação térmica, máxima, mínima, umidade, vento e os próximos quatro dias. A atualização ocorre a cada hora.

Na Fase 5, os destaques, São Paulo, economia, tecnologia e esportes usam a [Guardian Open Platform](https://open-platform.theguardian.com/documentation/search) por meio de um Cloudflare Worker. A chave Developer fica guardada como Secret no Worker e não é enviada ao GitHub Pages. Os cards apresentam título, fonte, data e link para a matéria original; imagens só aparecem quando a fonte fornece uma URL HTTPS válida. A atualização ocorre a cada 30 minutos.

Cada card também possui o botão **Traduzir para português**, que abre a matéria original no Google Tradutor. Essa opção não usa chave de API nem altera o texto original do portal.

Na Fase 6, Games foi substituído por **Mobilidade & Serviços**. A seção apresenta a regra diária de rodízio, alerta de chuva reutilizando a previsão atual, qualidade do ar por meio da [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) e atalhos para SPTrans, CET, SP Mais Cultura e SP156. O status em tempo real de linhas e ônibus não é exibido porque a API Olho Vivo da SPTrans exige token; o portal direciona para a fonte oficial em vez de inventar dados.

## Como executar

Abra `index.html` em um navegador. Como ainda não há APIs, não é necessário instalar dependências nem configurar chaves.

## Estrutura

```
index.html          estrutura semântica da página
css/variables.css   cores dos temas claro e escuro
css/style.css       layout e componentes visuais
css/responsive.css  ajustes para tablet e celular
js/main.js          dark mode, menu móvel e painel de moedas
js/api/currency.js  consulta à API de moedas
js/components/currencyCard.js criação dos itens de cotação
js/api/weather.js   consulta à API de clima
js/components/weatherCard.js criação do cartão de clima
js/api/news.js      consulta à fonte de notícias
js/components/newsCard.js criação segura dos cards de notícia
js/api/mobility.js  consulta de qualidade do ar
js/components/mobilityCard.js cartão de mobilidade e serviços
```

## Próximas fases

Relógios reais, moedas, clima, notícias, games, favoritos e busca serão adicionados uma fase por vez, depois da confirmação do layout base.
