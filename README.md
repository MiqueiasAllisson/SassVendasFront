# GestorDeVendas — Web

Front-end do gestor de carteira de clientes e parque de máquinas para vendas no
segmento pesado.

**Stack:** React 18 · TypeScript · Vite · TailwindCSS · TanStack Query ·
React Router · React Hook Form + Zod

> Back-end: [gestordevendas-api](https://github.com/MiqueiasAllisson/gestordevendas-api)

---

## Rodando

```bash
npm install
cp .env.example .env
npm run dev
```

Abre em `http://localhost:5173`. Suba a API antes — em desenvolvimento o Vite
faz proxy de `/api` para `http://localhost:3333`, de modo que o cookie
`httpOnly` do refresh token trafega na mesma origem.

---

## Estrutura

```
src/
  config/       marca e configuração lida do .env
  lib/          cliente HTTP (com refresh automático), tema, cn, cnpj
  components/   ui/ (Button, TextField, Alert, Logo…) e layout/
  features/     auth/ (login, senha, provider, seletor de empresa)
  routes/       ProtectedRoute (por perfil) e PublicOnlyRoute
  pages/        telas gerais
```

---

## Segurança no cliente

O **access token vive em memória**, nunca no `localStorage` — um XSS não tem de
onde lê-lo. A sessão sobrevive ao F5 pelo refresh token, que está num cookie
`httpOnly` inacessível a qualquer JavaScript. Quando um request toma 401, o
cliente renova e repete a chamada uma vez; várias chamadas simultâneas
compartilham a mesma renovação (`src/lib/api.ts`).

---

## Trocar a marca

Nenhum componente conhece o nome ou a cor da marca.

1. Edite o `.env` (`VITE_BRAND_*`): nome, tagline, cor primária, logo, imagem
   de fundo do login, e-mail de suporte.
2. Coloque o logo em `public/` e aponte `VITE_BRAND_LOGO_URL` (ex.:
   `/logo.svg`). Sem isso, entra a marca em SVG embutida no código — o
   `<Logo/>` também cai para ela se a imagem falhar ao carregar.
3. Troque `public/favicon.svg`.

A cor primária vira a escala `--brand-50…900` em runtime (`src/lib/theme.ts`),
sem rebuild. As cores do Tailwind apontam para essas variáveis CSS.

**Cada empresa também tem identidade própria:** ao escolher o CNPJ no login, a
tela adota o logo e a cor daquela empresa.

### Instalação de cliente único

`VITE_ENABLE_COMPANY_SELECT=false` + `VITE_FIXED_CNPJ=00000000000191` esconde o
seletor e fixa a empresa.

---

## Design system

Tokens em `src/index.css` como canais RGB, para o Tailwind poder aplicar
opacidade (`bg-brand-600/10`). Inclui as cores de status do follow-up (RN-03):
`status-late` (atrasado), `status-today` (hoje), `status-scheduled` (agendado),
`status-none` (não agendado).
