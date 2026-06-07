import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '../api';
import BlogCard from '../components/BlogCard';
import { Sparkles, ArrowRight, BookOpen, Heart, MessageSquare, TrendingUp, Edit3, Users } from 'lucide-react';

export default function Home() {
  const cardRef = useRef(null);

  // Fetch blogs from server
  const { data, isSuccess } = useQuery({
    queryKey: ['blogs'],
    queryFn: getBlogs,
    retry: 1,
  });

  const realBlogs = data?.blogs || [];
  const hasRealBlogs = isSuccess && realBlogs.length > 0;
  
  // Get top 3 latest blogs from server if available
  const latestRealBlogs = hasRealBlogs ? realBlogs.slice(0, 3) : [];

  // Setup Scroll Reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [hasRealBlogs, isSuccess]);

  // Interactive 3D Parallax Mouse Move Handler
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Map positions to degree angles (max 12 deg tilt)
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 80%)`;
    }
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.1s ease-out';
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.background = 'transparent';
    }
  };

  const trendingBlogs = [
    {
      _id: 'mock-1',
      coverImageURL: '/blog_minimalist.png',
      category: 'LIFESTYLE',
      title: 'The Art of Slow Living in a Fast-Paced World',
      body: 'Discover simple daily practices to cultivate mindfulness, reduce screen time, and find peace in the everyday chaos.',
      createdBy: {
        fullName: 'Sarah Jenkins',
        profileImageURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
      createdAt: '2026-06-08T00:00:00.000Z',
      readTime: '5 min read',
      likes: 342,
      comments: 28,
    },
    {
      _id: 'mock-2',
      coverImageURL: '/blog_creativity.png',
      category: 'ART & DESIGN',
      title: 'Unlocking Creative Flow: Techniques from the Masters',
      body: 'Explore how top artists and designers break through cognitive blocks to establish continuous, effortless creative expression.',
      createdBy: {
        fullName: 'Marcus Thorne',
        profileImageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      createdAt: '2026-06-07T00:00:00.000Z',
      readTime: '8 min read',
      likes: 289,
      comments: 14,
    },
    {
      _id: 'mock-3',
      coverImageURL: '/blog_tech.png',
      category: 'TECHNOLOGY',
      title: 'Navigating the Next Wave of Decentralized Networks',
      body: 'An in-depth look at how edge computing and decentralized database architectures are redefining web performance.',
      createdBy: {
        fullName: 'Elena Rostova',
        profileImageURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      },
      createdAt: '2026-06-06T00:00:00.000Z',
      readTime: '6 min read',
      likes: 512,
      comments: 42,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Decorative Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-96 h-96 rounded-full bg-brand-600/10 blur-[130px] animate-float-slow" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] animate-float-reverse" />
      </div>

      {/* Hero Container */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6 text-left animate-slide-up">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Home for Minds and Stories</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Write your story. <br />
            Share it with the{' '}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              world.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            BlogBubble is the modern space for your thoughts, tutorials, and inspirations. Join thousands of creators publishing their best ideas in a clean, distraction-free environment.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Link
              to="/blogs"
              className="glass-button px-8 py-3.5 text-base flex items-center justify-center space-x-2 group hover:scale-[1.02] cursor-pointer animate-pulse-slow"
            >
              <span>Start Reading</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 text-base font-semibold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg transition-all duration-200 hover:scale-[1.02] text-center"
            >
              Join the Community
            </Link>
          </div>
        </div>

        {/* Hero Right Visual with 3D Tilt & Glow Parallax */}
        <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end animate-fade-in animation-delay-200">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative group max-w-sm sm:max-w-md w-full aspect-square rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/30 p-2 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out cursor-pointer"
            style={{ transformStyle: 'preserve-3d', transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)' }}
          >
            {/* 3D Radial Glow overlay */}
            <div className="card-glow absolute inset-0 pointer-events-none transition-all duration-200 rounded-2xl" />

            <img
              src="/landing_hero.png"
              alt="Creative abstract graphic"
              className="w-full h-full object-cover rounded-xl shadow-inner shadow-brand-500/10 transition-transform duration-500 select-none pointer-events-none"
              style={{ transform: 'translateZ(20px)' }}
            />
          </div>
        </div>
      </section>

      {/* Featured / Trending Blogs Section (Scroll Reveal) */}
      <section className="reveal relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center space-x-1.5 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{hasRealBlogs ? 'Latest Publications' : 'Trending Today'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {hasRealBlogs ? 'Featured from our Creators' : 'Must-Read Publications'}
            </h2>
          </div>
          <Link
            to="/blogs"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1 group"
          >
            <span>View all articles</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hasRealBlogs ? (
            latestRealBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))
          ) : (
            trendingBlogs.map((blog) => (
              <div
                key={blog._id}
                className="glass-card flex flex-col justify-between overflow-hidden group border border-slate-900/80 bg-slate-900/10 hover:bg-slate-900/20 hover:border-slate-800/80 transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Cover Photo */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={blog.coverImageURL}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-slate-950/80 border border-slate-800/40 text-[10px] font-bold text-brand-400 rounded-md tracking-wider">
                    {blog.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-brand-400 transition-colors duration-200">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {blog.body}
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={blog.createdBy.profileImageURL}
                        alt={blog.createdBy.fullName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-800"
                      />
                      <div className="text-left">
                        <div className="text-xs font-semibold text-slate-300">{blog.createdBy.fullName}</div>
                        <div className="text-[10px] text-slate-500">Recent</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span className="flex items-center text-[10px] font-medium space-x-1">
                        <Heart className="w-3.5 h-3.5 text-slate-500" />
                        <span>{blog.likes}</span>
                      </span>
                      <span className="flex items-center text-[10px] font-medium space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>{blog.comments}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Creator Value Proposition Section (Scroll Reveal) */}
      <section className="reveal relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Edit3,
            title: 'Distraction-Free Editor',
            desc: 'Write in a clean space designed to keep your flow continuous and focus sharp.',
          },
          {
            icon: BookOpen,
            title: 'Beautiful Reading Layouts',
            desc: 'A gorgeous typography and styling layout makes consuming information a pleasant experience.',
          },
          {
            icon: Users,
            title: 'Build Your Audience',
            desc: 'Share links, compile bookmark collections, and engage directly with readers.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="text-left space-y-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-brand-600/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
