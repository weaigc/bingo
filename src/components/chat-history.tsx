import { useCallback, useEffect, useState } from 'react'
import { useChatHistory, ChatConversation } from '@/lib/hooks/chat-history'
import { IconEdit, IconTrash, IconDownload, IconCheck, IconClose } from './ui/icons'
import { cn, formatDate } from '@/lib/utils'
import { useAtomValue } from 'jotai'
import { historyAtom } from '@/state'
import { debug } from '@/lib/isomorphic'

interface ConversationTheadProps {
  conversation: ChatConversation
  onRename: (conversation: ChatConversation, chatName: string) => void
  onDelete: (conversation: ChatConversation) => void
  onUpdate: (conversation: ChatConversation) => void
  onDownload: (conversation: ChatConversation) => void
}

export function ConversationThead({ conversation, onRename, onDelete, onUpdate, onDownload }: ConversationTheadProps) {
  const [isEdit, setEdit] = useState(false)
  const [name, setName] = useState(conversation.chatName)
  const handleSave = useCallback(() => {
    if (!name) {
      setName(conversation.chatName)
      return
    }
    setEdit(false)
    onRename(conversation, name)
  }, [conversation, name])
  const handleDelete = useCallback(() => {
    onDelete(conversation)
  }, [conversation])
  const handleDownload = useCallback(() => {
    onDownload(conversation)
  }, [conversation])
  useEffect(() => {
    setName(conversation.chatName)
  }, [conversation])

  return (
    <div className={cn('thread', { active: isEdit })}>
      <div className="primary-row flex w-full">
        <div className="description flex-1">
          {!isEdit ? (
            <h3 className="name" title={name} onClick={() => onUpdate(conversation)}>{name}</h3>
          ) : (<input className="input-name" defaultValue={name} onChange={(event) => setName(event.target.value)} />)}
        </div>
        {!isEdit && (<h4 className="time">{formatDate(conversation.updateTimeUtc)}</h4>)}
        <div className="controls">
          {!isEdit ? (<>
            <button className="edit icon-button" type="button" aria-label="重命名" onClick={() => setEdit(true)}>
              <IconEdit />
            </button>

            <button className="delete icon-button" type="button" aria-label="删除" onClick={handleDelete}>
              <IconTrash />
            </button>

            <button className="export icon-button" type="button" aria-label="导出" onClick={handleDownload}>
              <IconDownload />
            </button>
          </>) : (
            <>
              <button className="edit icon-button" type="button" aria-label="保存" onClick={handleSave}>
                <IconCheck />
              </button>
              <button className="edit icon-button" type="button" aria-label="取消" onClick={() => setEdit(false)}>
                <IconClose />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatHistory({ className, onExpaned }: { className?: string, onExpaned: (flag: boolean) => void }) {
  const historyEnabled = useAtomValue(historyAtom)
  const { chatHistory, refreshChats, deleteChat, renameChat, updateMessage, downloadMessage } = useChatHistory(historyEnabled)
  useEffect(() => {
    debug('historyEnabled', historyEnabled)
    if (!historyEnabled) return
    refreshChats()
      .then(res =>{
        if (res?.chats.length > 0) {
          onExpaned(true)
        }
      })
  }, [])
  return chatHistory?.chats?.length ? (
    <div className={cn('chat-history right-4 z-50 fixed', className)}>
      <div className="chat-history-header text-sm font-semibold text-left px-4 pb-6">
        历史记录
      </div>

      <div className="chat-history-main">
        <div className="scroller">
          <div className="surface">
            <div className="threads">
              {chatHistory.chats.map((con) => (
                <ConversationThead
                  key={con.conversationId}
                  conversation={con}
                  onDelete={deleteChat}
                  onRename={renameChat}
                  onUpdate={updateMessage}
                  onDownload={downloadMessage}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null
}
