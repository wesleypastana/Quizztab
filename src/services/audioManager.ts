/**
 * Gerenciador de áudio para música de fundo e efeitos sonoros
 */
export class AudioManager {
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private isMusicEnabled: boolean = true;
  private isSoundEnabled: boolean = true;
  private musicVolume: number = 0.3;
  private soundVolume: number = 0.7;
  private audioContext: AudioContext | null = null;
  private audioSources: Map<string, MediaElementAudioSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private masterGainNode: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  
  // Controle de sons para evitar duplicação
  private lastTickTime: number = 0;
  private lastCorrectTime: number = 0;
  private readonly TICK_COOLDOWN = 50; // ms entre ticks
  private readonly CORRECT_COOLDOWN = 500; // ms entre sons de validação

  /**
   * Inicializa o AudioContext para captura de áudio
   */
  initializeAudioContext(audioContext: AudioContext, destination: MediaStreamAudioDestinationNode): void {
    this.audioContext = audioContext;
    this.destinationNode = destination;
    
    // Cria um nó de ganho master para controlar o volume geral
    this.masterGainNode = audioContext.createGain();
    this.masterGainNode.gain.value = 1.0;
    this.masterGainNode.connect(destination);
  }

  /**
   * Carrega música de fundo
   */
  async loadBackgroundMusic(url: string): Promise<void> {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
      // Remove a fonte de áudio anterior
      if (this.audioSources.has('background')) {
        this.audioSources.delete('background');
      }
      if (this.gainNodes.has('background')) {
        this.gainNodes.delete('background');
      }
    }

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = this.musicVolume;
    this.backgroundMusic = audio;
    
    // Conecta ao AudioContext se disponível
    if (this.audioContext && this.masterGainNode) {
      try {
        const source = this.audioContext.createMediaElementSource(audio);
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.musicVolume;
        source.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        this.audioSources.set('background', source);
        this.gainNodes.set('background', gainNode);
      } catch (error) {
        console.warn('Erro ao conectar música de fundo ao AudioContext:', error);
      }
    }
  }

  /**
   * Carrega um efeito sonoro
   */
  async loadSoundEffect(name: string, url: string): Promise<void> {
    const audio = new Audio(url);
    audio.volume = this.soundVolume;
    this.soundEffects.set(name, audio);
    
    // Conecta ao AudioContext se disponível
    if (this.audioContext && this.masterGainNode) {
      try {
        const source = this.audioContext.createMediaElementSource(audio);
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.soundVolume;
        source.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        this.audioSources.set(name, source);
        this.gainNodes.set(name, gainNode);
      } catch (error) {
        console.warn(`Erro ao conectar efeito sonoro ${name} ao AudioContext:`, error);
      }
    }
  }

  /**
   * Reproduz música de fundo
   */
  playBackgroundMusic(): void {
    if (!this.isMusicEnabled || !this.backgroundMusic) return;

    this.backgroundMusic.play().catch((error) => {
      console.warn('Erro ao reproduzir música de fundo:', error);
    });
  }

  /**
   * Para a música de fundo
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  /**
   * Cria um som sintético usando Web Audio API
   * IMPORTANTE: Cada chamada cria um novo som, permitindo sobreposição
   */
  private createSyntheticSound(_name: string, frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.masterGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Envelope ADSR simples e mais rápido para sons mais precisos
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.soundVolume * 0.6, now + 0.005); // Attack mais rápido
    gainNode.gain.exponentialRampToValueAtTime(this.soundVolume * 0.4, now + duration * 0.2); // Decay mais rápido
    gainNode.gain.setValueAtTime(this.soundVolume * 0.4, now + duration * 0.6); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Reproduz um efeito sonoro
   * IMPORTANTE: Implementa cooldown para evitar sons duplicados
   */
  playSoundEffect(name: string): void {
    if (!this.isSoundEnabled) return;

    const now = Date.now();
    
    // Verifica cooldown para evitar sons duplicados
    if (name === 'tick') {
      if (now - this.lastTickTime < this.TICK_COOLDOWN) {
        return; // Ignora se foi tocado muito recentemente
      }
      this.lastTickTime = now;
    } else if (name === 'correct') {
      if (now - this.lastCorrectTime < this.CORRECT_COOLDOWN) {
        return; // Ignora se foi tocado muito recentemente
      }
      this.lastCorrectTime = now;
    }

    // Se há um arquivo de áudio carregado, usa ele
    const audio = this.soundEffects.get(name);
    if (audio) {
      // Se o áudio já está conectado ao AudioContext, apenas toca
      // Caso contrário, cria uma nova instância para permitir sobreposição
      if (this.audioSources.has(name)) {
        // Reseta o áudio para o início e toca
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.warn(`Erro ao reproduzir efeito sonoro ${name}:`, error);
        });
      } else {
        // Cria uma nova instância para permitir sobreposição
        const newAudio = audio.cloneNode() as HTMLAudioElement;
        newAudio.volume = this.soundVolume;
        newAudio.play().catch((error) => {
          console.warn(`Erro ao reproduzir efeito sonoro ${name}:`, error);
        });
      }
      return;
    }

    // Se não há arquivo, cria um som sintético
    if (this.audioContext && this.masterGainNode) {
      switch (name) {
        case 'tick':
          // Bip curto e agudo para o timer - som único e preciso
          // IMPORTANTE: Este som é APENAS para o timer
          this.createSyntheticSound('tick', 800, 0.08, 'sine');
          break;
        case 'correct':
          // Som de sucesso (dois tons ascendentes) - apenas quando resposta correta aparece
          // IMPORTANTE: Este som é APENAS para validação de resposta correta
          this.createSyntheticSound('correct', 523.25, 0.15, 'sine'); // C5
          setTimeout(() => {
            if (this.audioContext && this.masterGainNode) {
              this.createSyntheticSound('correct', 659.25, 0.2, 'sine'); // E5
            }
          }, 100);
          break;
        default:
          // Som genérico
          this.createSyntheticSound(name, 440, 0.2, 'sine');
      }
    }
  }

  /**
   * Habilita/desabilita música
   */
  setMusicEnabled(enabled: boolean): void {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  /**
   * Habilita/desabilita efeitos sonoros
   */
  setSoundEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
  }

  /**
   * Define o volume da música
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
    // Atualiza o ganho no AudioContext se disponível
    const gainNode = this.gainNodes.get('background');
    if (gainNode) {
      gainNode.gain.value = this.musicVolume;
    }
  }

  /**
   * Define o volume dos efeitos sonoros
   */
  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    // Atualiza o ganho de todos os efeitos sonoros no AudioContext
    this.soundEffects.forEach((audio, name) => {
      if (name !== 'background') {
        audio.volume = this.soundVolume;
        const gainNode = this.gainNodes.get(name);
        if (gainNode) {
          gainNode.gain.value = this.soundVolume;
        }
      }
    });
  }
  
  /**
   * Obtém o stream de áudio para gravação
   */
  getAudioStream(): MediaStream | null {
    return this.destinationNode?.stream || null;
  }

  /**
   * Reseta os cooldowns (útil ao mudar de pergunta)
   */
  resetCooldowns(): void {
    this.lastTickTime = 0;
    this.lastCorrectTime = 0;
  }

  /**
   * Limpa todos os recursos de áudio
   */
  cleanup(): void {
    this.stopBackgroundMusic();
    this.soundEffects.clear();
    this.audioSources.clear();
    this.gainNodes.clear();
    this.masterGainNode = null;
    this.destinationNode = null;
    this.audioContext = null;
    this.resetCooldowns();
  }
}

// Instância singleton
export const audioManager = new AudioManager();
