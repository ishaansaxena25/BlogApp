import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlog } from '../api';
import BlogForm from '../components/BlogForm';
import { Feather, Sparkles } from 'lucide-react';

export default function CreateBlog() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  // Mutation to create a blog
  const mutation = useMutation({
    mutationFn: (formData) => createBlog(formData),
    onSuccess: (data) => {
      setError(null);
      // Invalidate blogs listing query
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      // Redirect to the new blog page
      navigate(
        data.blog.status === 'DRAFT'
          ? `/blogs/${data.blog._id}/edit`
          : `/blogs/${data.blog.slug || data.blog._id}`
      );
    },
    onError: (err) => {
      // Capture detailed express-validator output or general backend error
      setError(err);
    },
  });

  const handleSubmit = ({ title, content, excerpt, tags, status, coverImage }) => {
    // Construct FormData as req is multipart/form-data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));
    if (excerpt) formData.append('excerpt', excerpt);
    formData.append('tags', JSON.stringify(tags));
    formData.append('status', status);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    mutation.mutate(formData);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pb-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-600/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Publication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center justify-center space-x-2.5">
          <Feather className="w-7 h-7 text-brand-400" />
          <span>Create a New Story</span>
        </h1>
        <p className="text-sm text-slate-400">
          Share your ideas, experiences, or expertise with the BlogBubble community.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 sm:p-10 border border-slate-900/60 shadow-2xl">
        <BlogForm
          onSubmit={handleSubmit}
          isPending={mutation.isPending}
          serverErrors={error}
        />
      </div>
    </main>
  );
}
