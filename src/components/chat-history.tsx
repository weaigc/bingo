import { IconEdit, IconTrash, IconMore, IconDownload } from "./ui/icons"

export function ChatHistory() {
  return (
    <div className="chat-history fixed top-18 right-4">
      <div className="chat-history-header text-sm font-semibold text-left w-[280px] px-4 py-6">
        历史记录
      </div>
      <div className="chat-history-main">
        <div className="scroller">
          <div className="surface">
            <div className="threads">
              <div className="thread">
                <div className="primary-row">
                  <button type="button" aria-label="加载聊天">

                  </button>
                  <div className="description">
                    <h3 className="name">无标题的聊天</h3>
                  </div>
                  <h4 className="time">上午1:42</h4>
                  <div className="controls">

                    <button className="edit icon-button" type="button" aria-label="重命名">
                      <IconEdit />
                    </button>

                    <button className="delete icon-button" type="button" aria-label="删除">
                      <IconTrash />
                    </button>

                    <button className="more icon-button" type="button" aria-haspopup="true" aria-expanded="false" aria-label="更多">
                      <IconMore />
                    </button>

                    <button className="export icon-button" type="button" aria-label="导出">
                      <IconDownload />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
