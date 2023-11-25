import {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  ClipboardEvent,
  MouseEventHandler,
  useRef,
  KeyboardEvent,
  FormEvent
} from "react"
import { toast } from "react-hot-toast"
import { SVG } from "./ui/svg"
import PasteIcon from '@/assets/images/paste.svg'
import UploadIcon from '@/assets/images/upload.svg'
import CameraIcon from '@/assets/images/camera.svg'
import { BingReturnType } from '@/lib/hooks/use-bing'
import { cn } from '@/lib/utils'
import { ImageUtils } from "@/lib/image"
import { useAtomValue } from "jotai"
import { systemPromptsAtom, gptAtom } from "@/state"

interface ChatImageProps extends Pick<BingReturnType, 'uploadImage'> {}

const preventDefault: MouseEventHandler<HTMLDivElement> = (event) => {
  event.nativeEvent.stopImmediatePropagation()
}

export function ChatImage({ children, uploadImage }: React.PropsWithChildren<ChatImageProps>) {
  const systemPrompts = useAtomValue(systemPromptsAtom)
  const enableGpt = useAtomValue(gptAtom)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const mediaStream = useRef<MediaStream>()
  const [panel, setPanel] = useState('none')

  const upload = useCallback((url: string) => {
    if (url) {
      uploadImage(url)
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
    setPanel('none')
  }, [panel])

  const onUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileDataUrl = await ImageUtils.getCompressedImageDataAsync(file)
      if (fileDataUrl) {
        upload(fileDataUrl)
      }
    }
  }, [])

  const onPaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
    const pasteUrl = event.clipboardData.getData('text') ?? ''
    upload(pasteUrl)
  }, [])

  const onEnter = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    // @ts-ignore
    const inputUrl = event.target?.elements?.image?.value?.trim?.()
    if (inputUrl) {
      if (/^https?:\/\/.+/.test(inputUrl)) {
        upload(inputUrl)
      } else {
        toast.error('请输入有效的图片链接')
      }
    }
  }, [])

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
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
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

  return !enableGpt && !systemPrompts && (
    <div className="visual-search-container">
      <div onClick={() => panel === 'none' ? setPanel('normal') : setPanel('none')}>{children}</div>
      <div className={cn('visual-search', panel)} onClick={preventDefault}>
        <div className="normal-content">
          <div className="header">
            <h4>添加图像</h4>
          </div>
          <div className="paste">
            <SVG alt="paste" src={PasteIcon} width={24} />
            <form onSubmitCapture={onEnter}>
              <input
                className="paste-input"
                id="sb_imgpst"
                type="text"
                name="image"
                placeholder="粘贴图像 URL"
                aria-label="粘贴图像 URL"
                onPaste={onPaste}
                onClickCapture={(e) => e.stopPropagation()}
              />
            </form>
          </div>
          <div className="buttons">
            <button type="button" aria-label="从此设备上传">
              <input
                ref={fileRef}
                className="fileinput"
                type="file"
                accept="image/gif, image/jpeg, image/png, image/webp"
                onChange={onUpload}
              />
              <SVG alt="uplaod" src={UploadIcon} width={20} />
              从此设备上传
            </button>
            <button type="button" aria-label="拍照" onClick={openVideo}>
              <SVG alt="camera" src={CameraIcon} width={20} />
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
