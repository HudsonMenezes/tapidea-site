# tapidea-site

Landing page do TapIdea, app de notas de voz para iPhone. HTML, CSS e JavaScript puros, sem build. Publicada na Vercel.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | A página, com as metatags, os dados estruturados (schema.org) e as perguntas frequentes |
| `styles.css` | Estilos, com os mesmos tokens de cor e fonte do app |
| `main.js` | Animação do Orb e envio do formulário da lista do beta |
| `llms.txt` | Resumo do app para assistentes de IA ([llmstxt.org](https://llmstxt.org)) |
| `robots.txt`, `sitemap.xml` | Para buscadores e robôs de IA |
| `vercel.json` | Cabeçalhos de segurança e cache |
| `assets/screens/` | Telas do app (WebP, 660 × 1434) |
| `google-apps-script/lista-do-beta.gs` | Script que grava a lista do beta numa planilha do Google |

## Ver no computador

Qualquer servidor estático, na pasta do projeto:

```bash
npx serve .
```

Abra o endereço que aparecer (normalmente http://localhost:3000).

## Publicar na Vercel

1. Na Vercel: **Add New → Project**, importe o repositório `tapidea-site`.
2. Framework: **Other**. Sem comando de build e sem pasta de saída (deixe em branco).
3. Nome do projeto: `tapidea-lista`. O endereço é `tapidea-lista.vercel.app`.
4. Depois disso, cada push no `main` publica sozinho.

Ao mudar o endereço (por exemplo, para `tapidea.app`), troque-o em `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt`, `sitemap.xml` e `llms.txt`.

## Lista do beta (planilha do Google)

O formulário grava cada inscrição numa planilha do Google (abre no Excel e pode ser baixada em `.xlsx`).

1. Crie uma planilha nova no Google Planilhas, por exemplo "TapIdea — Lista do beta".
2. Menu **Extensões → Apps Script**. Apague o código que vier e cole o conteúdo de `google-apps-script/lista-do-beta.gs`. Salve.
3. **Implantar → Nova implantação** → tipo **App da Web**:
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**.
4. Autorize o acesso à planilha quando pedir.
5. Copie a **URL do app da Web** (termina em `/exec`) e cole em `main.js`, na constante `WAITLIST_URL`.
6. Commit e push. A aba **Lista** é criada na primeira inscrição.

Ao mudar o script depois, use **Implantar → Gerenciar implantações → editar → Nova versão** para manter a mesma URL.

Para baixar em Excel: **Arquivo → Fazer download → Microsoft Excel (.xlsx)**.

## Imagem de compartilhamento

`og.png` (1200 × 630) aparece quando o link é compartilhado no WhatsApp, X, LinkedIn etc.
