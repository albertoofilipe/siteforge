# Siteforge — projeto-mestre institucional

## Objetivo do template

Iniciar projetos de clientes com uma estrutura clara, acessível, rápida e segura, sem introduzir framework, bundler ou dependência antes de haver uma necessidade concreta. Este repositório demonstra uma arquitetura; não representa uma empresa real. Antes de publicar um projeto derivado, substitua dados, URLs e identidade visual de exemplo.

## Tecnologias utilizadas

- HTML5 semântico, CSS3 modular e JavaScript moderno com ES Modules nativos.
- JSON local para configuração e conteúdo multilíngue.
- PWA mínima, opcional e removível.
- Sem framework, bundler, package.json ou biblioteca de interface.

## Requisitos e execução com VS Code + Live Server

Use VS Code, a extensão Live Server e um navegador moderno. Abra a pasta no VS Code, clique com o botão direito em index.html e escolha Open with Live Server. Não abra por file://: componentes e JSONs usam fetch. Service Workers e instalação PWA exigem HTTPS ou localhost.

## Estrutura de pastas

~~~
.
├── assets/
│   ├── css/          # tokens, reset, base, layout, componentes e responsividade
│   ├── js/           # módulos core, componentes, features e utilitários
│   ├── images/       # imagens de conteúdo do cliente
│   ├── icons/        # ícones locais adicionais
│   └── fonts/        # fontes locais, se indispensáveis
├── components/       # fragmentos HTML reutilizáveis
├── data/             # configuração central e conteúdo por idioma
├── errors/           # páginas estáticas 404, 500 e manutenção
├── pages/            # futuras páginas internas
├── public/           # favicon, manifesto, robots e sitemap
├── index.html        # página demonstrativa inicial
└── sw.js             # Service Worker opcional
~~~

## CSS

O CSS é Mobile First e é importado nesta ordem:

| Arquivo | Responsabilidade |
| --- | --- |
| variables.css | Tokens de cor, tipografia, espaço, dimensões e camadas. |
| reset.css | Normalização mínima de elementos nativos. |
| base.css | Tipografia, links, controles, foco e movimento. |
| layout.css | Containers, seções e grids. |
| components.css | Estilo visual de componentes reutilizáveis. |
| utilities.css | Utilitários pequenos, como flow e visually-hidden. |
| responsive.css | Ajustes progressivos por breakpoint. |

Personalize tokens antes de criar exceções. Não adicione estilos inline nem duplique regras de base; mantenha a aparência específica de componentes em components.css.

## JavaScript

assets/js/main.js é o ponto de entrada. Ele inicia a aplicação depois que o DOM está disponível e registra o Service Worker após load.

| Área | Responsabilidade |
| --- | --- |
| core/app.js | Coordena configuração, i18n, componentes e renderização. |
| core/loader.js | Centraliza fetch local, cache em memória e erros. |
| core/config.js | Valida e congela data/config.json. |
| core/i18n.js | Resolve idioma, carrega fallback e aplica textos. |
| components/ | Carregamento de fragmentos e seletor de idioma. |
| features/ | Renderização específica de uma página. |
| utils/ | DOM, validações e mensagens auxiliares. |

Use módulos nativos, funções pequenas e APIs do DOM. Não coloque textos de página no JavaScript, não crie estado global e não adicione bibliotecas para tarefas que HTML, CSS e JavaScript resolvem.

## Componentes

Componentes são arquivos HTML em components/, inseridos por slots:

~~~html
<div data-component-slot="header"></div>
~~~

O carregador busca somente arquivos locais e valida o fragmento antes de inseri-lo. Componentes não podem conter script, style, handlers on*, iframe, srcdoc ou URLs inseguras. Use HTML semântico e CSS externo. Um componente pode conter outro slot; o header atual inclui a navbar.

### Criar um novo componente

1. Crie components/nome-do-componente.html em lowercase e com hífens.
2. Use marcação semântica e classes próprias quando necessário.
3. Inclua o slot data-component-slot="nome-do-componente" em uma página ou componente.
4. Adicione o CSS em assets/css/components.css.
5. Crie inicializador JavaScript somente se houver comportamento real.

## JSON e configuração de cliente

data/config.json concentra dados que mudam por cliente:

| Chave | Uso |
| --- | --- |
| company | Nome e descrição institucional curta. |
| assets | Logo e favicon. |
| contacts | Telefone, WhatsApp, e-mail e endereço. |
| social | URLs HTTP(S) das redes sociais. |
| urls | Domínio canônico e links institucionais. |
| locales | Idioma padrão e idiomas disponíveis. |
| theme | Cores, esquema e raio padrão. |
| options | Recursos booleanos, como seletor de idioma. |

O JSON é público. Nunca inclua API keys, senhas, tokens, dados de usuários, strings de conexão ou HTML. O validador aceita URLs HTTP(S) sem credenciais e os textos são inseridos com textContent.

Conteúdo de página fica em data/idioma/pagina.json. Coleções repetitivas, como serviços e diferenciais, devem vir do JSON e ser renderizadas pela feature correspondente, nunca copiadas no HTML ou JavaScript.

## Sistema multilíngue

Cada página informa seu identificador no body, por exemplo data-page="home". Isso carrega data/idioma/global.json e data/idioma/home.json. O idioma é resolvido nesta ordem: parâmetro lang, preferência do navegador e locales.default. Para idiomas não padrão, conteúdo ausente usa o idioma padrão como fallback.

### Adicionar um idioma

1. Inclua o código em locales.available de data/config.json.
2. Crie data/codigo/.
3. Copie global.json e os JSONs de páginas de um idioma existente.
4. Traduza as mesmas chaves, incluindo seo.title e seo.description.
5. Abra ?lang=codigo no Live Server e revise a interface.

Para SEO multilíngue definitivo, use URLs próprias, hreflang e HTML pré-renderizado ou gerado no servidor. Query strings de idioma não substituem essa estratégia.

## SEO

A home possui estrutura de title, description, canonical, robots, Open Graph e Twitter Card. As chaves seo.title e seo.description atualizam o documento no cliente, mas os valores estáticos do head também devem ser preenchidos para produção.

Esta demo usa noindex, nofollow, domínio example.com, sitemap vazio e bloqueio em robots.txt. Antes de publicar:

1. Substitua cada ocorrência de example.com.
2. Crie title, description e canonical específicos por página.
3. Remova noindex apenas das páginas prontas para busca.
4. Liste somente URLs HTTP 200, canônicas e indexáveis no sitemap.
5. Atualize a URL absoluta do sitemap em robots.txt.
6. Use dados estruturados somente para dados reais e verificáveis.

Não declare schema de Organization ou LocalBusiness para empresa fictícia.

## Acessibilidade

- Mantenha um main, um único h1, landmarks semânticos e headings em ordem.
- Use a para navegação e button para ações na interface.
- Preserve o skip link, focus-visible e navegação integral por teclado.
- Todo campo novo precisa de label associado; não use ARIA quando HTML nativo resolve.
- Verifique contraste, zoom de 200%, fluxo mobile e prefers-reduced-motion.
- Dê alt descritivo a imagens informativas; use alt vazio para imagens decorativas.

## Performance

O template não possui framework, fontes remotas ou imagens de conteúdo. Módulos ES já têm comportamento defer; não combine type="module" com async ou defer. Configuração, componentes e JSONs de página iniciam em paralelo após a leitura da configuração, e o loader compartilha requisições em cache de memória.

Não faça preload sem medir. Sirva assets versionados com cache longo pelo servidor/CDN e HTML, JSON, robots e sitemap com revalidação curta. Não cacheie indiscriminadamente no Service Worker.

## Imagens

Não há imagens de conteúdo nesta demo. Ao adicioná-las:

- Defina width e height reais para evitar layout shift.
- Para imagens responsivas, use srcset e sizes.
- Use loading="lazy" e decoding="async" apenas fora da primeira dobra.
- Não aplique lazy loading à imagem LCP.
- Prefira WebP ou AVIF quando houver benefício e mantenha fallback apropriado.
- Otimize cada tamanho; não envie uma imagem grande para telas pequenas.

~~~html
<img
  src="assets/images/equipe-960.webp"
  srcset="assets/images/equipe-480.webp 480w,
          assets/images/equipe-960.webp 960w,
          assets/images/equipe-1440.webp 1440w"
  sizes="(min-width: 64rem) 33vw, 100vw"
  width="960"
  height="640"
  loading="lazy"
  decoding="async"
  alt="Equipe reunida em uma mesa de trabalho"
>
~~~

## PWA

A PWA é simples e opcional. public/manifest.json define nome, descrição, ícone SVG, cores, escopo, start_url e display standalone. O registro só ocorre em HTTPS ou localhost.

sw.js cacheia uma lista fixa do shell estático e JSONs conhecidos da home. Navegações usam network-first e retornam a home em cache se a rede falhar. Não adicione APIs, dados autenticados, respostas personalizadas ou JSONs arbitrários ao cache. Ao mudar arquivos do shell, aumente CACHE_NAME.

### Desativar PWA

1. Remova o link rel="manifest" de index.html.
2. Remova a chamada registerServiceWorker() de assets/js/main.js.
3. Pare de publicar sw.js e public/manifest.json.
4. Para visitantes anteriores, oriente remover o registro em DevTools → Application → Service Workers ou limpar dados do site.

## Formulários

O template não inclui formulário nem endpoint. Ao implementar um:

- Use form, labels, tipos de input corretos, mensagens acessíveis e validação nativa.
- Valide novamente no servidor; validação de cliente é somente experiência de uso.
- Envie dados por HTTPS a um endpoint do cliente ou serviço configurado no servidor.
- Proteja sessões com CSRF quando aplicável e use rate limiting, honeypot ou CAPTCHA apenas quando necessário.
- Nunca exponha chave secreta de e-mail, CRM ou API no frontend.
- Mostre erros genéricos ao visitante e registre detalhes somente em ambiente seguro.

## Font Awesome

Font Awesome não é dependência deste projeto. Use SVGs locais pequenos para poucos ícones. Caso um cliente realmente precise de Font Awesome:

1. Hospede apenas os ícones e pesos usados, em vez de carregar o kit completo.
2. Documente licença, origem e impacto de performance.
3. Não use uma chave de kit privada no frontend.
4. Mantenha ícones decorativos ocultos de leitores de tela e forneça texto acessível quando o ícone comunicar uma ação.

## Segurança

- Nunca coloque secrets no frontend: arquivos data, JavaScript, HTML, manifesto e Service Worker são públicos.
- Use textContent para texto de JSON; não use innerHTML, eval, Function, handlers inline ou strings como código.
- Reutilize assets/js/utils/validation.js para validar tipos, URLs e fragmentos.
- O loader aceita recursos HTTP(S) da mesma origem; não o use para baixar código ou JSON de domínios arbitrários.
- Componentes bloqueiam scripts, estilos, iframes, URLs inseguras e links _blank sem rel="noopener noreferrer".
- Parâmetros de URL devem passar por allowlist e nunca controlar redirecionamentos, HTML ou caminhos de fetch.
- Não use localStorage ou sessionStorage para secrets ou dados sensíveis.

## Git e .gitignore

O .gitignore mantém fora do repositório arquivos do sistema, editor local, logs, caches, saídas de build, dependências futuras e arquivos .env. O .env.example pode ser versionado, desde que não contenha segredo.

Faça commits pequenos e descritivos. Antes do commit, revise git diff, procure secrets e valide HTML, JSON e módulos modificados. Não versione node_modules, chaves privadas, exportações de banco, cobertura ou arquivos gerados localmente.

## Criar uma nova página

1. Crie pages/nome-da-pagina.html a partir de index.html.
2. Defina data-page="nome-da-pagina" no body.
3. Mantenha head, CSS, script de módulo, skip link, header e footer.
4. Crie data/pt-BR/nome-da-pagina.json e equivalentes de cada idioma.
5. Adicione uma feature em assets/js/features/ somente para coleção ou comportamento específico.
6. Registre a feature em core/app.js de modo explícito.
7. Adicione rota à navegação, sitemap e SEO quando a página estiver pronta.

## Iniciar um novo projeto a partir deste template

1. Duplique o repositório sem preservar arquivos de cliente anterior.
2. Renomeie diretório, repositório remoto e título do projeto.
3. Siga o fluxo abaixo, mantendo a arquitetura até que uma necessidade justifique mudança.
4. Só então personalize páginas, conteúdo e integrações do cliente.

## Fluxo para novo cliente

1. Duplicar o template.
2. Renomear o projeto e o repositório.
3. Configurar data/config.json.
4. Substituir identidade visual, favicon, manifesto e tokens de tema.
5. Adicionar ou revisar traduções em data/idioma/.
6. Adicionar imagens otimizadas em assets/images/.
7. Criar as páginas e dados de cada página.
8. Configurar SEO, canonical, sitemap, robots e previews sociais.
9. Testar responsividade em telas pequenas, médias e grandes.
10. Testar acessibilidade com teclado, foco, zoom, contraste e leitor de tela quando possível.
11. Testar formulários com entradas válidas, inválidas, falha de rede e servidor.
12. Testar performance em rede móvel e dispositivo de menor capacidade.
13. Testar produção em HTTPS, incluindo PWA, URLs, erros 404/500 e cache.
14. Revisar diff, procurar secrets e fazer commit descritivo.
15. Publicar e fazer uma última checagem das URLs públicas.

## Checklist de entrega

- [ ] Conteúdo, contatos e domínio de exemplo foram substituídos.
- [ ] Nenhum segredo foi incluído no frontend ou Git.
- [ ] Todas as imagens têm tamanho reservado, alternativa adequada e formato otimizado.
- [ ] Titles, descriptions, canonicals, sitemap e robots estão corretos.
- [ ] O site funciona por teclado e em viewport mobile.
- [ ] Formulários foram validados também no servidor.
- [ ] PWA foi validada ou removida conscientemente.
- [ ] O projeto foi publicado em HTTPS e testado na URL final.
