# Quizztab 🎯

Gerador automático de vídeos de quiz em formato vertical para redes sociais.

## Características

- 📊 **Importação de Quiz**: Importe seus quizzes via arquivo CSV
- ⚙️ **Configurações Personalizáveis**: 
  - Quantidade de questões por rodada
  - Quantidade de opções por questão
  - Timer configurável por questão
  - Seleção de temas visuais
  - Cores personalizáveis
- 🎨 **Design Minimalista**: Interface limpa e moderna
- 🎬 **Formato Vertical**: Vídeos otimizados para redes sociais (1080x1920)
- 🎵 **Áudio**: Música de fundo e efeitos sonoros opcionais
- ✨ **Animações**: Transições suaves entre questões

## Formato CSV

O arquivo CSV deve seguir o formato:

```csv
pergunta,resposta_correta,opção1,opção2,opção3,opção4
Qual é a capital do Brasil?,Brasília,São Paulo,Rio de Janeiro,Brasília,Salvador
Quem pintou a Mona Lisa?,Leonardo da Vinci,Picasso,Leonardo da Vinci,Van Gogh,Monet
```

**Formato:**
- Primeira coluna: Texto da pergunta
- Segunda coluna: Resposta correta
- Colunas seguintes: Opções de resposta (mínimo 2)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Tecnologias

- React 18
- TypeScript
- Vite
- Canvas API
- MediaRecorder API

## Como Usar

1. **Importe um Quiz**: Arraste um arquivo CSV ou clique para selecionar
2. **Configure**: Ajuste os parâmetros do quiz (questões, timer, temas, etc.)
3. **Gere o Vídeo**: Clique em "Iniciar Geração" e aguarde o processamento
4. **Download**: O vídeo será baixado automaticamente ao final

## Estrutura do Projeto

```
src/
├── components/        # Componentes React
│   ├── QuizConfig/    # Configurações do quiz
│   ├── QuizImporter/   # Importação de CSV
│   ├── VideoGenerator/ # Geração de vídeo
│   └── Layout/         # Layout da aplicação
├── hooks/             # Hooks customizados
├── services/           # Serviços (parser, renderer, audio)
├── types/              # Tipos TypeScript
└── utils/              # Utilitários
```

## Licença

MIT


