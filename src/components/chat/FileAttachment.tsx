"use client";

import { useState } from 'react';
import { File, Image, FileText, Music, Video, Download, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileAttachmentProps {
  file: {
    name: string;
    size: number;
    type: string;
    url?: string;
    data?: string; // base64 data
  };
  onRemove?: () => void;
  isPreview?: boolean;
}

export default function FileAttachment({ file, onRemove, isPreview = false }: FileAttachmentProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (file.type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (file.type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else if (file.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      link.click();
    }
  };

  const handlePreview = () => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setIsPreviewOpen(true);
    }
  };

  const renderPreview = () => {
    if (!isPreviewOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-4xl max-h-full bg-black rounded-lg border border-white/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h3 className="text-white font-medium">{file.name}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-auto">
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url || file.data}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : file.type === 'application/pdf' ? (
                <iframe
                  src={file.url || file.data}
                  className="w-full h-96 border-0"
                  title={file.name}
                />
              ) : (
                <div className="text-center text-white/60 py-8">
                  <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Предварительный просмотр недоступен для этого типа файла</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group"
      >
        <div className="text-white/60">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">{file.name}</p>
          <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(file.type.startsWith('image/') || file.type === 'application/pdf') && (
            <button
              onClick={handlePreview}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Предварительный просмотр"
            >
              <Eye className="w-4 h-4 text-white/60" />
            </button>
          )}
          
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Скачать"
          >
            <Download className="w-4 h-4 text-white/60" />
          </button>

          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
              title="Удалить"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </motion.div>

      {renderPreview()}
    </>
  );
}
