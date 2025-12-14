export type Language = 'pt' | 'fr';

export const translations = {
  pt: {
    // Sidebar
    sidebar: {
      search: 'Buscar...',
      importQuiz: 'Importar Quiz',
      configure: 'Configurar',
      template: 'Template',
    },
    // App
    app: {
      importQuiz: '1. Importar Quiz',
      configure: '2. Configurar',
      template: 'Template',
      generateVideo: '3. Gerar Vídeo',
      preview: 'Preview',
      previewQuiz: 'Preview do Quiz',
    },
    // CSV Importer
    csvImporter: {
      dragFile: 'Arraste um arquivo CSV aqui',
      clickToSelect: 'ou clique para selecionar',
      format: 'Formato: pergunta,resposta_correta,opção1,opção2,opção3,...',
      processing: 'Processando arquivo...',
      error: 'Erro:',
      selectCsv: 'Por favor, selecione um arquivo CSV',
      uploadFiles: 'Upload de Arquivos',
      pasteText: 'Colar Texto CSV',
      pasteCsvText: 'Cole seu texto CSV aqui',
      pasteHint: 'Cole o conteúdo CSV diretamente no campo abaixo. Você pode adicionar múltiplos textos CSV.',
      pastePlaceholder: 'pergunta,resposta_correta,opção1,opção2,opção3,opção4\nQual é a capital do Brasil?,Brasília,São Paulo,Rio de Janeiro,Brasília,Salvador\n...',
      addAnother: 'Adicionar Outro CSV',
      importTexts: 'Importar Textos',
      importedQuizzes: 'Quizzes Importados',
      questions: 'questões',
    },
    // Quiz Preview
    quizPreview: {
      title: 'Preview do Quiz',
      questions: 'questões',
      question: 'Questão',
      additional: 'questões adicionais...',
    },
    // Quiz Badge
    quiz: {
      questionBadge: 'PERGUNTA',
    },
    // Generation Controls
    generation: {
      startGeneration: 'Iniciar Geração',
      stopGeneration: 'Parar Geração',
      videoGenerated: 'Vídeo gerado com sucesso!',
      downloadVideo: 'Baixar Vídeo',
      generateNewVideo: 'Gerar Novo Vídeo',
      importQuizToStart: 'Importe um quiz para começar',
      recording: 'Gravando...',
      recordingComplete: 'Gravação concluída!',
      quizzesImported: 'quizzes importados',
      generateAllVideos: 'Gerar Todos os Vídeos',
      generatingVideos: 'Gerando {current} de {total} vídeos...',
      downloadAllVideos: 'Baixar Todos os Vídeos (ZIP)',
      clearAllImports: 'Limpar Todas as Importações',
    },
    // Quiz Config
    quizConfig: {
      questionsPerRound: 'Questões por rodada',
      questionsPerRoundDesc: 'Número de questões que aparecerão no vídeo',
      optionsPerQuestion: 'Opções por questão',
      optionsPerQuestionDesc: 'Quantidade de opções de resposta por questão',
      enableMusic: 'Habilitar música de fundo',
      backgroundColor: 'Cor de fundo',
      textColor: 'Cor do texto',
      videoFormat: 'Formato do Vídeo',
      videoFormatDesc: 'Formato do arquivo de vídeo gerado',
      videoResolution: 'Resolução do Vídeo',
      videoResolutionDesc: 'Resolução do vídeo gerado (largura x altura)',
      timerPerQuestion: 'Timer por questão (segundos)',
      timerPerQuestionDesc: 'Tempo disponível para responder cada questão',
    },
    // Template Editor
    templateEditor: {
      title: 'Editor de Template',
      restoreDefault: 'Restaurar Padrão',
      colors: '🎨 Cores',
      backgroundColor: 'Cor de Fundo',
      textColor: 'Cor do Texto',
      questionBackgroundColor: 'Cor de Fundo da Pergunta',
      optionsBackgroundColor: 'Cor de Fundo das Opções',
      correctAnswerColor: 'Cor da Resposta Correta',
      timerColor: 'Cor do Timer',
      fonts: '✍️ Fontes',
      questionFontSize: 'Tamanho da Fonte da Pergunta',
      optionsFontSize: 'Tamanho da Fonte das Opções',
      timerFontSize: 'Tamanho da Fonte do Timer',
      letterFontSize: 'Tamanho da Fonte da Letra (A, B, C, D)',
    },
  },
  fr: {
    // Sidebar
    sidebar: {
      search: 'Rechercher...',
      importQuiz: 'Importer Quiz',
      configure: 'Configurer',
      template: 'Modèle',
    },
    // App
    app: {
      importQuiz: '1. Importer Quiz',
      configure: '2. Configurer',
      template: 'Modèle',
      generateVideo: '3. Générer Vidéo',
      preview: 'Aperçu',
      previewQuiz: 'Aperçu du Quiz',
    },
    // CSV Importer
    csvImporter: {
      dragFile: 'Glissez un fichier CSV ici',
      clickToSelect: 'ou cliquez pour sélectionner',
      format: 'Format: question,réponse_correcte,option1,option2,option3,...',
      processing: 'Traitement du fichier...',
      error: 'Erreur:',
      selectCsv: 'Veuillez sélectionner un fichier CSV',
      uploadFiles: 'Télécharger Fichiers',
      pasteText: 'Coller Texte CSV',
      pasteCsvText: 'Collez votre texte CSV ici',
      pasteHint: 'Collez le contenu CSV directement dans le champ ci-dessous. Vous pouvez ajouter plusieurs textes CSV.',
      pastePlaceholder: 'question,réponse_correcte,option1,option2,option3,option4\nQuelle est la capitale du Brésil?,Brasília,São Paulo,Rio de Janeiro,Brasília,Salvador\n...',
      addAnother: 'Ajouter Un Autre CSV',
      importTexts: 'Importer Textes',
      importedQuizzes: 'Quiz Importés',
      questions: 'questions',
    },
    // Quiz Preview
    quizPreview: {
      title: 'Aperçu du Quiz',
      questions: 'questions',
      question: 'Question',
      additional: 'questions supplémentaires...',
    },
    // Quiz Badge
    quiz: {
      questionBadge: 'QUESTION',
    },
    // Generation Controls
    generation: {
      startGeneration: 'Démarrer Génération',
      stopGeneration: 'Arrêter Génération',
      videoGenerated: 'Vidéo générée avec succès!',
      downloadVideo: 'Télécharger Vidéo',
      generateNewVideo: 'Générer Nouvelle Vidéo',
      importQuizToStart: 'Importez un quiz pour commencer',
      recording: 'Enregistrement...',
      recordingComplete: 'Enregistrement terminé!',
      quizzesImported: 'quiz importés',
      generateAllVideos: 'Générer Toutes les Vidéos',
      generatingVideos: 'Génération de {current} sur {total} vidéos...',
      downloadAllVideos: 'Télécharger Toutes les Vidéos (ZIP)',
      clearAllImports: 'Effacer Toutes les Importations',
    },
    // Quiz Config
    quizConfig: {
      questionsPerRound: 'Questions par tour',
      questionsPerRoundDesc: 'Nombre de questions qui apparaîtront dans la vidéo',
      optionsPerQuestion: 'Options par question',
      optionsPerQuestionDesc: 'Nombre d\'options de réponse par question',
      enableMusic: 'Activer la musique de fond',
      backgroundColor: 'Couleur de fond',
      textColor: 'Couleur du texte',
      videoFormat: 'Format de la Vidéo',
      videoFormatDesc: 'Format du fichier vidéo généré',
      videoResolution: 'Résolution de la Vidéo',
      videoResolutionDesc: 'Résolution de la vidéo générée (largeur x hauteur)',
      timerPerQuestion: 'Minuteur par question (secondes)',
      timerPerQuestionDesc: 'Temps disponible pour répondre à chaque question',
    },
    // Template Editor
    templateEditor: {
      title: 'Éditeur de Modèle',
      restoreDefault: 'Restaurer Par Défaut',
      colors: '🎨 Couleurs',
      backgroundColor: 'Couleur de Fond',
      textColor: 'Couleur du Texte',
      questionBackgroundColor: 'Couleur de Fond de la Question',
      optionsBackgroundColor: 'Couleur de Fond des Options',
      correctAnswerColor: 'Couleur de la Réponse Correcte',
      timerColor: 'Couleur du Timer',
      fonts: '✍️ Polices',
      questionFontSize: 'Taille de la Police de la Question',
      optionsFontSize: 'Taille de la Police des Options',
      timerFontSize: 'Taille de la Police du Timer',
      letterFontSize: 'Taille de la Police de la Lettre (A, B, C, D)',
    },
  },
};

export type TranslationKey = keyof typeof translations.pt;

