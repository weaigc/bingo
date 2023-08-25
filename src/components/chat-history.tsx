import { useCallback, useEffect, useState } from 'react'
import { useChatHistory, ChatConversation } from '@/lib/hooks/chat-history'
import { IconEdit, IconTrash, IconMore, IconDownload, IconCheck, IconClose } from './ui/icons'
import { cn, formatDate } from '@/lib/utils'
import { BingReturnType } from '@/lib/hooks/use-bing'

interface ConversationTheadProps {
  conversation: ChatConversation
  onRename: (conversation: ChatConversation, chatName: string) => void
  onDelete: (conversation: ChatConversation) => void
  onUpdate: (conversation: ChatConversation) => void
}

export function ConversationThead({ conversation, onRename, onDelete, onUpdate }: ConversationTheadProps) {
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
  useEffect(() => {
    setName(conversation.chatName)
  }, [conversation])
  return (
    <div className={cn('thread select-none', { active: isEdit })} onClick={() => onUpdate(conversation)}>
      <div className="primary-row flex">
        <div className="description flex-1">
          {!isEdit ? (
            <h3 className="name w-[200px]">{name}</h3>
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

            <button className="export icon-button" type="button" aria-label="导出">
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

export function ChatHistory({ className }: { className?: string }) {
  const { chatHistory, refreshChats, deleteChat, renameChat, updateMessage } = useChatHistory()
  useEffect(() => {
    refreshChats()
  }, [])
  return (
    <div className={cn('chat-history right-4 z-10 fixed w-[342px]', className)}>
      <div className="chat-history-header text-sm font-semibold text-left px-4 pb-6">
        历史记录
      </div>
      {chatHistory?.chats?.length ? (
        <div className="chat-history-main">
          <div className="scroller">
            <div className="surface">
              <div className="threads w-[310px]">
                {chatHistory.chats.map((chat) => (
                  <ConversationThead key={chat.conversationId}
                    conversation={chat}
                    onDelete={deleteChat}
                    onRename={renameChat}
                    onUpdate={updateMessage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : []}
    </div>
  )
}
