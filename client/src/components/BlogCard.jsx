import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, BookmarkX } from 'lucide-react';

export default function BlogCard({ blog, showRemoveBookmark = false, onRemoveBookmark = null }) {
  const { _id, slug, title, content, excerpt, tags = [], readingTime, createdBy, coverImageURL, createdAt } = blog;
  const blogUrl = `/blogs/${slug || _id}`;

  // Resolve cover image path
  const getCoverImageUrl = (path) => {
    if (!path) {
      // High-quality generic fallback image
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    }
    if (path.startsWith('http')) return path;
    const server = import.meta.env.VITE_API_URL || '';
    return `${server}${path}`;
  };

  // Resolve author avatar path
  const getAvatarUrl = (path) => {
    const server = import.meta.env.VITE_API_URL || '';
    if (!path) return `${server}/default.png`;
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };

  // Excerpt generation
  const getExcerpt = () => {
    if (excerpt) return excerpt;
    const text = content?.blocks?.find((block) => block.type === 'paragraph')?.data?.text || '';
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > 100 ? `${cleanText.slice(0, 100)}...` : cleanText;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <article className="glass-card hover:border-slate-700/80 hover:shadow-brand-500/5 hover:-translate-y-1 group relative flex flex-col h-full overflow-hidden">
      {/* Cover Image */}
      <Link to={blogUrl} className="block overflow-hidden aspect-video relative">
        <img
          src={getCoverImageUrl(coverImageURL)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
      </Link>

      {/* Card Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="flex-1">
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(createdAt)}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
            <Link to={blogUrl}>{title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            {getExcerpt()}
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] text-brand-300">#{tag}</span>
            ))}
            {readingTime && <span className="text-[11px] text-slate-500">{readingTime} min read</span>}
          </div>
        </div>

        {/* Footer info (Author & actions) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-auto">
          <div className="flex items-center space-x-2">
            <img
              src={getAvatarUrl(createdBy?.profileImageURL)}
              alt={createdBy?.fullName || 'Author'}
              className="w-6 h-6 rounded-full object-cover border border-slate-800"
            />
            <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
              {createdBy?.fullName || 'Anonymous'}
            </span>
          </div>

          {/* Conditional Remove Bookmark Action */}
          {showRemoveBookmark && onRemoveBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveBookmark(_id);
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer"
              title="Remove Bookmark"
            >
              <BookmarkX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
