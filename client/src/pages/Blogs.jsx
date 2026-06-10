import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '../api';
import BlogCard from '../components/BlogCard';
import { Search, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function Blogs() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch blogs query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogs,
  });

  const blogs = data?.blogs || [];

  // Filtered blogs based on search query
  const filteredBlogs = blogs.filter((blog) => {
    const query = searchQuery.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(query) ||
      blog.excerpt?.toLowerCase().includes(query) ||
      blog.createdBy?.fullName?.toLowerCase().includes(query)
    );
  });

  // Skeletal loader for cards
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-card animate-pulse overflow-hidden h-[400px] flex flex-col justify-between">
          <div className="bg-slate-900 aspect-video w-full" />
          <div className="p-5 flex-1 space-y-4">
            <div className="h-4 bg-slate-900 rounded w-1/4" />
            <div className="h-6 bg-slate-900 rounded w-3/4" />
            <div className="h-4 bg-slate-900 rounded w-full" />
            <div className="h-4 bg-slate-900 rounded w-5/6" />
          </div>
          <div className="p-5 border-t border-slate-900 flex justify-between items-center">
            <div className="h-6 bg-slate-900 rounded-full w-24" />
            <div className="h-4 bg-slate-900 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto py-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-600/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore the latest thoughts</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans leading-none">
          Explore a Universe of{' '}
          <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            Ideas
          </span>
        </h1>
        <p className="text-base text-slate-400">
          Discover stories, knowledge, and diverse perspectives from creators around the globe.
        </p>
      </section>

      {/* Search and Filters Section */}
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, content, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/30 border border-slate-900 text-slate-205 rounded-xl focus:outline-none focus:border-brand-505 focus:ring-1 focus:ring-brand-505 transition-all text-sm placeholder:text-slate-500"
          />
        </div>
      </section>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-8 bg-red-950/20 border border-red-900/40 rounded-2xl max-w-xl mx-auto text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h3 className="text-lg font-bold text-white">Failed to load posts</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error.message || 'We had trouble reaching the server. Please check your connection.'}
          </p>
          <button
            onClick={() => refetch()}
            className="glass-button px-5 py-2 text-sm cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && renderSkeletons()}

      {/* Blog Cards Grid */}
      {!isLoading && !isError && (
        <>
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
               ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card max-w-xl mx-auto p-8 border border-slate-900/80 flex flex-col items-center space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-full border border-slate-900">
                <BookOpen className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No articles found</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {searchQuery
                  ? "We couldn't find any posts matching your search query. Try typing something else."
                  : 'Get started by creating the very first blog post on BlogBubble!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 cursor-pointer"
                >
                  Clear search query
                </button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
