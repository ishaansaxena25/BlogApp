import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Edit3, MessageSquare, Search, Users } from 'lucide-react';
import { getBlogs } from '../api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/skeletons';

const features = [
  [Edit3, 'A focused editor', 'Create rich stories with structured blocks, inline images, drafts, and automatic reading metadata.'],
  [Search, 'Easy discovery', 'Find useful writing by keyword or tag without losing the clean reading experience.'],
  [MessageSquare, 'Real conversation', 'Like articles and discuss ideas through replies that stay readable and intentional.'],
  [Users, 'A public identity', 'Build a profile around your work and connect readers to the rest of your online presence.'],
];

const testimonials = [
  ['The editor gets out of the way and lets me think.', 'Aarav, developer'],
  ['I can publish technical notes without turning the page into a dashboard.', 'Maya, designer'],
  ['Drafts and rich embeds make this feel like a serious writing home.', 'Noah, student'],
];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const { data, isLoading } = useQuery({
    queryKey: ['blogs', 'home'],
    queryFn: () => getBlogs(),
  });
  const blogs = data?.blogs || [];
  const featured = blogs.slice(0, 3);
  const reads = blogs.reduce((total, blog) => total + (blog.views || 0), 0);
  const writers = new Set(blogs.map((blog) => blog.createdBy?._id).filter(Boolean)).size;
  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.35 } };

  return (
    <div className="space-y-24 pb-12">
      <motion.section {...reveal} className="mx-auto grid max-w-7xl gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-400">Ideas deserve room to breathe</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Write clearly. Publish beautifully. Find your readers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            BlogBubble is a focused home for thoughtful stories, practical tutorials, and the conversations they start.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/blogs/new" className="glass-button inline-flex items-center gap-2">Start writing <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/blogs" className="rounded-lg border border-slate-700 px-5 py-2.5 font-semibold text-slate-200 hover:bg-slate-900">Browse blogs</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
          <img src="/landing_hero.png" alt="A calm creative workspace" className="aspect-square w-full rounded-xl object-cover" />
        </div>
      </motion.section>

      <motion.section {...reveal} className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-400">Latest publications</p>
            <h2 className="mt-2 text-3xl font-extrabold">Fresh ideas from the community</h2>
          </div>
          <Link to="/blogs" className="text-sm font-semibold text-brand-400">View all</Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => <BlogCardSkeleton key={index} />)
            : featured.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
        {!isLoading && featured.length === 0 && <p className="text-slate-500">The first story is waiting to be written.</p>}
      </motion.section>

      <motion.section {...reveal} className="mx-auto max-w-7xl">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, description]) => (
            <article key={title} className="bg-slate-950 p-7">
              <Icon className="w-6 h-6 text-brand-400" />
              <h3 className="mt-5 font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} className="mx-auto grid max-w-5xl grid-cols-3 gap-6 text-center">
        {[
          [blogs.length, 'Published stories'],
          [writers, 'Active writers'],
          [reads, 'Article reads'],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-4xl font-extrabold text-white">{value.toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </motion.section>

      <motion.section {...reveal} className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-extrabold">Made for people who care about the words</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map(([quote, author]) => (
            <blockquote key={author} className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
              <p className="leading-7 text-slate-200">“{quote}”</p>
              <footer className="mt-4 text-sm text-slate-500">{author}</footer>
            </blockquote>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} className="mx-auto max-w-5xl rounded-2xl border border-brand-500/20 bg-brand-600/10 p-10 text-center">
        <BookOpen className="mx-auto w-8 h-8 text-brand-400" />
        <h2 className="mt-4 text-3xl font-extrabold">Join BlogBubble today</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">Publish your first story, save a draft, or simply discover an idea worth keeping.</p>
        <Link to="/register" className="glass-button mt-6 inline-block">Create your account</Link>
      </motion.section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-slate-900 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} BlogBubble</span>
        <div className="flex gap-5">
          <Link to="/blogs">Blogs</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
}
