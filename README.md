# 🧬 Calculadora Metabólica

Uma aplicação web moderna e responsiva para calcular o metabolismo basal (BMR) e gasto calórico diário total (TDEE) com precisão científica.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ed?style=flat-square&logo=docker)

## 🎯 Sobre

A **Calculadora Metabólica** é uma aplicação inteligente que ajuda usuários a entenderem seu metabolismo e gasto calórico diário. Com uma interface intuitiva e cálculos baseados em fórmulas científicas comprovadas, oferece insights valiosos para planejamento de saúde e fitness.

### Funcionalidades Principais

- ⚡ **Cálculo Preciso de BMR** - Utiliza a fórmula de Mifflin-St Jeor
- 📊 **Estimativa de TDEE** - Gasto calórico total diário com base no nível de atividade
- 🎯 **Recomendações de Macros** - Distribuição de calorias para peso perdido/ganho/manutenção
- 📱 **Design Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- 🎨 **Tema Customizável** - Suporte a modo claro e escuro com tema customizável
- ⚙️ **Performance** - Interface rápida com animações suaves e experiência otimizada

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 16.0** - Framework React com SSR e SSG
- **React 19** - Biblioteca UI baseada em componentes
- **TypeScript** - Tipagem estática para maior segurança
- **Radix UI** - Sistema de componentes acessíveis e sem estilo
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Ícones moderno e consistente

### DevOps & Deployment

- **Docker** - Containerização com multi-stage builds
- **pnpm** - Gerenciador de pacotes rápido e eficiente
- **ESLint** - Linting para manutenção de código

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+ (recomendado)
- pnpm 8+ (ou npm/yarn)
- Docker (opcional)

### Instalação Local

```bash
# Clone o repositório
git clone <seu-repositorio>
cd calculadora-metabolica

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção

```bash
# Compile a aplicação
pnpm build

# Inicie o servidor de produção
pnpm start
```

### Docker

```bash
# Build da imagem
docker build -t calculadora-metabolica .

# Execute o container
docker run -p 3000:3000 calculadora-metabolica
```

Ou com docker-compose:

```bash
docker-compose up --build
```

## 📋 Comandos Disponíveis

| Comando      | Descrição                                         |
| ------------ | ------------------------------------------------- |
| `pnpm dev`   | Inicia servidor de desenvolvimento com hot-reload |
| `pnpm build` | Compila a aplicação para produção                 |
| `pnpm start` | Inicia o servidor de produção                     |
| `pnpm lint`  | Executa validação de código com ESLint            |

## 🏗️ Arquitetura

```
src/
├── app/              # Rotas e layouts (App Router do Next.js)
├── components/       # Componentes React reutilizáveis
│   ├── metabolic-calculator.tsx  # Componente principal da calculadora
│   ├── ui/          # Componentes de UI genéricos
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utilidades e funções auxiliares
└── styles/          # CSS global e variáveis de tema
```

## 🧮 Como Funciona

A calculadora segue este fluxo:

1. **Coleta de Dados** - Usuário insere peso (kg), altura (cm), idade (anos), sexo e nível de atividade
2. **Cálculo de BMR** - Aplica a fórmula de Mifflin-St Jeor de acordo com o sexo
3. **Cálculo de TDEE** - Multiplica o BMR pelo multiplicador de atividade
4. **Recomendações** - Calcula calorias para perda, ganho e manutenção de peso

**Fórmula de BMR (Mifflin-St Jeor):**

- Homens: `(10 × peso) + (6.25 × altura) - (5 × idade) + 5`
- Mulheres: `(10 × peso) + (6.25 × altura) - (5 × idade) - 161`

**Níveis de Atividade:**

- Sedentário: 1.2x (pouco ou nenhum exercício)
- Leve: 1.375x (exercício leve 1-3 dias/semana)
- Moderado: 1.55x (exercício moderado 3-5 dias/semana)
- Ativo: 1.725x (exercício intenso 6-7 dias/semana)
- Muito Ativo: 1.9x (exercício muito intenso 2x/dia)

## 📦 Dependências Principais

- `@hookform/resolvers` - Validação de formulários
- `@radix-ui/*` - Componentes base de UI acessíveis
- `react-hook-form` - Gerenciamento de estado de formulários
- `class-variance-authority` - Utilities para variações de classes
- `lucide-react` - Ícones SVG
- `next-themes` - Gerenciamento de temas
- `date-fns` - Utilidades de data

## 🎨 Personalização

O projeto utiliza **CSS Variables** e **Tailwind CSS** para personalização de tema. Edite as variáveis em `styles/globals.css` para adaptar cores, espaçamento e tipografia.

## 🧪 Testes

Para adicionar testes, o projeto está estruturado para integrar facilmente com Jest e React Testing Library.

## 📖 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👤 Autor

## Pedro Vitor Dias

**Status:** ✅ Em desenvolvimento ativo

Para mais informações, dúvidas ou sugestões, abra uma issue no repositório.
