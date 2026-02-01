import type { Message } from '@/types/database'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  senderAvatar?: string
  senderName?: string
  showSenderName?: boolean
}

export default function MessageBubble({ message, isOwn, senderAvatar, senderName, showSenderName }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-background-elevated overflow-hidden flex-shrink-0 self-end border border-glass-border shadow-sm">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm flex items-center justify-center h-full bg-msu-green/5">👤</span>
          )}
        </div>
      )}
      <div className="flex flex-col max-w-[75%]">
        {showSenderName && senderName && (
          <span className="text-xs font-bold text-foreground-subtle mb-1 ml-3">
            {senderName.split(' ')[0]}
          </span>
        )}
        <div
          className={`px-4 py-3 ${
            isOwn
              ? 'bg-msu-gradient text-white rounded-2xl rounded-br-sm shadow-md'
              : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100'
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className={`text-[10px] mt-1 font-medium ${isOwn ? 'text-right mr-1 text-foreground-subtle' : 'ml-1 text-foreground-subtle'}`}>
          {formatTime(message.created_at)}
          {isOwn && message.read_at && (
            <span className="ml-1 text-msu-green">✓</span>
          )}
        </span>
      </div>
    </div>
  )
}
