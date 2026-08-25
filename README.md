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

`assets/js/main.js` é o único ponto de entrada JavaScript. Os módulos em `assets/js/core/` são pontos de extensão documentados: não ativam multilíngue, cache, carregamento dinâmico ou PWA nesta base.

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
