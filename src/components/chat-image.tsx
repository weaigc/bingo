import {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  ClipboardEvent,
  MouseEventHandler,
  useRef,
  KeyboardEvent
} from "react"
import Image from 'next/image'
import PasteIcon from '@/assets/images/paste.svg'
import UploadIcon from '@/assets/images/upload.svg'
import CameraIcon from '@/assets/images/camera.svg'
import { useBing } from '@/lib/hooks/use-bing'
import { cn } from '@/lib/utils'
import { toast } from "react-hot-toast"

interface ChatImageProps extends Pick<ReturnType<typeof useBing>, 'uploadImage'> {}

const preventDefault: MouseEventHandler<HTMLDivElement> = (event) => {
  event.nativeEvent.stopImmediatePropagation()
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = reject
})

export function ChatImage({ children, uploadImage }: React.PropsWithChildren<ChatImageProps>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaStream = useRef<MediaStream>()
  const [panel, setPanel] = useState('none')
  const [inputUrl, setInputUrl] = useState('')

  const upload = useCallback((url: string) => {
    if (url) {
      uploadImage(url)
    }
    setPanel('none')
  }, [panel])

  const onUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileDataUrl = await toBase64(file)
      if (fileDataUrl) {
        upload(fileDataUrl)
      }
    }
  }, [])

  const onPaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
    const pasteUrl = event.clipboardData.getData('text') ?? ''
    upload(pasteUrl)
  }, [])

  const onEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    event.preventDefault()
    // @ts-ignore
    event.stopPropagation()
    if (/^https?:\/\/.+/.test(inputUrl)) {
      upload(inputUrl)
    } else {
      toast.error('请输入有效的图片链接')
    }
  }, [inputUrl])

  const openVideo: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.stopPropagation()
    setPanel('camera-mode')
  }

  const onCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current
      canvas.width = videoRef.current!.videoWidth
      canvas.height = videoRef.current!.videoHeight
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const cameraUrl = canvas.toDataURL('image/jpeg')
      upload(cameraUrl)
    }
  }

  useEffect(() => {
    const handleBlur = () => {
      if (panel !== 'none') {
        setPanel('none')
      }
    }
    document.addEventListener('click', handleBlur)
    return () => {
      document.removeEventListener('click', handleBlur)
    }
  }, [panel])

  useEffect(() => {
    if (panel === 'camera-mode') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(videoStream => {
        mediaStream.current = videoStream
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream
        }
      })
    } else {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(function(track) {
          track.stop()
        })
        mediaStream.current = undefined
      }
    }
  }, [panel])

  return (
    <div className="visual-search-container">
      <div onClick={() => panel === 'none' ? setPanel('normal') : setPanel('none')}>{children}</div>
      <div className={cn('visual-search', panel)} onClick={preventDefault}>
        <div className="normal-content">
          <div className="header">
            <h4>添加图像</h4>
          </div>
          <div className="paste">
            <Image alt="paste" src={PasteIcon} width={24} />
            <input
              className="paste-input"
              id="sb_imgpst"
              type="text"
              name="image"
              placeholder="粘贴图像 URL"
              aria-label="粘贴图像 URL"
              onPaste={onPaste}
              onChange={(event) => setInputUrl(event.target.value.trim())}
              onKeyDownCapture={event => {
                if (event.key === 'Enter') {
                  onEnter(event)
                }
              }}
              onClickCapture={(e) => e.stopPropagation()}
            />
          </div>
          <div className="buttons">
            <button type="button" aria-label="从此设备上传">
              <input
                id="vs_fileinput"
                className="fileinput"
                type="file"
                accept="image/gif, image/jpeg, image/png, image/webp"
                onChange={onUpload}
              />
              <Image alt="uplaod" src={UploadIcon} width={20} />
              从此设备上传
            </button>
            <button type="button" aria-label="拍照" onClick={openVideo}>
              <Image alt="camera" src={CameraIcon} width={20} />
              拍照
            </button>
          </div>
        </div>
        {panel === 'camera-mode' && <div className="cam-content">
          <div className="webvideo-container">
            <video className="webvideo" autoPlay muted playsInline ref={videoRef} />
            <canvas className="webcanvas" ref={canvasRef} />
          </div>
          <div className="cambtn" role="button" aria-label="拍照" onClick={onCapture}>
            <div className="cam-btn-circle-large"></div>
            <div className="cam-btn-circle-small"></div>
          </div>
        </div>}
      </div>
    </div>
  )
}
