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

Falhas de rede, JSON inválido ou configuração inválida são registradas no console com contexto útil. A base não implementa componentes dinâmicos nem persistência de cache.

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

O sistema depende de `fetch`, portanto abra o projeto por HTTP usando Live Server — não por `file://`. Na hospedagem estática, publique a pasta `data/` sem bloqueá-la e preserve os caminhos relativos. A troca de idioma é dinâmica e usa query string; título, metadados, `hreflang`, URLs localizadas e indexação SEO multilíngue definitiva ainda não foram implementados. Para SEO completo, cada idioma deverá ter URLs e HTML pré-renderizados ou gerados no servidor.

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
