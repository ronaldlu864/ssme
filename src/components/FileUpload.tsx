import { useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Upload, File, X, Loader2 } from 'lucide-react'

export function FileUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!user) return
    setUploading(true)

    try {
      for (const file of files) {
        // 1. 上传到 Storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase
          .storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. 创建文档记录
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            filename: file.name,
            storage_path: filePath,
          })
          .select()
          .single()

        if (docError) throw docError

        // 3. 调用 Edge Function 处理 PDF
        const { error: processError } = await supabase.functions.invoke('process-pdf', {
          body: {
            documentId: doc.id,
            storagePath: filePath,
            filename: file.name,
          },
        })

        if (processError) throw processError
      }

      setFiles([])
      onUploadComplete()
      alert('上传成功！')
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onDrop(Array.from(e.dataTransfer.files))
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-300 mb-2">拖拽 PDF 文件到这里，或点击选择</p>
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={(e) => onDrop(Array.from(e.target.files || []))}
          className="hidden"
          id="file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-200">{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>处理中...</span>
              </>
            ) : (
              <span>上传并处理 {files.length} 个文件</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
