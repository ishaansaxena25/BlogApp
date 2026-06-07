import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, getProfile } from '../api';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export default function CommentSection({ blogId, comments = [] }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [commentError, setCommentError] = useState(null);

  // Check auth status
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = userData?.user;

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: (newComment) => addComment(blogId, newComment),
    onSuccess: () => {
      setContent('');
      setCommentError(null);
      // Invalidate the single blog details query to reload the comment list
      queryClient.invalidateQueries({ queryKey: ['blog', blogId] });
    },
    onError: (err) => {
      setCommentError(err.errors?.[0]?.msg || err.error || err.message || 'Failed to add comment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    commentMutation.mutate({ content });
  };

  // Helper to resolve avatar image path
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-slate-900">
      <div className="flex items-center space-x-2.5 text-lg font-bold text-white">
        <MessageSquare className="w-5 h-5 text-brand-400" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-3 items-start">
            <img
              src={getAvatarUrl(currentUser.profileImageURL)}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-full object-cover border border-slate-800 mt-1"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                disabled={commentMutation.isPending}
                className="w-full glass-input text-sm resize-none"
              />
              {commentError && (
                <p className="mt-1 text-xs text-red-400 font-medium">{commentError}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={commentMutation.isPending || !content.trim()}
              className="glass-button flex items-center space-x-1.5 px-4 py-2 text-sm cursor-pointer"
            >
              {commentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg text-center text-slate-400 text-sm">
          Please{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            log in
          </Link>{' '}
          to join the conversation and bookmark posts.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex space-x-3 p-4 bg-slate-900/20 border border-slate-900 rounded-lg"
            >
              <img
                src={getAvatarUrl(comment.UserId?.profileImageURL)}
                alt={comment.UserId?.fullName || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-800 mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    {comment.UserId?.fullName || 'Anonymous'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(comment.createdAt || comment._id)}
                  </span>
                </div>
                <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm italic text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </section>
  );
}
