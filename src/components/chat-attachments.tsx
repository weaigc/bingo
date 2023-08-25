import ClearIcon from '@/assets/images/clear.svg'
import RefreshIcon from '@/assets/images/refresh.svg'
import { cn } from '@/lib/utils'
import { BingReturnType } from '@/lib/hooks/use-bing'
import { SVG } from './ui/svg'

type ChatAttachmentsProps = Pick<BingReturnType, 'attachmentList' | 'setAttachmentList' | 'uploadImage'>

export function ChatAttachments({ attachmentList = [], setAttachmentList, uploadImage }: ChatAttachmentsProps) {
  return attachmentList.length ? (
    <div className="attachment-list">
      {attachmentList.map(file => (
        <div className="file-item" key={file.url}>
          {file.status === 'loading' && (
            <div className="loading">
              <div className="bar" />
            </div>)
          }
          {file.status !== 'error' && (
            <div className="thumbnail">
              <img draggable="false" src={file.url} />
            </div>)
          }
          {file.status === 'error' && (
            <div className="error">
              <SVG alt="refresh" src={RefreshIcon} width={18} onClick={() => uploadImage(file.url)} />
            </div>
          )}
          <button className={cn('dismiss', { 'no-file': file.status === 'error' })} type="button">
            <SVG alt="clear" src={ClearIcon} width={16} onClick={() => setAttachmentList([])} />
          </button>
        </div>
      ))}
    </div>
  ) : null
}
