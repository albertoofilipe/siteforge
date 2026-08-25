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
| `core/i18n.js` | Escolhe um idioma suportado; ainda não carrega traduções. |
| `utils/dom.js` | Atualizações pequenas e reutilizáveis do documento. |
| `utils/validation.js` | Validações usadas pela configuração. |
| `utils/helpers.js` | Mensagens de erro seguras para logs de desenvolvimento. |

O template requer que `config.json` tenha `siteName`, `defaultLocale` e `supportedLocales`; a localidade padrão precisa constar na lista de suportadas. Falhas de rede, JSON inválido ou configuração inválida são registradas no console com contexto útil. A base não implementa carregamento de traduções, componentes dinâmicos ou persistência de cache.

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
- Completar `public/manifest.json` e `sw.js` somente se PWA for requisitado.
