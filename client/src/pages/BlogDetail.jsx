import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlog, deleteBlog, bookmarkBlog, unbookmarkBlog, getProfile } from '../api';
import CommentSection from '../components/CommentSection';
import EditorRenderer from '../components/EditorRenderer';
import { Calendar, User, Bookmark, Edit2, Trash2, ArrowLeft, Loader2, BookmarkCheck } from 'lucide-react';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch single blog details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => getBlog(id),
    retry: false,
  });

  // Fetch logged in user
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = userData?.user;
  const blog = data?.blog;
  const comments = data?.comments || [];
  const isBookmarked = data?.bookmarked;

  // Check if owner/admin
  const isOwner = currentUser && blog && (currentUser.id === blog.createdBy?._id || currentUser.role === 'ADMIN');

  // Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => (isBookmarked ? unbookmarkBlog(id) : bookmarkBlog(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  // Delete Blog Mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      navigate('/');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const getCoverImageUrl = (path) => {
    if (!path) {
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    }
    if (path.startsWith('http')) return path;
    const server = import.meta.env.VITE_API_URL || '';
    return `${server}${path}`;
  };

  const getAvatarUrl = (path) => {
    const server = import.meta.env.VITE_API_URL || '';
    if (!path) return `${server}/default.png`;
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Recent';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium">Fetching article...</p>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-200">
          {error?.message || 'Article not found.'}
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
        <Link to="/" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all posts</span>
        </Link>
      </div>

      {/* Cover Image Banner */}
      <div className="rounded-2xl overflow-hidden border border-slate-900 aspect-[21/9] max-h-[400px] w-full bg-slate-900 shadow-2xl relative">
        <img
          src={getCoverImageUrl(blog.coverImageURL)}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      </div>

      {/* Main post layout */}
      <article className="space-y-6">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight font-sans">
          {blog.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          {(blog.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}
          {blog.readingTime && <span>{blog.readingTime} min read</span>}
        </div>

        {/* Metadata and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-900">
          {/* Author information */}
          <div className="flex items-center space-x-3">
            <img
              src={getAvatarUrl(blog.createdBy?.profileImageURL)}
              alt={blog.createdBy?.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-800"
            />
            <div>
              <p className="text-sm font-bold text-white">{blog.createdBy?.fullName || 'Anonymous'}</p>
              <p className="text-xs text-slate-450 flex items-center space-x-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(blog.createdAt)}</span>
              </p>
            </div>
          </div>

          {/* Action buttons (Bookmark, Edit, Delete) */}
          <div className="flex items-center space-x-3">
            {currentUser && (
              <button
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center space-x-1.5 px-3 py-1.8 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-brand-600/10 border-brand-500/30 text-brand-400 hover:bg-brand-600/20'
                    : 'border-slate-800 text-slate-450 hover:border-slate-700 hover:text-white'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save Post</span>
                  </>
                )}
              </button>
            )}

            {isOwner && (
              <>
                <Link
                  to={`/blogs/${id}/edit`}
                  className="flex items-center space-x-1.5 px-3 py-1.8 rounded-lg text-sm font-semibold border border-slate-800 text-slate-450 hover:border-slate-700 hover:text-white transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center space-x-1.5 px-3 py-1.8 rounded-lg text-sm font-semibold border border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:border-red-905 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor.js content */}
        <div className="text-base sm:text-lg py-4">
          <EditorRenderer content={blog.content} />
        </div>
      </article>

      {/* Comment Section */}
      <CommentSection blogId={id} comments={comments} />
    </main>
  );
}
