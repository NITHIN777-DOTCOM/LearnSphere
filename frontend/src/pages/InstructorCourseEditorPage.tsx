import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Spinner } from '../components/Spinner.js';
import { Modal } from '../components/Modal.js';
import { useToast } from '../components/Toast.js';
import type { Lesson, Quiz, Assignment, LessonType, Difficulty } from '../types/index.js';

export const InstructorCourseEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { toast } = useToast();
  const navigate = useNavigate();

  // General Page States
  const [loading, setLoading] = useState(isEditMode);
  const [activeTab, setActiveTab] = useState<'INFO' | 'CURRICULUM' | 'EVALUATIONS'>('INFO');
  const [savingCourse, setSavingCourse] = useState(false);

  // Course Details Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [difficulty, setDifficulty] = useState<Difficulty>('BEGINNER');
  const [duration, setDuration] = useState(0);
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');

  // Course Sub-Lists (Edit Mode Only)
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Modals & Sub-forms States
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonPdf, setLessonPdf] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonType, setLessonType] = useState<LessonType>('TEXT');
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Evaluations Creation Form States
  const [evalType, setEvalType] = useState<'ASSIGNMENT' | 'QUIZ'>('ASSIGNMENT');
  const [asmTitle, setAsmTitle] = useState('');
  const [asmDesc, setAsmDesc] = useState('');
  const [asmDueDate, setAsmDueDate] = useState('');

  const [quizTitle, setQuizTitle] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState(60);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [qText, setQText] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrectIndex, setQCorrectIndex] = useState(0);

  const [submittingEval, setSubmittingEval] = useState(false);

  const fetchCourseData = async () => {
    if (!isEditMode) return;
    try {
      const res = await api.get(`/courses/${id}`);
      const course = res.data;
      setTitle(course.title);
      setDescription(course.description);
      setCategory(course.category);
      setDifficulty(course.difficulty);
      setDuration(course.duration);
      setCoverImage(course.coverImage || '');
      setTags(course.tags || []);
      setLearningOutcomes(course.learningOutcomes || []);
      setLessons(course.lessons || []);
      setAssignments(course.assignments || []);
      setQuizzes(course.quizzes || []);
    } catch (error) {
      toast.error('Failed to load course details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // Tags & Outcomes Helpers
  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, idx) => idx !== index));
  };

  const addOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (outcomeInput.trim() && !learningOutcomes.includes(outcomeInput.trim())) {
      setLearningOutcomes([...learningOutcomes, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const removeOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, idx) => idx !== index));
  };

  // Submit main course details
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    const coursePayload = {
      title,
      description,
      category,
      difficulty,
      duration,
      coverImage: coverImage || undefined,
      tags,
      learningOutcomes,
    };
    try {
      if (isEditMode) {
        await api.put(`/courses/${id}`, coursePayload);
        toast.success('Course details updated successfully!');
      } else {
        const res = await api.post('/courses', coursePayload);
        toast.success('Course created successfully!');
        navigate(`/dashboard/courses/${res.data.id}/edit`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    } finally {
      setSavingCourse(false);
    }
  };

  // Lessons management handlers
  const handleOpenLessonModal = (lesson: Lesson | null = null) => {
    setEditingLesson(lesson);
    if (lesson) {
      setLessonTitle(lesson.title);
      setLessonDesc(lesson.description || '');
      setLessonContent(lesson.content || '');
      setLessonVideo(lesson.videoUrl || '');
      setLessonPdf(lesson.pdfUrl || '');
      setLessonDuration(lesson.duration);
      setLessonType(lesson.type);
    } else {
      setLessonTitle('');
      setLessonDesc('');
      setLessonContent('');
      setLessonVideo('');
      setLessonPdf('');
      setLessonDuration(10);
      setLessonType('TEXT');
    }
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLesson(true);
    const lessonPayload = {
      title: lessonTitle,
      description: lessonDesc,
      content: lessonType === 'TEXT' ? lessonContent : undefined,
      videoUrl: lessonType === 'VIDEO' ? lessonVideo : undefined,
      pdfUrl: lessonType === 'PDF' ? lessonPdf : undefined,
      duration: Number(lessonDuration),
      type: lessonType,
    };
    try {
      if (editingLesson) {
        await api.put(`/lessons/${editingLesson.id}`, lessonPayload);
        toast.success('Lesson updated!');
      } else {
        await api.post(`/lessons/courses/${id}/lessons`, lessonPayload);
        toast.success('Lesson added to curriculum!');
      }
      setLessonModalOpen(false);
      fetchCourseData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson from curriculum?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success('Lesson deleted');
      fetchCourseData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleReorderLesson = async (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...lessons];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap order property
    const tempOrder = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = tempOrder;

    try {
      await api.post(`/lessons/courses/${id}/lessons/reorder`, {
        lessons: list.map((l) => ({ id: l.id, order: l.order })),
      });
      fetchCourseData();
    } catch (error) {
      toast.error('Failed to save new order');
    }
  };

  // Evaluations managers
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !qOpt1.trim() || !qOpt2.trim()) {
      toast.warning('Enter question details and at least two options.');
      return;
    }
    const opts = [qOpt1.trim(), qOpt2.trim()];
    if (qOpt3.trim()) opts.push(qOpt3.trim());
    if (qOpt4.trim()) opts.push(qOpt4.trim());

    const questionObj = {
      questionText: qText.trim(),
      options: opts,
      correctAnswerIndex: Number(qCorrectIndex),
    };

    setQuizQuestions([...quizQuestions, questionObj]);
    setQText('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setQCorrectIndex(0);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEval(true);
    try {
      if (evalType === 'ASSIGNMENT') {
        if (!asmTitle.trim() || !asmDesc.trim() || !asmDueDate) {
          toast.warning('Please enter all assignment details.');
          setSubmittingEval(false);
          return;
        }
        await api.post(`/assignments/courses/${id}/assignments`, {
          title: asmTitle,
          description: asmDesc,
          dueDate: new Date(asmDueDate).toISOString(),
        });
        toast.success('Assignment created successfully!');
        setAsmTitle('');
        setAsmDesc('');
        setAsmDueDate('');
      } else {
        if (!quizTitle.trim() || quizQuestions.length === 0) {
          toast.warning('Enter quiz title and at least one question.');
          setSubmittingEval(false);
          return;
        }
        await api.post(`/quizzes/courses/${id}/quizzes`, {
          title: quizTitle,
          passingScore: Number(quizPassingScore),
          questions: quizQuestions,
        });
        toast.success('Quiz created successfully!');
        setQuizTitle('');
        setQuizPassingScore(60);
        setQuizQuestions([]);
      }
      fetchCourseData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save evaluation task');
    } finally {
      setSubmittingEval(false);
    }
  };

  if (loading) {
    return <Spinner fullPage size="lg" />;
  }

  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Photography', 'General'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {isEditMode ? `Course Editor Workspace` : `New Course Creator`}
          </h2>
          <p className="text-xs text-muted-text mt-0.5">
            {isEditMode ? `Expand curriculum modules, assessments, and update parameters` : `Define meta information to host a new course`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      {isEditMode && (
        <div className="flex gap-2.5 border-b border-border/20 pb-3">
          <button
            onClick={() => setActiveTab('INFO')}
            className={`px-4 py-2 text-xs font-semibold rounded cursor-pointer transition-colors ${
              activeTab === 'INFO' ? 'bg-primary text-primary-foreground' : 'bg-muted-bg text-muted-text hover:text-foreground'
            }`}
          >
            Course Details
          </button>
          <button
            onClick={() => setActiveTab('CURRICULUM')}
            className={`px-4 py-2 text-xs font-semibold rounded cursor-pointer transition-colors ${
              activeTab === 'CURRICULUM' ? 'bg-primary text-primary-foreground' : 'bg-muted-bg text-muted-text hover:text-foreground'
            }`}
          >
            Curriculum (Lessons)
          </button>
          <button
            onClick={() => setActiveTab('EVALUATIONS')}
            className={`px-4 py-2 text-xs font-semibold rounded cursor-pointer transition-colors ${
              activeTab === 'EVALUATIONS' ? 'bg-primary text-primary-foreground' : 'bg-muted-bg text-muted-text hover:text-foreground'
            }`}
          >
            Tasks & Quizzes
          </button>
        </div>
      )}

      {/* RENDER INFO TAB */}
      {activeTab === 'INFO' && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <Input label="Course Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <div>
                    <label className="text-sm font-medium text-foreground/80 block mb-1.5">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a descriptive summary of this course curriculum..."
                      className="w-full bg-sidebar border border-border text-foreground text-sm rounded-md p-3 min-h-[120px] placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 block mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 block mb-1.5">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                      className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <Input label="Cover Image URL (Optional)" id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
                </div>
              </div>

              {/* Tags & outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                {/* Outcomes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80 block">Learning Outcomes</label>
                  <div className="flex gap-2">
                    <Input placeholder="Build full-stack APIs..." id="outcome" value={outcomeInput} onChange={(e) => setOutcomeInput(e.target.value)} />
                    <Button variant="outline" size="sm" onClick={addOutcome} className="cursor-pointer">Add</Button>
                  </div>
                  <div className="space-y-1.5">
                    {learningOutcomes.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted-bg text-xs border border-border">
                        <span>{item}</span>
                        <button type="button" onClick={() => removeOutcome(idx)} className="text-danger hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/80 block">Tags</label>
                  <div className="flex gap-2">
                    <Input placeholder="react, node..." id="tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                    <Button variant="outline" size="sm" onClick={addTag} className="cursor-pointer">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag, idx) => (
                      <Badge key={idx} variant="info" className="gap-2.5 py-1 px-3">
                        {tag}
                        <button type="button" onClick={() => removeTag(idx)} className="text-danger hover:text-foreground font-bold cursor-pointer">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40 flex justify-end">
                <Button type="submit" variant="primary" isLoading={savingCourse}>
                  {isEditMode ? 'Update Course Details' : 'Create Course & Proceed'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* RENDER CURRICULUM TAB */}
      {activeTab === 'CURRICULUM' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-foreground">Course Curriculum Modules</h3>
            <Button variant="primary" size="sm" onClick={() => handleOpenLessonModal(null)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Lesson Module
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {lessons.length === 0 ? (
                <p className="text-xs text-muted-text text-center p-8">No lessons in this course curriculum. Add one to get started.</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted-bg/10 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-text">{idx + 1}.</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                          <span className="text-[10px] text-muted-text font-medium uppercase">
                            {lesson.type} • {lesson.duration} minutes
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleReorderLesson(idx, 'UP')}
                            disabled={idx === 0}
                            className="p-0.5 text-muted-text hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderLesson(idx, 'DOWN')}
                            disabled={idx === lessons.length - 1}
                            className="p-0.5 text-muted-text hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Edit / Delete */}
                        <button
                          onClick={() => handleOpenLessonModal(lesson)}
                          className="p-2 text-muted-text hover:text-foreground bg-muted-bg rounded cursor-pointer transition-colors"
                          title="Edit lesson details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded cursor-pointer transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lesson Editor Modal */}
          <Modal
            isOpen={lessonModalOpen}
            onClose={() => setLessonModalOpen(false)}
            title={editingLesson ? 'Edit Lesson Module' : 'Create New Lesson Module'}
            footer={
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setLessonModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSaveLesson} isLoading={submittingLesson}>
                  {editingLesson ? 'Save Changes' : 'Add Lesson'}
                </Button>
              </div>
            }
          >
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <Input label="Lesson Title" id="lesTitle" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required />
              <Input label="Short Description" id="lesDesc" value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 block mb-1.5">Module Type</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value as LessonType)}
                    className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    <option value="TEXT">Text Material</option>
                    <option value="VIDEO">Video Embed</option>
                    <option value="PDF">PDF Document</option>
                  </select>
                </div>
                <Input label="Estimated Study Time (minutes)" id="lesDur" type="number" value={lessonDuration} onChange={(e) => setLessonDuration(Number(e.target.value))} required />
              </div>

              {lessonType === 'TEXT' && (
                <div>
                  <label className="text-sm font-medium text-foreground/80 block mb-1.5">Written Content (HTML/Markdown support)</label>
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Enter course material content text..."
                    className="w-full bg-sidebar border border-border text-foreground text-sm rounded-md p-3 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {lessonType === 'VIDEO' && (
                <Input label="Video Embed URL (e.g. YouTube/Vimeo embed links)" id="lesVideo" placeholder="https://www.youtube.com/embed/..." value={lessonVideo} onChange={(e) => setLessonVideo(e.target.value)} required />
              )}

              {lessonType === 'PDF' && (
                <Input label="PDF File URL" id="lesPdf" placeholder="https://domain.com/resource.pdf" value={lessonPdf} onChange={(e) => setLessonPdf(e.target.value)} required />
              )}
            </form>
          </Modal>
        </div>
      )}

      {/* RENDER EVALUATIONS TAB */}
      {activeTab === 'EVALUATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creator panel */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-foreground">Create Evaluations Task</h3>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSaveEvaluation} className="space-y-6">
                  {/* Select task type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Evaluation Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEvalType('ASSIGNMENT')}
                        className={`p-3 border rounded-md text-xs font-semibold text-center transition-all ${
                          evalType === 'ASSIGNMENT' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-text hover:text-foreground'
                        }`}
                      >
                        Assignment Task
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvalType('QUIZ')}
                        className={`p-3 border rounded-md text-xs font-semibold text-center transition-all ${
                          evalType === 'QUIZ' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-text hover:text-foreground'
                        }`}
                      >
                        Multiple Choice Quiz
                      </button>
                    </div>
                  </div>

                  {evalType === 'ASSIGNMENT' ? (
                    <div className="space-y-4">
                      <Input label="Assignment Title" id="asmTitle" value={asmTitle} onChange={(e) => setAsmTitle(e.target.value)} />
                      <div>
                        <label className="text-sm font-medium text-foreground/80 block mb-1.5">Instructions</label>
                        <textarea
                          value={asmDesc}
                          onChange={(e) => setAsmDesc(e.target.value)}
                          placeholder="State instructions and deliverables for the students..."
                          className="w-full bg-sidebar border border-border text-foreground text-sm rounded-md p-3 min-h-[100px]"
                        />
                      </div>
                      <Input label="Due Date" id="asmDueDate" type="date" value={asmDueDate} onChange={(e) => setAsmDueDate(e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <Input label="Quiz Title" id="qTitle" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
                        </div>
                        <Input label="Passing Score %" id="qScore" type="number" value={quizPassingScore} onChange={(e) => setQuizPassingScore(Number(e.target.value))} />
                      </div>

                      {/* Question Composer */}
                      <div className="p-4 rounded-md border border-border/60 bg-muted-bg/15 space-y-4">
                        <p className="text-xs uppercase tracking-wider font-bold text-foreground">Add Question</p>
                        <Input label="Question text" id="qText" value={qText} onChange={(e) => setQText(e.target.value)} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input label="Option A" id="qO1" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} />
                          <Input label="Option B" id="qO2" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} />
                          <Input label="Option C (Optional)" id="qO3" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} />
                          <Input label="Option D (Optional)" id="qO4" value={qOpt4} onChange={(e) => setQOpt4(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground/80 block mb-1.5">Correct Answer</label>
                          <select
                            value={qCorrectIndex}
                            onChange={(e) => setQCorrectIndex(Number(e.target.value))}
                            className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                            Insert Question
                          </Button>
                        </div>
                      </div>

                      {/* Questions List */}
                      {quizQuestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-foreground">Questions List ({quizQuestions.length})</p>
                          <div className="space-y-1.5">
                            {quizQuestions.map((q, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted-bg text-xs border border-border">
                                <span className="truncate max-w-[80%]">{idx + 1}. {q.questionText}</span>
                                <button type="button" onClick={() => setQuizQuestions(quizQuestions.filter((_, qI) => qI !== idx))} className="text-danger">Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-6 border-t border-border/40 flex justify-end">
                    <Button type="submit" variant="success" isLoading={submittingEval}>
                      Save Evaluation Task
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Existing list */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-foreground">Evaluations Queue</h3>
            
            {/* Assignments */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-text">Assignments</p>
              {assignments.length === 0 ? (
                <p className="text-xs text-muted-text italic">No assignments.</p>
              ) : (
                assignments.map((asm) => (
                  <div key={asm.id} className="p-3 border border-border rounded-md bg-sidebar flex justify-between items-center">
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-foreground truncate">{asm.title}</p>
                      <span className="text-[10px] text-muted-text">Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quizzes */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-text">Quizzes</p>
              {quizzes.length === 0 ? (
                <p className="text-xs text-muted-text italic">No quizzes.</p>
              ) : (
                quizzes.map((q) => (
                  <div key={q.id} className="p-3 border border-border rounded-md bg-sidebar flex justify-between items-center">
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-foreground truncate">{q.title}</p>
                      <span className="text-[10px] text-muted-text">Pass Score: {q.passingScore}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
