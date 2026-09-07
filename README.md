# Institutional Website Architecture

Template sem dependências para sites institucionais de médio porte (normalmente entre 7 e 15 páginas). Usa HTML5, CSS3 modular e JavaScript moderno com ES Modules nativos, sendo compatível com VS Code + Live Server.

## Princípios

- Mobile First e navegadores modernos.
- Sem frameworks, bundlers, TypeScript ou `package.json`.
- HTML com estrutura e conteúdo; CSS e JavaScript em arquivos externos.
- Crescimento incremental: criar apenas o que o projeto precisar.

## Organização

| Diretório | Finalidade |
| --- | --- |
| `assets/css/` | Estilos em camadas: tokens, reset, base, layout e componentes. |
| `assets/js/` | `main.js` e módulos `core`, `components`, `features` e `utils`. |
| `assets/images/`, `icons/`, `fonts/` | Recursos visuais e fontes locais. |
| `components/` | Fragmentos HTML reutilizáveis, quando houver necessidade real. |
| `pages/` | Páginas internas do site. |
| `data/` | Configurações e conteúdo preparado para futuros idiomas. |
| `public/` | Metadados e arquivos públicos do site. |
| `errors/` | Páginas estáticas de erro. |

## Arquitetura JavaScript

O JavaScript usa ES Modules nativos. `assets/js/main.js` é o único ponto de entrada e inicia a aplicação somente após o DOM estar disponível. Não há estado em `window` nem store global: `initApp()` cria e retorna um contexto local para o ciclo atual.

| Módulo | Responsabilidade |
| --- | --- |
| `core/app.js` | Coordena cache, loader, configuração e contexto de idioma inicial. |
| `core/config.js` | Carrega e valida `data/config.json`. |
| `core/loader.js` | Centraliza `fetch` de JSON, erros de rede e cache do recurso. |
| `core/cache.js` | Cria um cache em memória privado para cada inicialização. |
| `core/i18n.js` | Detecta idioma, carrega traduções por página e aplica fallback. |
| `utils/dom.js` | Atualizações pequenas e reutilizáveis do documento. |
| `utils/validation.js` | Validações usadas pela configuração. |
| `utils/helpers.js` | Mensagens de erro seguras para logs de desenvolvimento. |

Falhas de rede, JSON inválido ou configuração inválida são registradas no console com contexto útil. O cache ainda não é persistente entre sessões.

## Componentes HTML reutilizáveis

Os componentes comuns estão em `components/` como fragmentos HTML locais: `header.html`, `navbar.html` e `footer.html`. As páginas declaram apenas um slot, por exemplo `<div data-component-slot="header"></div>`, e `assets/js/components/component-loader.js` carrega o arquivo com o `loader` central.

Essa abordagem foi escolhida por ser a opção mais estável para HTML, CSS e ES Modules puros: funciona em Live Server e em hospedagem estática comum, não exige compilação e mantém os fragmentos fáceis de editar por qualquer pessoa. O carregador usa `fetch` e `Range#createContextualFragment()` para inserir somente HTML controlado pelo próprio repositório, sem usar `innerHTML` e sem interpretar dados JSON como HTML.

Um componente pode conter outros slots. O `header` inclui o `navbar` como opcional com `data-component-optional`; se ele falhar, o header continua disponível e um aviso é exibido no console. Falhas em componentes obrigatórios também são registradas, sem interromper o restante da inicialização.

Para um comportamento específico futuro, passe um mapa explícito de inicializadores a `createComponentLoader`, como `{ navbar: initNavbar }`. O inicializador recebe o slot já preenchido, pode ser assíncrono e não precisa registrar estado global. CSS de componentes fica em `assets/css/components.css`; cada componente deve manter seu HTML sem scripts ou estilos inline.

## Configuração central

O arquivo [data/config.json](/home/alberto/Documentos/projetos-estudos/siteforge/data/config.json) concentra somente dados que variam por cliente. Ele é carregado uma vez no ciclo de inicialização, validado por `core/config.js`, congelado para evitar mutações acidentais e disponibilizado apenas no contexto retornado por `initApp()`.

| Seção | Pode ser alterado |
| --- | --- |
| `company` | Nome e descrição institucional curta usada como metadado. |
| `assets` | Caminhos ou URLs seguros do logo e favicon. |
| `contacts` | Telefone, WhatsApp, e-mail e endereço estruturado. |
| `social` | Redes sociais como pares de nome e URL HTTPS. |
| `urls` | URL institucional, páginas legais e outros links do site. |
| `locales` | Idioma padrão e idiomas disponíveis. |
| `theme` | Esquema de cor, cor primária, hover e raio padrão. |
| `options` | Opções booleanas do site, como busca ou seletor de idioma. |

Não coloque textos de páginas, blocos HTML, código JavaScript, dados de usuários, senhas, tokens, API keys, chaves privadas ou strings de conexão nesse arquivo. O JSON é público quando servido pelo site e nunca deve conter segredos. Seus valores são tratados como dados: o template não os executa como código nem os insere com `innerHTML`.

### Redes sociais

`social` aceita novas redes sem alterar JavaScript. Acrescente uma chave em lowercase e uma URL absoluta HTTP(S):

```json
"social": {
  "instagram": "https://www.instagram.com/minhaempresa",
  "linkedin": "https://www.linkedin.com/company/minhaempresa"
}
```

### Idiomas

Defina o idioma principal em `locales.default` e relacione todos os suportados em `locales.available`. O valor padrão precisa existir na lista; por exemplo, `"default": "pt-BR"` exige `"pt-BR"` em `available`. A base seleciona o idioma inicial, mas o carregamento dos arquivos de tradução ainda será implementado quando necessário.

### Tema

Em `theme`, use `colorScheme` como `"light"` ou `"dark"`, cores no formato hexadecimal de seis dígitos (por exemplo, `"#075985"`) e um valor simples para `borderRadius`, como `"0.5rem"`. Na inicialização, esses valores atualizam os tokens CSS de cor primária e raio médio. Para alterações visuais mais amplas, mantenha os demais tokens em `assets/css/variables.css`.

## Sistema multilíngue

As traduções ficam em `data/<idioma>/`, separadas entre `global.json` e um arquivo por página. Cada página informa seu identificador no atributo `data-page` do `body`; por exemplo, a home usa `<body data-page="home">` e carrega `global.json` e `home.json`.

```text
data/
  pt-BR/{global,home,about,services,contact}.json
  en/{global,home,about,services,contact}.json
```

O idioma é escolhido nesta ordem: parâmetro `?lang=`, preferência do navegador e `locales.default` de `config.json`. O seletor nativo é criado no elemento `[data-language-selector]`; ao alterar a opção, ele atualiza `?lang=<idioma>` e recarrega a página. Novos idiomas não exigem mudanças na lógica central.

### Adicionar um idioma

1. Inclua o código em `locales.available` no `data/config.json`.
2. Crie `data/<codigo>/`.
3. Copie os arquivos JSON de um idioma existente e traduza os valores.
4. Opcionalmente, defina esse código em `locales.default`.

### Adicionar uma tradução

Adicione a mesma chave no arquivo da página e use-a no HTML com `data-i18n`. Por exemplo, `"hero.title"` no JSON corresponde a `data-i18n="hero.title"`. O texto é aplicado com `textContent`, nunca com `innerHTML`. Se a chave não existir, o conteúdo estático presente no HTML é preservado; se houver a chave correspondente no idioma padrão, ela é usada antes.

### Fallback e cache

Para uma página em idioma diferente do padrão, o sistema carrega os arquivos do idioma atual e do idioma padrão. Uma chave ausente ou um arquivo indisponível usa o valor do idioma padrão; se este também falhar, o site continua sem lançar erro e registra um aviso no console. O `loader` reaproveita cada requisição por URL em um cache em memória, inclusive para chamadas concorrentes. Esse cache dura somente enquanto a página estiver aberta; o cache HTTP do navegador continua sendo utilizado normalmente.

### Limitações atuais

O sistema depende de `fetch`, portanto abra o projeto por HTTP usando Live Server — não por `file://`. Na hospedagem estática, publique a pasta `data/` sem bloqueá-la e preserve os caminhos relativos. A troca de idioma é dinâmica e usa query string; para SEO multilíngue definitivo, cada idioma deverá ter URLs próprias, marcação `hreflang` e HTML pré-renderizado ou gerado no servidor.

## Design System base

O Design System está integralmente em `assets/css/`, sem bibliotecas externas. A ordem de importação em `index.html` também define a responsabilidade de cada camada:

| Arquivo | Responsabilidade |
| --- | --- |
| `variables.css` | Tokens globais de cores, tipografia, espaçamentos, dimensões, camadas e movimento. |
| `reset.css` | Normalização mínima e previsível dos elementos HTML. |
| `base.css` | Estilos semânticos globais, incluindo tipografia, links, botões, formulários e foco. |
| `layout.css` | Containers e estrutura de página. |
| `components.css` | Componentes reutilizáveis, somente quando o projeto realmente os demandar. |
| `utilities.css` | Pequeno conjunto de utilitários de acessibilidade, fluxo e texto. |
| `responsive.css` | Ajustes Mobile First a partir dos breakpoints definidos como referência. |

Personalize primeiro os tokens em `variables.css`. A escala usa espaçamentos de `--space-1` a `--space-9`, tamanhos de `--font-size-1` a `--font-size-7` e containers `sm`, `md` e `lg`. As media queries mantêm valores literais por limitação do CSS atual: custom properties não podem ser usadas na condição de uma media query.

O foco visível é preservado com `:focus-visible`, e `prefers-reduced-motion` reduz transições, animações e rolagem suave. Evite adicionar `outline: none` sem fornecer um indicador de foco equivalente.

## SEO e acessibilidade

O template é uma demonstração e, por segurança, vem com `noindex, nofollow` em `index.html`, páginas de erro e `Disallow: /` em `public/robots.txt`. O sitemap em `public/sitemap.xml` está intencionalmente vazio: uma URL de exemplo não deve ser publicada nem indexada. A referência em `robots.txt` usa o domínio de exemplo e deve ser substituída junto com o sitemap. Antes do lançamento, remova essas proteções somente depois de configurar o domínio e o conteúdo reais.

### SEO por projeto

1. Em `data/config.json`, defina `company.name`, `company.description` e `urls.website` com os dados reais e a URL HTTPS canônica, sem barra ou query strings indevidas.
2. Em cada página, defina um único `<title>`, uma meta description específica, canonical absoluto, `robots` adequado e os metadados Open Graph/Twitter. Para a home, os valores localizados ficam em `seo.title` e `seo.description` no `home.json`; a estrutura já inclui `og:type`, título, descrição, URL, locale e `twitter:card`.
3. O JavaScript mantém título, description, canonical e metadados de compartilhamento coerentes com a configuração durante a navegação. Como robôs não são obrigados a executar JavaScript, os valores estáticos no `<head>` também devem ser atualizados no HTML ou pré-renderizados para a produção.
4. Depois de substituir `example.com`, preencha `public/sitemap.xml` somente com URLs canônicas, indexáveis e que respondam com HTTP 200. Atualize `public/robots.txt` com a URL absoluta do sitemap e permita apenas as rotas públicas.
5. Use caminhos relativos consistentes no site e URLs HTTPS absolutas apenas em canonical, sitemap, Open Graph e configurações externas. Não inclua URLs com `?lang=` como canonical.
6. Adicione dados estruturados (JSON-LD) apenas quando houver dados reais e verificáveis, como `Organization`, `LocalBusiness`, `WebSite`, `BreadcrumbList` ou `Service`. Esta demo não declara schema para não representar uma organização fictícia.
7. Use `alt` descritivo em imagens que informam algo; para imagens estritamente decorativas, use `alt=""`. Não use o nome do arquivo como alternativa textual. Adicione `og:image` e `twitter:image` apenas quando existir uma imagem pública, representativa e com dimensões adequadas.

### Regras de acessibilidade

- Mantenha um `<main>` por página, header/footer semânticos, navegação em `<nav>` e seções com um heading associado. A home tem um único `<h1>` e utiliza `<h2>` para as seções e `<h3>` nos cards.
- Todo link precisa ter destino e texto que explique sua ação; use `<button>` somente para uma ação na interface, nunca para navegação.
- Preserve a navegação por teclado e o foco visível. Não remova o estilo `:focus-visible` e mantenha o link de salto para `#main-content` como primeiro elemento focável.
- Todo campo de formulário precisa de `<label>` associado. O seletor de idioma usa um `<label>` nativo; não acrescente `aria-label` quando o label visível já fornece o nome acessível.
- Prefira HTML nativo a ARIA. Use ARIA apenas para complementar uma relação que HTML não expresse; landmarks, headings, links e labels já entregam a maior parte da semântica necessária.
- Verifique contraste de texto, controles e foco ao alterar tokens de cor. As combinações padrão usam texto escuro em superfícies claras e texto branco nos controles primários/CTA.
- Respeite `prefers-reduced-motion`: animações, transições e rolagem suave devem continuar reduzíveis para pessoas sensíveis a movimento.

### Checklist antes de publicar

- [ ] Remover `noindex, nofollow` e `Disallow: /` somente para páginas prontas para busca.
- [ ] Substituir todas as ocorrências de `example.com` pelo domínio final HTTPS.
- [ ] Preencher sitemap e referenciá-lo por URL absoluta em `robots.txt`.
- [ ] Conferir títulos, descriptions, canonical e previews Open Graph/Twitter de cada URL pública.
- [ ] Testar navegação apenas com teclado, foco visível, zoom de 200% e preferência por movimento reduzido.
- [ ] Revisar headings, textos de links, labels e alternativas de todas as imagens novas.

## Performance

A base prioriza tempo de carregamento percebido e manutenção simples. Não há frameworks, bibliotecas de interface, fontes remotas ou imagens de conteúdo na demonstração. Os módulos ES são carregados com `<script type="module">`, que já tem comportamento `defer`; não acrescente `defer` nem `async` ao mesmo arquivo. Os CSS críticos continuam como arquivos externos separados por responsabilidade: são pequenos, fáceis de manter e reutilizáveis pelo cache HTTP.

### Carregamento e dados

- A configuração é carregada uma vez. Depois dela, os JSONs de idioma e os componentes HTML iniciam em paralelo para evitar uma cascata entre conteúdo e interface.
- `createResourceLoader` mantém um cache em memória por URL e tipo durante a página aberta, inclusive para chamadas simultâneas. Preserve esse ponto central de carregamento em vez de fazer `fetch` avulso nos componentes.
- Os arquivos JSON devem conter apenas o conteúdo da página necessária, sem duplicar catálogos grandes em cada idioma. Use uma chave de página nova quando houver uma página nova.
- O Service Worker da base PWA usa uma versão explícita e cacheia somente o shell estático conhecido. Não amplie a lista para respostas de API, dados de usuários ou catálogos sem antes definir expiração, invalidação e privacidade.

### Imagens, ícones e fontes

Ainda não há imagens de conteúdo neste template; por isso não há `srcset`, `sizes`, `loading="lazy"` ou preload sem uso. Ao adicionar uma imagem, escolha a regra conforme sua posição:

- Imagem informativa no topo: defina `width` e `height` reais para reservar espaço. Use `<picture>` ou `srcset` com `sizes` quando existirem versões em larguras diferentes. Não use `loading="lazy"` na imagem que compõe o LCP.
- Imagem fora da primeira dobra: mantenha `width` e `height`, use `loading="lazy"` e `decoding="async"`. O navegador deve escolher o recurso com `srcset`/`sizes`; não envie a maior versão para todos os dispositivos.
- Ícones pequenos e identidade: prefira SVG local quando ele for simples. Não converta um SVG pequeno em uma biblioteca inteira de ícones.
- Fontes: mantenha a pilha de fontes do sistema enquanto não houver uma necessidade de marca. Se uma fonte web for indispensável, sirva somente os formatos, pesos e subconjuntos usados, configure `font-display: swap` e faça preload apenas da fonte crítica que realmente aparece acima da dobra.

Exemplo de imagem responsiva fora da primeira dobra:

```html
<img
  src="assets/images/exemplo-960.webp"
  srcset="assets/images/exemplo-480.webp 480w,
          assets/images/exemplo-960.webp 960w,
          assets/images/exemplo-1440.webp 1440w"
  sizes="(min-width: 64rem) 33vw, 100vw"
  width="960"
  height="640"
  loading="lazy"
  decoding="async"
  alt="Descrição objetiva da informação mostrada"
>
```

### Entrega e revisão

- Configure o servidor/CDN para cache longo e imutável em arquivos versionados (`assets/*.css`, `assets/*.js`, imagens e fontes) e revalidação curta para HTML, JSON, `robots.txt` e sitemap. Sem nomes versionados, não use cache imutável nos assets.
- Preload é excepcional: use-o somente após medição mostrar que um recurso realmente crítico está atrasando a renderização. Não faça preload de JSON, componentes, imagens fora da dobra ou recursos que o navegador já descobre cedo.
- Evite CSS e JavaScript duplicados; regras comuns de botão ficam compartilhadas em `base.css`, enquanto a apresentação específica do link-botão permanece em `components.css`.
- Antes de publicar, avalie uma página em rede móvel e um dispositivo de menor capacidade. Verifique LCP, CLS e INP, requisições bloqueantes, peso das imagens e se a troca de idioma continua usando os JSONs esperados.

## PWA básica

A base PWA está ativa para navegadores compatíveis em HTTPS (ou `localhost`). O manifesto em `public/manifest.json` fornece nome, descrição, cores, modo `standalone`, URL inicial e o favicon SVG como ícone `any maskable`. Para produção que exige suporte em plataformas sem ícones SVG, acrescente versões PNG quadradas — normalmente 192×192 e 512×512 — e liste-as no manifesto.

O registro ocorre depois do evento `load`, portanto não bloqueia a renderização inicial. O `sw.js` faz precache apenas do shell: HTML, CSS, JavaScript, componentes, favicon, manifesto e os JSONs estáticos da home nos idiomas disponíveis. Para esses recursos, usa cache-first; para navegações, tenta a rede primeiro e usa a home em cache apenas se estiver offline. Não intercepta `POST`, outras origens, JSONs não listados, APIs ou respostas inválidas. Uma resposta só entra no cache quando `response.ok` é verdadeiro.

### Atualizações

Quando o shell mudar, altere `CACHE_NAME` no `sw.js` (por exemplo, de `siteforge-shell-v1` para `siteforge-shell-v2`). O novo worker prepara o cache em segundo plano, remove versões anteriores depois da ativação e assume novos clientes sem interromper uma página já aberta. A mensagem `SKIP_WAITING` está disponível para uma futura interface de “atualização disponível”, mas a base não força uma atualização durante a sessão atual.

### Desativar ou remover

1. Remova `<link rel="manifest">` de `index.html` e a chamada `registerServiceWorker()` de `assets/js/main.js`.
2. Remova ou deixe de publicar `public/manifest.json` e `sw.js` quando nenhum projeto usar PWA.
3. Para instalações que já receberam o worker, peça uma atualização única com o worker ainda publicado e instrua a remover o registro em DevTools → Application → Service Workers, ou limpe os dados do site. Usuários que instalaram o app também podem desinstalá-lo pelo sistema operacional.

Não use a PWA em ambientes HTTP públicos: Service Workers exigem contexto seguro. Em desenvolvimento, valide instalação, atualização e modo offline em `localhost` antes de publicar.

## Segurança

O template trata todo JSON como dado público e todo texto dinâmico como texto, não como HTML. Não há `innerHTML`, `eval`, execução de strings, `localStorage`, `sessionStorage` ou formulários na base. A ausência desses recursos não é uma limitação: é uma escolha para reduzir a superfície de ataque até que haja um caso de uso definido.

### Regras para dados e conteúdo dinâmico

- Nunca inclua senhas, tokens, API keys privadas, strings de conexão, credenciais de serviços ou dados pessoais sensíveis em `data/`, JavaScript, manifesto, Service Worker ou HTML. Todo arquivo servido ao navegador pode ser lido pelo visitante.
- Use `textContent` para conteúdo vindo de JSON. Não use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `Function` ou handlers como `onclick` com textos, parâmetros de URL ou dados remotos.
- Valide a forma e o tipo dos dados antes de usá-los. `utils/validation.js` oferece validação de objetos, listas, URLs HTTP(S) e origem; reutilize essas funções em vez de criar verificações divergentes.
- Não transforme strings em código nem aceite nomes de arquivos, nomes de componentes ou caminhos vindos diretamente da URL. Idioma e página já são restringidos a listas e padrões conhecidos antes de formar caminhos de JSON.

### URLs, links e componentes

- Recursos carregados por `createResourceLoader` precisam ser HTTP(S) e da mesma origem. Não use esse loader para baixar componentes, scripts ou JSON de domínios arbitrários.
- URLs configuradas passam por validação de protocolo e não aceitam credenciais embutidas. Para links externos abertos em nova aba, use sempre `target="_blank" rel="noopener noreferrer"`.
- Fragmentos em `components/` são arquivos controlados pelo repositório, mas ainda passam pela validação antes de entrar no DOM. Scripts, estilos, iframes, handlers `on*`, `srcdoc`, URLs não seguras e links externos sem o `rel` adequado são rejeitados.
- Ao precisar mostrar HTML rico de CMS ou de um usuário, não o injete diretamente. Faça sanitização no servidor com uma política explícita e trate o resultado como uma funcionalidade separada do template.

### Formulários, parâmetros e PWA

- Quando forem adicionados formulários, valide no cliente apenas para experiência de uso e repita a validação no servidor. Use HTTPS, proteção CSRF para sessões autenticadas, limites de requisição e mensagens de erro que não exponham dados internos.
- Parâmetros de URL podem escolher somente valores de uma allowlist; nunca devem controlar redirecionamentos, URLs de `fetch`, seletores ou HTML. Links de retorno devem ser internos e validados no servidor.
- O Service Worker só considera `GET` da mesma origem e cacheia uma lista fixa de arquivos estáticos. Mantenha dados autenticados, APIs e respostas personalizadas fora de `SHELL_URLS`.

### Revisão antes de publicar

- [ ] Procurar por segredos antes de cada commit e manter arquivos `.env` fora da pasta pública e do controle de versão.
- [ ] Confirmar que novos dados são inseridos com APIs do DOM seguras, como `textContent` e `setAttribute` após validação.
- [ ] Revisar cada `target="_blank"` para garantir `rel="noopener noreferrer"`.
- [ ] Testar entradas inválidas de URL, idioma, formulário e conteúdo remoto sem expor stack traces ou detalhes internos ao visitante.

## Como usar

1. Abra a pasta no VS Code.
2. Inicie `index.html` com a extensão Live Server.
3. Ajuste primeiro `data/config.json`, os metadados e os arquivos em `public/` para o novo site.
4. Adicione páginas internas em `pages/` e funcionalidades somente quando forem necessárias.

## Convenções

Pastas e arquivos usam lowercase. As classes CSS usam nomes curtos e descritivos, como `.page-content` e `.visually-hidden`; componentes podem usar um prefixo simples pelo seu nome (por exemplo, `.header-nav`). Não há BEM rígido nem estilos inline como convenção.

## Itens a configurar por projeto

- Substituir `public/favicon.svg`; se necessário, adicionar `favicon.ico` e `apple-touch-icon.png` gerados a partir da identidade visual.
- Atualizar o domínio de exemplo em `public/sitemap.xml` e a rota em `public/robots.txt`.
- Se o projeto não precisar de instalação, siga a seção “Desativar ou remover” para retirar manifesto e Service Worker.
