import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookmarks, unbookmarkBlog } from '../api';
import BlogCard from '../components/BlogCard';
import { Bookmark, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export default function Bookmarks() {
  const queryClient = useQueryClient();

  // Fetch bookmarks query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

  const bookmarkedBlogs = data?.blogs || [];

  // Remove Bookmark Mutation
  const unbookmarkMutation = useMutation({
    mutationFn: (blogId) => unbookmarkBlog(blogId),
    onSuccess: (_, blogId) => {
      // Invalidate queries to reload bookmarks
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
    },
  });

  const handleRemoveBookmark = (blogId) => {
    unbookmarkMutation.mutate(blogId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium">Loading bookmarks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-white font-sans">Error Loading Bookmarks</h3>
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-200">
          {error?.message || 'Something went wrong.'}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pb-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-600/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Reading List</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center justify-center space-x-2.5">
          <Bookmark className="w-7 h-7 text-brand-400" />
          <span>Bookmarked Stories</span>
        </h1>
        <p className="text-sm text-slate-400">
          Quickly access the articles you saved to read or reference later.
        </p>
      </div>

      {/* Bookmarks Grid */}
      {bookmarkedBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {bookmarkedBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              showRemoveBookmark={true}
              onRemoveBookmark={handleRemoveBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card max-w-xl mx-auto p-8 border border-slate-900/80 flex flex-col items-center space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-full border border-slate-900">
            <Bookmark className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Your reading list is empty</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Save articles by clicking the bookmark icon on any post details page, and they will appear here.
          </p>
        </div>
      )}
    </main>
  );
}
