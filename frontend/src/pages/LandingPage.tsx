import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronDown,
  Layers,
  Zap,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Card, CardContent } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import type { Course } from '../types/index.js';
import { useSEO } from '../hooks/useSEO.js';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showcaseCourses, setShowcaseCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useSEO({
    title: 'Empower Learning, Accelerate Growth',
    description: 'Empower learning and scale classrooms with LearnSphere online course manager.',
  });

  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const response = await api.get('/courses?limit=3');
        // Show first 3 seeded courses
        setShowcaseCourses(response.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to load showcase courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchShowcase();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15 },
    },
  };

  const faqs = [
    {
      q: 'What makes LearnSphere different from other LMS platforms?',
      a: 'LearnSphere is built from the ground up for speed, visual clarity, and flexibility. We combine powerful course creation tools for instructors with gamified, interactive progress tracking for students—all bundled in a premium, responsive interface supporting both Light and Dark modes.',
    },
    {
      q: 'Can I sell my courses using LearnSphere?',
      a: 'Absolutely! LearnSphere is designed to support custom course monetization, allowing instructors to build and scale classrooms, publish lessons, grade homework, and issue completion certificates.',
    },
    {
      q: 'Do you offer a trial period?',
      a: 'Yes! Students can explore free tier courses on the platform, and instructors can create draft courses and test their curriculum before publishing.',
    },
    {
      q: 'Is there support for video hosting and assessments?',
      a: 'Yes! LearnSphere supports video embed modules (e.g. YouTube, Vimeo), PDF resources, written material sheets, interactive assignments, and fully customizable quizzes with passing thresholds.',
    },
  ];

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: 'Structured Curriculum',
      desc: 'Instructors can easily create lessons, structure curriculum modules, and reorder lectures with one-click shifters.',
    },
    {
      icon: <Zap className="w-6 h-6 text-warning" />,
      title: 'Interactive Assessments',
      desc: 'Create multiple choice quizzes with auto-grading results and set assignments with full grading dashboards.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-success" />,
      title: 'Role-Based Dashboards',
      desc: 'Custom metrics, study streak calendars, and platform analysis charts for Students, Teachers, and Admins.',
    },
  ];

  const companies = ['Vercel', 'Linear', 'Notion', 'Stripe', 'Figma'];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Colorful Ambient Blurs */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[-10%] left-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] sm:blur-[130px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 40, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[5%] right-[10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[80px] sm:blur-[110px]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Badge variant="primary" className="py-1 px-4 gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen SaaS LMS
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight"
        >
          Empower Learning, Accelerate Growth with{' '}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            LearnSphere
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-muted-text max-w-2xl leading-relaxed"
        >
          A premium, high-performance Learning Management System designed to build, manage, and scale online classrooms with breathtaking experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto font-semibold pr-4 pl-5 gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium">
              Explore Features
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 border-y border-border bg-card/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-text font-bold mb-4">TRUSTED BY LEADING TEAMS</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 dark:opacity-40">
            {companies.map((company) => (
              <span key={company} className="text-sm font-extrabold text-foreground tracking-wider">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-card/25 border border-border p-8 rounded-2xl backdrop-blur-sm">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-primary">10k+</p>
            <p className="text-xs text-muted-text mt-1 uppercase tracking-widest font-bold">Active Learners</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-success">500+</p>
            <p className="text-xs text-muted-text mt-1 uppercase tracking-widest font-bold">Premium Courses</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground">99.9%</p>
            <p className="text-xs text-muted-text mt-1 uppercase tracking-widest font-bold">Success Uptime</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-warning">98%</p>
            <p className="text-xs text-muted-text mt-1 uppercase tracking-widest font-bold">Satisfaction Rating</p>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Engineered for Modern Classrooms</h2>
          <p className="text-sm text-muted-text mt-3 max-w-xl mx-auto">Explore features designed to make virtual teaching and study tracking simple and effective.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card hoverable className="h-full flex flex-col justify-between p-6">
                <CardContent className="space-y-4 pt-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center border border-primary/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-text leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Live Course Showcase */}
      <section className="py-16 bg-card/10 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Featured Curriculum</h2>
              <p className="text-xs text-muted-text mt-1.5">Join live classrooms hosted by professional creators.</p>
            </div>
            <Link to="/register">
              <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                Browse catalog <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {coursesLoading ? (
            <div className="h-48 flex items-center justify-center">
              <span className="text-sm text-muted-text animate-pulse">Loading live catalog...</span>
            </div>
          ) : showcaseCourses.length === 0 ? (
            <p className="text-xs text-muted-text text-center py-6">No courses published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {showcaseCourses.map((course) => (
                <Card key={course.id} hoverable className="overflow-hidden flex flex-col justify-between h-full bg-card">
                  <div className="aspect-video bg-muted-bg border-b border-border relative flex items-center justify-center text-muted-text">
                    {course.coverImage ? (
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-10 h-10 text-primary/30" />
                    )}
                    <Badge variant="primary" className="absolute bottom-3 left-3">{course.category}</Badge>
                  </div>
                  <div className="p-5 flex-grow space-y-3">
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">{course.description}</p>
                    <div className="pt-2 flex gap-4 text-[10px] text-muted-text font-semibold uppercase">
                      <span>{course.difficulty.toLowerCase()}</span>
                      <span>•</span>
                      <span>{Math.round(course.duration / 60)} hours</span>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <Link to="/register" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        Enroll and Study
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">What Our Platform Users Say</h2>
          <p className="text-sm text-muted-text mt-3">Trusted by leading teachers and ambitious self-learners alike.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-1 text-warning">
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
              </div>
              <p className="text-xs text-muted-text italic leading-relaxed">
                "LearnSphere transformed the way I deliver software classes. Setting up coding assignments and autograding quizzes takes minutes, and students love the clean layout."
              </p>
              <div className="pt-2">
                <p className="text-xs font-bold text-foreground">Alex Rivera</p>
                <p className="text-[10px] text-muted-text">Full Stack Instructor</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-1 text-warning">
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
              </div>
              <p className="text-xs text-muted-text italic leading-relaxed">
                "The study streak calendar and clean lesson viewer kept me motivated. I completed three full programming courses and secured a junior developer job!"
              </p>
              <div className="pt-2">
                <p className="text-xs font-bold text-foreground">Emily Watson</p>
                <p className="text-[10px] text-muted-text">Student Alumna</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-1 text-warning">
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
                <Award className="w-4 h-4 fill-warning" />
              </div>
              <p className="text-xs text-muted-text italic leading-relaxed">
                "As a platform administrator, I appreciate the simplicity of auditing hosted courses, managing memberships, and monitoring platform trends in real-time."
              </p>
              <div className="pt-2">
                <p className="text-xs font-bold text-foreground">Sarah Jenkins</p>
                <p className="text-[10px] text-muted-text">LearnSphere Admin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 w-full border-t border-border">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border border-border rounded-lg bg-card/45 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-4 pt-1 text-xs text-muted-text leading-relaxed border-t border-border/20">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-card/20 border-t border-border flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-3xl font-extrabold text-foreground">Ready to Transform Your Classroom?</h2>
        <p className="text-sm text-muted-text mt-4 max-w-lg">Join thousands of students and educators learning and sharing professional skills today.</p>
        <Link to="/register" className="mt-8">
          <Button size="lg" className="font-semibold">
            Get Started For Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">LearnSphere</span>
          </div>
          <p className="text-xs text-muted-text">© {new Date().getFullYear()} LearnSphere LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
