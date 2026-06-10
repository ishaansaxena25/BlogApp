import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Editor from './Editor';

const emptyContent = { blocks: [{ type: 'paragraph', data: { text: '' } }] };

export default function BlogForm({ initialData = null, onSubmit, isPending, serverErrors = null }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || emptyContent);
  const [coverImage, setCoverImage] = useState(null);
  const server = import.meta.env.VITE_API_URL || '';
  const initialPreview = initialData?.coverImageURL
    ? initialData.coverImageURL.startsWith('http')
      ? initialData.coverImageURL
      : `${server}${initialData.coverImageURL}`
    : '';
  const [previewUrl, setPreviewUrl] = useState(initialPreview);

  // Clean up ObjectURL preview on unmount
  useEffect(() => {
    return () => {
      if (coverImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [coverImage, previewUrl]);

  // Extract field-specific error messages from validation output
  const getFieldError = (fieldName) => {
    if (!serverErrors) return null;
    if (Array.isArray(serverErrors)) {
      const found = serverErrors.find((err) => err.path === fieldName);
      return found ? found.msg : null;
    }
    if (serverErrors.errors && Array.isArray(serverErrors.errors)) {
      const found = serverErrors.errors.find((err) => err.path === fieldName);
      return found ? found.msg : null;
    }
    return serverErrors[fieldName] || null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    const server = import.meta.env.VITE_API_URL || '';
    setPreviewUrl(initialData?.coverImageURL ? `${server}${initialData.coverImageURL}` : '');
    // Reset file input element
    const fileInput = document.getElementById('coverImage');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, coverImage });
  };

  const titleError = getFieldError('title');
  const contentError = getFieldError('content');

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* General Error Alert */}
      {serverErrors && !Array.isArray(serverErrors) && !serverErrors.errors && serverErrors.error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-sm">
          {serverErrors.error}
        </div>
      )}

      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-slate-200 mb-2">
          Post Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a catchy title..."
          disabled={isPending}
          className={`glass-input text-base ${titleError ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500' : ''}`}
        />
        {titleError && (
          <p className="mt-1.5 text-xs font-medium text-red-400">{titleError}</p>
        )}
      </div>

      {/* Cover Image Input */}
      <div>
        <span className="block text-sm font-semibold text-slate-200 mb-2">
          Cover Image
        </span>

        {previewUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video max-h-[320px] bg-slate-900">
            <img
              src={previewUrl}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-full text-slate-350 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Remove Cover Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="coverImage"
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-brand-500/60 hover:bg-brand-500/5 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group"
          >
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 group-hover:border-brand-500/20 group-hover:bg-brand-600/10 transition-colors mb-3">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-400 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-slate-200">
              Upload a cover photo
            </span>
            <span className="text-xs text-slate-500 mt-1">
              PNG, JPG, or WebP up to 5MB
            </span>
            <input
              type="file"
              id="coverImage"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              disabled={isPending}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Editor.js Content */}
      <div>
        <span className="block text-sm font-semibold text-slate-200 mb-2">
          Story Content
        </span>
        <Editor initialData={content} onChange={setContent} disabled={isPending} />
        {contentError && (
          <p className="mt-1.5 text-xs font-medium text-red-400">{contentError}</p>
        )}
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-900">
        <button
          type="submit"
          disabled={isPending || !title.trim() || !content?.blocks?.length}
          className="glass-button flex items-center justify-center space-x-2 px-6 py-3 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <span>Publish Post</span>
          )}
        </button>
      </div>
    </form>
  );
}
