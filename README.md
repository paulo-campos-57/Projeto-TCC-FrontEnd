<div align="center">
  <h1>
    <img src="https://skillicons.dev/icons?i=react,vite,typescript,tailwind,leaflet" /><br>
    Front-End — Final Graduation Project 🇺🇸
  </h1>
  <p>
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=flat&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/pnpm-10.x-F69220?style=flat&logo=pnpm&logoColor=white" />
  </p>
</div>

This repository contains the Front-End of <a href="https://github.com/paulo-campos-57" target="_blank">Paulo Campos</a>'s Final Graduation Project (TCC).<br>
The full project documentation can be found at this <a href="https://docs.google.com/document/d/1WqyVEorM9IbZZ5CjwYWsqjv00DI9vhe-/edit?usp=sharing&ouid=104768249469194230645&rtpof=true&sd=true" target="_blank">link</a>.

---

## Project Structure

```
tcc-frontend/
├── public/                        # Static public files (served as-is)
└── src/
    ├── assets/                    # Static assets (images, icons, fonts, etc.)
    │
    ├── components/                # Reusable UI components
    │   └── ProtectedRoute.tsx     # Auth guard — redirects unauthenticated users
    │
    ├── data/                      # Static data and application constants
    │   └── ingredients.ts         # Ingredient types (TipoIngrediente) and prices (INGREDIENTES_PRECOS)
    │
    ├── pages/                     # Application pages organized by access level
    │   ├── guest/                 # 🔓 Public pages — accessible without authentication
    │   └── user/                  # 🔒 Protected pages — require user authentication
    │
    ├── services/                  # API integration layer (calls to the backend)
    │
    ├── types/                     # Global TypeScript type definitions
    │
    ├── App.tsx                    # Root component — route definitions and layout
    ├── index.css                  # Global styles
    └── main.tsx                   # Application entry point
```

### Pages & Routing

The `pages/` directory is split by access level:

| Folder | Access | Description |
|---|---|---|
| `pages/guest/` | 🔓 Public | Pages accessible without login (e.g. landing, login, register) |
| `pages/user/` | 🔒 Protected | Pages that require authentication, guarded by `ProtectedRoute` |

Authentication is enforced on the frontend via the `ProtectedRoute.tsx` component, which integrates with the backend session/token system to redirect unauthenticated users away from protected routes.

### Data Layer

The `data/` directory holds static constants used across the application. Currently it defines the available ingredient types and their respective prices:

```ts
// data/ingredients.ts (example)
export type TipoIngrediente =
  | 'Goma de Tapioca'
  | 'Queijo Coalho'
  | 'Coco Ralado'
  | 'Leite Condensado';

export const INGREDIENTES_PRECOS: Record<TipoIngrediente, number> = {
  'Goma de Tapioca': 10,
  'Queijo Coalho': 15,
  'Coco Ralado': 8,
  'Leite Condensado': 12,
};
```

### Services Layer

The `services/` directory contains all API call logic — each file maps to a specific backend resource or domain (e.g. auth, orders, products). This keeps HTTP logic out of components and pages.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19.x | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Static typing |
| [Vite](https://vitejs.dev/) | 7.x | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Utility-first styling |
| [React Router DOM](https://reactrouter.com/) | 7.x | Client-side routing |
| [React Leaflet](https://react-leaflet.js.org/) | 5.x | Interactive maps |
| [Lucide React](https://lucide.dev/) | 0.546.x | Icon library |

---

## Requirements

To run this project locally, make sure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 10.x or higher

> Don't have pnpm? Install it with: `npm install -g pnpm`

---

## How to Run

### <img src="https://skillicons.dev/icons?i=github" height="20" style="vertical-align: middle;" /> 1. Clone the repository

```bash
git clone https://github.com/paulo-campos-57/Projeto-TCC-FrontEnd.git
cd Projeto-TCC-FrontEnd/tcc-frontend
```

### <img src="https://skillicons.dev/icons?i=react" height="20" style="vertical-align: middle;" /> 2. Install dependencies

```bash
pnpm install
```

### ▶️ 3. Start the development server

```bash
pnpm dev
```

The Front-End will be available at **http://localhost:5173**.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the local development server |
| `pnpm build` | Compiles TypeScript and builds for production |
| `pnpm preview` | Previews the production build locally |
| `pnpm lint` | Runs ESLint to check code quality |

---

<br>

---

<div align="center">
  <h1>
    <img src="https://skillicons.dev/icons?i=react,vite,typescript,tailwind,leaflet" /><br>
    Projeto TCC — Front-End 🇧🇷
  </h1>
  <p>
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=flat&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/pnpm-10.x-F69220?style=flat&logo=pnpm&logoColor=white" />
  </p>
</div>

Este repositório contém o Front-End do Trabalho de Conclusão de Curso de <a href="https://github.com/paulo-campos-57" target="_blank">Paulo Campos</a>.<br>
A documentação completa do projeto pode ser encontrada neste <a href="https://docs.google.com/document/d/1WqyVEorM9IbZZ5CjwYWsqjv00DI9vhe-/edit?usp=sharing&ouid=104768249469194230645&rtpof=true&sd=true" target="_blank">link</a>.

---

## Estrutura do Projeto

```
tcc-frontend/
├── public/                        # Arquivos públicos estáticos (servidos diretamente)
└── src/
    ├── assets/                    # Arquivos estáticos (imagens, ícones, fontes, etc.)
    │
    ├── components/                # Componentes reutilizáveis de UI
    │   └── ProtectedRoute.tsx     # Guard de autenticação — redireciona usuários não autenticados
    │
    ├── data/                      # Dados estáticos e constantes da aplicação
    │   └── ingredients.ts         # Tipos de ingredientes (TipoIngrediente) e preços (INGREDIENTES_PRECOS)
    │
    ├── pages/                     # Páginas da aplicação organizadas por nível de acesso
    │   ├── guest/                 # 🔓 Páginas públicas — acessíveis sem autenticação
    │   └── user/                  # 🔒 Páginas protegidas — exigem autenticação do usuário
    │
    ├── services/                  # Camada de integração com a API (chamadas ao backend)
    │
    ├── types/                     # Definições globais de tipos TypeScript
    │
    ├── App.tsx                    # Componente raiz — definição de rotas e layout
    ├── index.css                  # Estilos globais
    └── main.tsx                   # Ponto de entrada da aplicação
```

### Páginas e Roteamento

O diretório `pages/` é dividido por nível de acesso:

| Pasta | Acesso | Descrição |
|---|---|---|
| `pages/guest/` | 🔓 Público | Páginas acessíveis sem login (ex: landing page, login, cadastro) |
| `pages/user/` | 🔒 Protegido | Páginas que exigem autenticação, protegidas pelo `ProtectedRoute` |

A autenticação é tratada no front-end pelo componente `ProtectedRoute.tsx`, que se integra com o sistema de sessão/token do backend para redirecionar usuários não autenticados que tentam acessar rotas protegidas.

### Camada de Dados

O diretório `data/` contém constantes estáticas utilizadas em toda a aplicação. Atualmente define os tipos de ingredientes disponíveis e seus respectivos preços:

```ts
// data/ingredients.ts (exemplo)
export type TipoIngrediente =
  | 'Goma de Tapioca'
  | 'Queijo Coalho'
  | 'Coco Ralado'
  | 'Leite Condensado';

export const INGREDIENTES_PRECOS: Record<TipoIngrediente, number> = {
  'Goma de Tapioca': 10,
  'Queijo Coalho': 15,
  'Coco Ralado': 8,
  'Leite Condensado': 12,
};
```

### Camada de Serviços

O diretório `services/` contém toda a lógica de chamadas à API — cada arquivo mapeia um recurso ou domínio específico do backend (ex: autenticação, pedidos, produtos). Isso mantém a lógica HTTP fora dos componentes e páginas.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [React](https://react.dev/) | 19.x | Framework de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipagem estática |
| [Vite](https://vitejs.dev/) | 7.x | Build tool e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Estilização utilitária |
| [React Router DOM](https://reactrouter.com/) | 7.x | Roteamento client-side |
| [React Leaflet](https://react-leaflet.js.org/) | 5.x | Mapas interativos |
| [Lucide React](https://lucide.dev/) | 0.546.x | Biblioteca de ícones |

---

## Requisitos

Para rodar o projeto localmente, certifique-se de ter instalado:

- **Node.js** 18.x ou superior
- **pnpm** 10.x ou superior

> Não tem o pnpm? Instale com: `npm install -g pnpm`

---

## Como Executar

### <img src="https://skillicons.dev/icons?i=github" height="20" style="vertical-align: middle;" /> 1. Clone o repositório

```bash
git clone https://github.com/paulo-campos-57/Projeto-TCC-FrontEnd.git
cd Projeto-TCC-FrontEnd/tcc-frontend
```

### <img src="https://skillicons.dev/icons?i=react" height="20" style="vertical-align: middle;" /> 2. Instale as dependências

```bash
pnpm install
```

### ▶️ 3. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O Front-End estará disponível em **http://localhost:5173**.

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor local de desenvolvimento |
| `pnpm build` | Compila o TypeScript e gera o build de produção |
| `pnpm preview` | Visualiza o build de produção localmente |
| `pnpm lint` | Executa o ESLint para verificar a qualidade do código |
