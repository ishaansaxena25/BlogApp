import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlog, updateBlog, getProfile } from '../api';
import BlogForm from '../components/BlogForm';
import { Edit3, ArrowLeft, Loader2 } from 'lucide-react';

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  // Fetch logged in user details
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = userData?.user;

  // Fetch blog detail
  const { data: blogData, isLoading: isBlogLoading, isError: isBlogError, error: blogError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => getBlog(id),
    retry: false,
  });

  const blog = blogData?.blog;

  // Verify ownership or admin role once loaded
  useEffect(() => {
    if (!isUserLoading && !isBlogLoading && blog && currentUser) {
      const isOwner = currentUser.id === blog.createdBy?._id || currentUser.role === 'ADMIN';
      if (!isOwner) {
        navigate(`/blogs/${id}`, { replace: true });
      }
    }
  }, [isUserLoading, isBlogLoading, blog, currentUser, id, navigate]);

  // Mutation to update blog
  const mutation = useMutation({
    mutationFn: (formData) => updateBlog(id, formData),
    onSuccess: (data, formData) => {
      setError(null);
      // Invalidate queries to reload updated details
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      // Redirect back to blog page
      if (formData.get('status') === 'PUBLISHED') {
        navigate(`/blogs/${data.blog.slug || id}`);
      }
    },
    onError: (err) => {
      setError(err);
    },
  });

  const handleSubmit = ({ title, content, excerpt, tags, status, coverImage, autoSave }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', JSON.stringify(content));
    formData.append('excerpt', excerpt);
    formData.append('tags', JSON.stringify(tags));
    formData.append('status', status);
    if (autoSave) formData.append('autoSave', 'true');
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    mutation.mutate(formData);
  };

  const isLoading = isUserLoading || isBlogLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (isBlogError || !blog) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-200">
          {blogError?.message || 'Article not found.'}
        </div>
        <Link to="/" className="inline-flex items-center space-x-1.5 text-brand-400 hover:text-brand-300 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link to={`/blogs/${id}`} className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel and view post</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center justify-center space-x-2.5">
          <Edit3 className="w-7 h-7 text-brand-400" />
          <span>Edit Your Post</span>
        </h1>
        <p className="text-sm text-slate-400">
          Update your article content, title, or cover image.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 sm:p-10 border border-slate-900/60 shadow-2xl">
        <BlogForm
          initialData={blog}
          onSubmit={handleSubmit}
          isPending={mutation.isPending}
          serverErrors={error}
        />
      </div>
    </main>
  );
}
