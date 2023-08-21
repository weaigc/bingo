export class FileUtils {
  static getDataUrlAsync(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onabort = () => {
        reject('Load Aborted')
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.onload = () => {
        resolve(reader.result as string)
      }

      reader.readAsDataURL(file)
    })
  }
  static getArrayBufferAsync(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onabort = () => {
        reject('Load Aborted')
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.onload = () => {
        resolve(reader.result as ArrayBuffer)
      }

      reader.readAsArrayBuffer(file)
    })
  }
  static getImageElementFromDataUrl(dataURL: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onerror = () => {
        reject(null)
      }

      image.onload = () => {
        resolve(image)
      }

      image.src = dataURL
    })
  }

  static dataURLtoFile(dataURL: string, type?: string) {
    const typeRe = /:(.*?);/
    let [meta, base64] = dataURL.split(',')
    if (!base64) {
      base64 = meta
    } else if (!type) {
      type = typeRe.test(meta) ? RegExp.$1 : undefined
    }

    const rawData = atob(base64)
    let len = rawData.length
    const unitArray = new Uint8Array(len)
    while(len--) {
      unitArray[len] = rawData.charCodeAt(len)
    }
    return new File([unitArray], 'temp', type ? {
      type
    } : undefined)
  }
  static isFile(file: File | string) {
    return Boolean((file as File).stream)
  }
}

export class ImageUtils {
  static async getCompressedImageDataAsync(file: File | string) {
    let dataURI: string
    let fileObj: File
    if (FileUtils.isFile(file)) {
      fileObj = file as File
      dataURI = await FileUtils.getDataUrlAsync(fileObj)
    } else {
      dataURI = file as string
      fileObj = FileUtils.dataURLtoFile(dataURI)
    }

    if (typeof document === 'undefined' || !document.createElement) {
      return dataURI
    }
    const image = await FileUtils.getImageElementFromDataUrl(dataURI)
    if (!image.width || !image.height)
      throw new Error('Failed to load image.')

    let { width, height } = image
    const rate = 36e4 / (width * height)
    if (rate < 1) {
      const scaleRate = Math.sqrt(rate)
      width *= scaleRate
      height *= scaleRate
    }

    const canvas = document.createElement('canvas')
    ImageUtils.processImage(canvas, width, height, image)
    return ImageUtils.getImageDataOnCanvas(canvas)
  }

  static drawImageOnCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement, width: number, height: number) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = width,
        canvas.height = height,
        ctx.drawImage(image, 0, 0, width, height)
    }
  }
  static getImageDataOnCanvas(canvas: HTMLCanvasElement) {
    return canvas.toDataURL('image/jpeg', 0.7)
  }
  static processImage(canvas: HTMLCanvasElement, targetWidth: number, targetHeight: number, image: HTMLImageElement) {
    const { width, height } = canvas.style
    const ctx = canvas.getContext('2d')!
    canvas.width = targetWidth
    canvas.height = targetHeight
    canvas.style.width = width
    canvas.style.height = height

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, targetWidth, targetHeight)
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  }
}
