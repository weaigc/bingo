import { sleep } from './utils'

const synth = window.speechSynthesis

export class TTS {
  currentText = ''
  speakText = ''
  private controller = new AbortController()
  speaking = false
  get isSpeaking() {
    return this.speaking
  }
  finished = false
  constructor() {}
  abort = () => {
    this.controller.abort()
  }

  reset = () => {
    this.speaking = false
    this.finished = true
    this.currentText = ''
    this.speakText = ''
    this.abort()
  }

  speak = (text: string) => {
    if (!synth || text?.trim()?.length < 2) {
      return
    }
    this.currentText = text.replace(/[^\u4e00-\u9fa5_a-zA-Z0-9，。？,：；\.,:]+/g, '')
    this.finished = false
    this.loop()
  }

  private async doSpeek() {
    return new Promise((resolve) => {
      const endIndex = this.finished ? this.currentText.length :
        Math.max(
          this.currentText.lastIndexOf('。'),
          this.currentText.lastIndexOf('；'),
          this.currentText.lastIndexOf('、'),
          this.currentText.lastIndexOf('？'),
          this.currentText.lastIndexOf('\n')
        )
      const startIndex = this.speakText.length ? Math.max(0, this.currentText.lastIndexOf(this.speakText) + this.speakText.length) : 0

      if (startIndex >= endIndex) {
        return resolve(true)
      }
      const text = this.currentText.slice(startIndex, endIndex)
      this.speakText = text
      const utterThis = new SpeechSynthesisUtterance(text)
      this.controller.signal.onabort = () => {
        synth.cancel()
        this.finished = true
        resolve(false)
      }

      utterThis.onend = function (event) {
        resolve(true)
      }

      utterThis.onerror = function (event) {
        resolve(false)
      }

      const voice = synth.getVoices().find(v => v.name.includes('Microsoft Yunxi Online')) ?? null
      utterThis.voice = voice
      synth.speak(utterThis)
    })
  }

  private async loop() {
    if (this.speaking) return
    this.speaking = true
    while(!this.finished) {
      await Promise.all([sleep(1000), this.doSpeek()])
    }
    this.speaking = false
  }
}
