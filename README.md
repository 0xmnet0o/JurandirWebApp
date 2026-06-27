# PedeAí 🏖️

Pedidos por **QR Code** para bares e restaurantes de praia. O cliente escaneia o QR no guarda-sol/mesa, monta o pedido pelo celular, paga (Pix, cartão, parcelado ou USDC) e pode dividir a conta — enquanto o estabelecimento gerencia cardápio, pedidos, KPIs e impressão na cozinha.

> Refatoração do protótipo single-file (`legacy/`) para uma base **React + TypeScript** modular.

## Stack

- **React 18** + **TypeScript** (modo `strict`)
- **Vite 5** (dev server e build)
- **Tailwind CSS 3**
- **lucide-react** (ícones)

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

Outros scripts:

```bash
npm run build        # type-check (tsc) + build de produção (dist/)
npm run preview      # serve o build de produção localmente
npm run typecheck    # apenas a verificação de tipos
npm run test         # roda os testes (Vitest)
npm run test:watch   # testes em modo watch
npm run coverage     # testes com relatório de cobertura
npm run lint         # ESLint
npm run lint:fix     # ESLint corrigindo o que for automático
npm run format       # Prettier formatando os arquivos
npm run format:check # Prettier apenas verificando (CI)
```

## Qualidade de código

- **ESLint 9** (flat config) com `typescript-eslint`, `react-hooks` e `react-refresh`.
- **Prettier** integrado (`eslint-config-prettier` evita conflitos de estilo).
- Configuração em `eslint.config.js` e `.prettierrc.json`; `legacy/` é ignorado.

## Testes

- **Vitest** + **Testing Library** (ambiente `jsdom`), configurados em `vite.config.ts`
  com setup em `src/test/setup.ts`.
- Cobrem a lógica pura (`format`, `analytics`, `csv`, `storage`) e um teste de
  componente (`Img`). Os testes ficam ao lado do código em arquivos `*.test.ts(x)`.

## Persistência

O estado (cardápio, pedidos, perfil e estabelecimentos) é salvo no **localStorage**
do navegador (`src/lib/storage.ts`, chave versionada `pedeai:state:v1`) — então
recarregar a página **mantém** as alterações. Como o ícone de cada pagamento é um
componente React (não serializável), ele é descartado no `JSON.stringify` e
reidratado pelo `id` ao carregar; as datas (`Order.ts`) também são revividas.
Para voltar aos dados-semente, basta limpar essa chave (`clearPersisted()`).

## Arquitetura

O estado global (cardápio, pedidos, perfil e estabelecimentos) vive em um
**Context** (`src/store/AppStore.tsx`), consumido via `useStore()` — eliminando
o prop-drilling do protótipo original. Cada área do produto é uma _feature_
isolada, e a lógica pura (formatação, analytics, CSV) fica fora dos componentes.

```
src/
├── App.tsx                 # navegação de alto nível (Site / Cliente / Restaurante / Admin)
├── main.tsx                # bootstrap React
├── types/                  # modelos de domínio (MenuItem, Order, Establishment…)
├── data/                   # constantes e dados-semente (menu, categorias, pagamentos, seeds)
├── lib/                    # funções puras: format, analytics, csv
├── store/                  # AppStore (Context + ações globais)
├── components/             # UI compartilhada (Img, Gallery)
└── features/
    ├── client/             # jornada do cliente: QR → cardápio → checkout → pedidos
    ├── restaurant/         # painel do estabelecimento: pedidos, cardápio, QR, KPIs, perfil, config
    ├── admin/              # painel da plataforma: dashboard, faturamento, cadastros, taxas
    └── landing/            # site institucional + captação de leads
```

### Princípios aplicados

- **Tipagem de domínio centralizada** em `src/types` — uma única fonte de verdade.
- **Separação lógica × apresentação**: cálculos (ex.: `computeLive`, `splitInfo`,
  parsing de CSV) são funções puras e testáveis em `src/lib`.
- **Formulários tipados** com versões "de edição" (`MenuItemForm`, `EstablishmentForm`)
  onde campos numéricos são strings durante a digitação e convertidos ao salvar.
- **Alias de import `@/`** apontando para `src/` (configurado no Vite e no TS).

## Credenciais de demonstração

- **Restaurante:** `contato@quiosquedomar.com.br` / `demo1234`
- **Admin (plataforma):** `admin@pedeai.com.br` / `admin1234`

## Observações

- É uma **demonstração**: não há backend. O estado é mantido no navegador via
  localStorage (ver _Persistência_), partindo dos dados-semente no primeiro acesso.
- Os QR Codes usam a API pública `api.qrserver.com` apenas para a prévia.
- O código original está preservado em `legacy/` para referência.
