import { useState } from 'react'
import { Chat } from '../components/Chat'
import { FileUpload } from '../components/FileUpload'
import { FileText, MessageSquare } from 'lucide-react'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat')

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <h1 className="text-xl font-bold text-white mb-6">SCM Medical AI</h1>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>AI 对话</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>上传文档</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? <Chat /> : <FileUpload onUploadComplete={() => setActiveTab('chat')} />}
      </div>
    </div>
  )
}
