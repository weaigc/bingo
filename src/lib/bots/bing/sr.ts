// @ts-ignore
const SpeechRecognitionPolyfill: typeof webkitSpeechRecognition = typeof window !== 'undefined' ? (
  // @ts-ignore
  window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  // @ts-ignore
  window.mozSpeechRecognition ||
  // @ts-ignore
  window.msSpeechRecognition ||
  // @ts-ignore
  window.oSpeechRecognition
) as typeof webkitSpeechRecognition : undefined

type subscriber = (msg: string, command?: string) => void

export class SR {
  recognition?: SpeechRecognition
  onchange?: subscriber
  transcript: boolean = false
  listening: boolean = false
  private commandsRe?: RegExp
  constructor(commands: string[]) {
    this.recognition = SpeechRecognitionPolyfill ? new SpeechRecognitionPolyfill() : undefined
    if (!this.recognition) {
      return
    }
    this.configuration('zh-CN')
    if (commands.length) {
      this.commandsRe = new RegExp(`^(${commands.join('|')})。?$`)
    }
    this.recognition.onresult = this.speechRecognition
    this.recognition.onerror = (err) => {
      console.log('err', err.error)
      this.stop()
    }
    this.recognition.onend = () => {
      if (this.recognition && this.listening) {
        this.recognition.start()
      }
    }
  }

  speechRecognition = (event: SpeechRecognitionEvent) => {
    if (!this.listening) return
    for (var i = event.resultIndex; i < event.results.length; i++) {
      let result = event.results[i]
      if (result.isFinal) {
        var alt = result[0]
        const text = alt.transcript.trim()
        if (this.commandsRe && this.commandsRe.test(text)) {
          return this.onchange?.('', RegExp.$1)
        }
        if (!this.transcript) return
        this.onchange?.(text)
      }
    }
  }

  private configuration = async (lang: string = 'zh-CN') => {
    return new Promise((resolve) => {
      if (this.recognition) {
        this.recognition.continuous = true
        this.recognition.lang = lang
        this.recognition.onstart = resolve
      }
    })
  }

  start = async () => {
    if (this.recognition && !this.listening) {
      this.listening = true
      try {
        await this.recognition.start()
        this.transcript = true
      } catch(e) {
        console.error('start sr error', e)
        this.listening = false
      }
    }
  }

  stop = () => {
    if (this.recognition) {
      this.recognition.stop()
      this.transcript = false
      this.listening = false
    }
  }


  pause = () => {
    if (this.recognition) {
      this.transcript = false
    }
  }

  resume = () => {
    if (this.recognition) {
      this.transcript = true
    }
  }

  abort = () => {
    if (this.recognition && this.transcript) {
      this.recognition.abort()
      this.transcript = false
      this.listening = false
    }
  }
}

