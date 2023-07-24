import { sleep } from './utils'

const synth = window.speechSynthesis

export class Speaker {
  lastIndex = 0
  lastText = ''
  private controller = new AbortController()
  private speaking = false
  finished = false
  constructor() {}
  abort() {
    this.controller.abort()
  }

  reset() {
    this.speaking = false
    this.finished = true
    this.abort()
  }

  speak(text: string) {
    if (!synth || text?.trim()?.length < 2) {
      return
    }
    this.lastText = text.replace(/[^\u4e00-\u9fa5_a-zA-Z0-9，。？,：\.,:]+/g, '')
    this.finished = false
    this.loop()
  }

  private async doSpeek() {
    return new Promise((resolve) => {
      const currentIndex = Math.max(this.lastText.indexOf('。'), this.lastText.indexOf('？'), this.lastText.length, this.lastIndex)
      if (currentIndex === this.lastIndex) {
        return
      }
      const text = this.lastText.slice(this.lastIndex, currentIndex)
      this.lastIndex = currentIndex
      const utterThis = new SpeechSynthesisUtterance(text)
      this.controller.signal.onabort = () => {
        synth.cancel()
        this.finished = true
        resolve(false)
      }

      utterThis.onend = function (event) {
        console.log("SpeechSynthesisUtterance.onend")
        resolve(true)
      }

      utterThis.onerror = function (event) {
        console.error("SpeechSynthesisUtterance.onerror")
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
      await this.doSpeek()
      await sleep(800)
    }
    this.speaking = false
  }
}
