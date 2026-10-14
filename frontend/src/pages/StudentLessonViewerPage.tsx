import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Award, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Spinner } from '../components/Spinner.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { useToast } from '../components/Toast.js';
import type { Course, Lesson, Assignment, Quiz, QuizAttempt, AssignmentSubmission } from '../types/index.js';

interface StudentCourseViewerData extends Course {
  progressPercentage?: number;
  quizAttempts?: QuizAttempt[];
  submissions?: AssignmentSubmission[];
}

export const StudentLessonViewerPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<StudentCourseViewerData | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  // Selection States
  const [activeItem, setActiveItem] = useState<{ type: 'LESSON' | 'QUIZ' | 'ASSIGNMENT'; id: string } | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  // Interaction States
  const [assignmentText, setAssignmentText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<any>(null);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizAttemptResult, setQuizAttemptResult] = useState<any>(null);

  const fetchData = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
      setLessons(response.data.lessons || []);
      setAssignments(response.data.assignments || []);
      setQuizzes(response.data.quizzes || []);
      setCompletedLessons(response.data.completedLessons || []);

      // If no item is selected, pick the first lesson
      if (!activeItem && response.data.lessons?.length > 0) {
        selectItem('LESSON', response.data.lessons[0].id, response.data.lessons);
      }
    } catch (error) {
      console.error('Failed to load study room:', error);
      toast.error('Failed to load course contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const selectItem = async (type: 'LESSON' | 'QUIZ' | 'ASSIGNMENT', itemId: string, lessonsList = lessons) => {
    setActiveItem({ type, id: itemId });
    
    // Reset interaction states
    setAssignmentText('');
    setSubmissionStatus(null);
    setQuizAnswers({});
    setQuizAttemptResult(null);

    if (type === 'LESSON') {
      const found = lessonsList.find((l) => l.id === itemId);
      setActiveLesson(found || null);
      setActiveQuiz(null);
      setActiveAssignment(null);
    } else if (type === 'QUIZ') {
      setActiveLesson(null);
      setActiveAssignment(null);
      try {
        const res = await api.get(`/quizzes/${itemId}`);
        setActiveQuiz(res.data);
        
        // Find existing score
        if (course) {
          const attempt = course.quizAttempts?.find((a) => a.quizId === itemId);
          if (attempt) {
            setQuizAttemptResult(attempt);
          }
        }
      } catch (error) {
        toast.error('Failed to load quiz questions');
      }
    } else if (type === 'ASSIGNMENT') {
      setActiveLesson(null);
      setActiveQuiz(null);
      const found = assignments.find((a) => a.id === itemId);
      setActiveAssignment(found || null);

      // Check existing submission
      if (course) {
        const sub = course.submissions?.find((s) => s.assignmentId === itemId);
        if (sub) {
          setSubmissionStatus(sub);
        }
      }
    }
  };

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    try {
      const response = await api.post(`/lessons/${activeLesson.id}/complete`);
      const { completed } = response.data;
      if (completed) {
        setCompletedLessons((prev) => [...prev, activeLesson.id]);
      } else {
        setCompletedLessons((prev) => prev.filter((id) => id !== activeLesson.id));
      }
      toast.success(response.data.message);
      // Reload course metrics
      const courseDetails = await api.get(`/courses/${courseId}`);
      setCourse(courseDetails.data);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handlePrevLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex > 0) {
      selectItem('LESSON', lessons[currentIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < lessons.length - 1) {
      selectItem('LESSON', lessons[currentIndex + 1].id);
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !assignmentText.trim()) return;
    setSubmittingAssignment(true);
    try {
      const res = await api.post(`/assignments/${activeAssignment.id}/submit`, {
        content: assignmentText,
      });
      toast.success('Assignment submitted successfully!');
      setSubmissionStatus(res.data.submission);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  // Submit Quiz Attempt
  const handleQuizAnswerSelect = (qIdx: number, oIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    const questionsCount = activeQuiz.questions.length;
    const answersArray: number[] = [];
    
    for (let i = 0; i < questionsCount; i++) {
      if (quizAnswers[i] === undefined) {
        toast.warning('Please answer all questions before submitting.');
        return;
      }
      answersArray.push(quizAnswers[i]);
    }

    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/quizzes/${activeQuiz.id}/attempt`, {
        answers: answersArray,
      });
      toast.success('Quiz graded!');
      setQuizAttemptResult(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grade quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return <Spinner fullPage size="lg" />;
  }

  if (!course) {
    return (
      <div className="p-12 text-center text-muted-text">
        Course not found.
      </div>
    );
  }

  const currentLessonIndex = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : -1;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 overflow-hidden">
      {/* Left Sidebar - Curriculum Tree */}
      <aside className="w-full md:w-80 bg-sidebar border border-border rounded-lg overflow-y-auto p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div>
            <Link to={`/dashboard/courses/${course.id}`} className="text-xs text-primary hover:underline flex items-center gap-1.5 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </Link>
            <h2 className="text-base font-bold text-foreground line-clamp-1">{course.title}</h2>
            <p className="text-[10px] text-muted-text mt-0.5">Overall Progress: {course.progressPercentage || 0}%</p>
          </div>

          {/* Lessons list */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-text">Lessons</p>
            <div className="space-y-1">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isActive = activeItem?.type === 'LESSON' && activeItem.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => selectItem('LESSON', lesson.id)}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded text-xs transition-all ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-text hover:bg-muted-bg/50 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isCompleted ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Circle className="w-3.5 h-3.5" />}
                      <span className="truncate">{idx + 1}. {lesson.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quizzes list */}
          {quizzes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-text">Quizzes</p>
              <div className="space-y-1">
                {quizzes.map((quiz) => {
                  const isActive = activeItem?.type === 'QUIZ' && activeItem.id === quiz.id;
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => selectItem('QUIZ', quiz.id)}
                      className={`w-full flex items-center gap-2 text-left p-2.5 rounded text-xs transition-all ${
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-text hover:bg-muted-bg/50 hover:text-foreground'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span className="truncate">{quiz.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignments list */}
          {assignments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-text">Assignments</p>
              <div className="space-y-1">
                {assignments.map((asm) => {
                  const isActive = activeItem?.type === 'ASSIGNMENT' && activeItem.id === asm.id;
                  return (
                    <button
                      key={asm.id}
                      onClick={() => selectItem('ASSIGNMENT', asm.id)}
                      className={`w-full flex items-center gap-2 text-left p-2.5 rounded text-xs transition-all ${
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-text hover:bg-muted-bg/50 hover:text-foreground'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate">{asm.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Room */}
      <main className="flex-1 bg-sidebar border border-border rounded-lg p-6 overflow-y-auto flex flex-col justify-between">
        
        {/* Render Lesson Viewer */}
        {activeItem?.type === 'LESSON' && activeLesson && (
          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-foreground">{activeLesson.title}</h1>
                <Badge variant="info" className="lowercase">{activeLesson.type}</Badge>
              </div>

              {/* Lesson body rendering based on type */}
              {activeLesson.type === 'VIDEO' && activeLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-lg border border-border overflow-hidden">
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              {activeLesson.type === 'PDF' && activeLesson.pdfUrl && (
                <div className="h-[400px] border border-border rounded-lg overflow-hidden bg-muted-bg">
                  <iframe src={activeLesson.pdfUrl} className="w-full h-full" title="PDF Resource viewer" />
                </div>
              )}

              {activeLesson.type === 'TEXT' && (
                <div className="bg-card border border-border p-5 rounded-md text-sm text-foreground/80 leading-relaxed max-w-none whitespace-pre-wrap leading-relaxed select-text">
                  {activeLesson.content || 'This lesson has no written text content.'}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="pt-6 border-t border-border/40 flex items-center justify-between mt-8">
              <button
                onClick={handleToggleComplete}
                className="flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors cursor-pointer"
              >
                {completedLessons.includes(activeLesson.id) ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>Completed (Click to undo)</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5 text-muted-text" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevLesson} disabled={currentLessonIndex === 0}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
                </Button>
                <Button variant="primary" size="sm" onClick={handleNextLesson} disabled={currentLessonIndex === lessons.length - 1}>
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Render Quiz Attempt Screen */}
        {activeItem?.type === 'QUIZ' && activeQuiz && (
          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">{activeQuiz.title}</h1>
              <p className="text-xs text-muted-text">Passing Threshold: {activeQuiz.passingScore}%</p>
              
              {quizAttemptResult ? (
                // Show Quiz Result
                <Card className="bg-muted-bg/40 border border-border/60 p-6 text-center max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary text-xl font-bold">
                    {quizAttemptResult.score}%
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Quiz Attempt Summary</h3>
                    <p className="text-xs text-muted-text mt-1">
                      Status:{' '}
                      <span className={quizAttemptResult.passed ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                        {quizAttemptResult.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setQuizAttemptResult(null)}>
                    Retake Quiz
                  </Button>
                </Card>
              ) : (
                // Show Questions
                <div className="space-y-6 pt-4">
                  {activeQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Q{qIdx + 1}. {q.questionText}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswerSelect(qIdx, oIdx)}
                              className={`text-left p-3 rounded-md text-xs border transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-card text-muted-text hover:text-foreground hover:border-border/80'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-border/40 flex justify-end">
                    <Button variant="success" size="md" isLoading={submittingQuiz} onClick={handleSubmitQuiz}>
                      Submit Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Assignment Submissions Screen */}
        {activeItem?.type === 'ASSIGNMENT' && activeAssignment && (
          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">{activeAssignment.title}</h1>
              <div className="bg-card border border-border p-4 rounded text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6 select-text">
                {activeAssignment.description}
              </div>

              {submissionStatus ? (
                <Card className="bg-muted-bg/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-foreground">Submission Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex gap-4 text-xs text-muted-text">
                      <span>Submitted: {new Date(submissionStatus.submittedAt).toLocaleDateString()}</span>
                      <span>
                        Status:{' '}
                        <Badge variant={submissionStatus.status === 'GRADED' ? 'success' : 'warning'}>
                          {submissionStatus.status}
                        </Badge>
                      </span>
                    </div>
                    {submissionStatus.grade !== null && (
                      <div className="mt-4 p-4 bg-muted-bg border border-border rounded space-y-2">
                        <p className="text-sm text-foreground font-semibold">Grade: <span className="text-primary">{submissionStatus.grade}/100</span></p>
                        {submissionStatus.feedback && (
                          <div>
                            <p className="text-xs text-muted-text font-medium">Instructor Feedback:</p>
                            <p className="text-xs text-foreground/90 italic mt-0.5 select-text">{submissionStatus.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="pt-4 border-t border-border/30">
                      <Button variant="outline" size="sm" onClick={() => setSubmissionStatus(null)}>
                        Resubmit Assignment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmitAssignment} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/80 block mb-1.5">Your Submission Details</label>
                    <textarea
                      value={assignmentText}
                      onChange={(e) => setAssignmentText(e.target.value)}
                      placeholder="Write your text submission or paste repository links here..."
                      className="w-full bg-sidebar border border-border text-foreground text-sm rounded-md p-3 min-h-[150px] placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-sans"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" isLoading={submittingAssignment} disabled={!assignmentText.trim()}>
                      Submit Assignment
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
