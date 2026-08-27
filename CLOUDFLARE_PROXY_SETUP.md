# Proxy seguro de notícias

Este diretório contém o Cloudflare Worker que faz a consulta ao Guardian sem expor a chave no GitHub Pages. A chave não deve ser copiada para nenhum arquivo versionado.

## Publicar uma vez

1. Crie uma conta gratuita em https://dash.cloudflare.com/sign-up e confirme o e-mail.
2. No PowerShell, entre nesta pasta:

~~~powershell
Set-Location "C:\Users\polar_125\Desktop\projetos 2.0\Nexus-News\workers\news-proxy"
~~~

3. Autentique o computador e publique o Worker:

~~~powershell
npx wrangler login
npx wrangler deploy
~~~

4. Guarde a chave do Guardian como segredo protegido. Quando o comando solicitar o valor, cole a chave recebida do Guardian; ela não aparecerá no repositório:

~~~powershell
npx wrangler secret put GUARDIAN_API_KEY
~~~

5. O terminal exibirá o endereço do Worker, normalmente semelhante a:

~~~text
https://nexus-news-proxy.SEU_SUBDOMINIO.workers.dev
~~~

Copie esse endereço e informe-o na conversa. Só então o site será atualizado para usar o proxy.

## Segurança

- A chave fica apenas nos Secrets do Cloudflare Worker.
- O Worker só aceita chamadas do endereço https://lucasgbc125.github.io.
- Aceita somente as seções usadas pelo portal e limita a cinco itens por consulta.
- As respostas ficam em cache por cinco minutos para reduzir consumo da cota.
