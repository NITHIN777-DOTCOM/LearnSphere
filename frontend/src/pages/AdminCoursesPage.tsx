import React, { useEffect, useState } from 'react';
import { ShieldCheck, ToggleRight, Check } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import { useToast } from '../components/Toast.js';
import { Spinner } from '../components/Spinner.js';

interface AdminCourseItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  instructor: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

export const AdminCoursesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<AdminCourseItem[]>([]);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses audits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleToggleStatus = async (courseId: string, currentStatus: 'DRAFT' | 'PUBLISHED') => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
      toast.success(`Course successfully set to ${newStatus}!`);
      fetchCourses();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to toggle course verification status.');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" /> Verify Content & Proposals
        </h2>
        <p className="text-xs text-muted-text mt-0.5">Audit proposed course curriculum structures, verify lessons content, and moderate catalogs.</p>
      </div>

      {/* Courses Audit Directory Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-8">No proposed courses found.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-sidebar/40 text-xs uppercase tracking-wider text-muted-text font-semibold">
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {courses.map((item) => (
                  <tr key={item.id} className="hover:bg-muted-bg/35 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{item.title}</td>
                    <td className="p-4">
                      {item.instructor?.profile 
                        ? `${item.instructor.profile.firstName} ${item.instructor.profile.lastName}` 
                        : item.instructor?.email || 'N/A'}
                    </td>
                    <td className="p-4">
                      <Badge variant="primary">{item.category}</Badge>
                    </td>
                    <td className="p-4 capitalize text-muted-text text-xs font-semibold">
                      {item.difficulty.toLowerCase()}
                    </td>
                    <td className="p-4">
                      <Badge variant={item.status === 'PUBLISHED' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {/* Approve / Moderation toggler */}
                      <button
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                          item.status === 'PUBLISHED'
                            ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
                            : 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                        }`}
                        title={item.status === 'PUBLISHED' ? 'Revoke Approval (Set to DRAFT)' : 'Verify & Approve Course'}
                      >
                        {item.status === 'PUBLISHED' ? (
                          <>
                            <ToggleRight className="w-4 h-4" /> Revoke
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Approve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
