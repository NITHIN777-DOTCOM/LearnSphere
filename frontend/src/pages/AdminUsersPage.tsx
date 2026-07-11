import React, { useEffect, useState } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { useToast } from '../components/Toast.js';
import { Spinner } from '../components/Spinner.js';

interface UserItem {
  id: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
  } | null;
}

export const AdminUsersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load user directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role successfully updated!');
      fetchUsers();
    } catch (error) {
      console.error('Role update error:', error);
      toast.error('Failed to update user role settings.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their course submissions and enrollments.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User successfully deleted from database.');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to remove user account.');
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
          <Users className="w-5 h-5 text-primary" /> Manage Users Audit
        </h2>
        <p className="text-xs text-muted-text mt-0.5">Audit registered student/instructor profiles, assign privilege roles, and moderate access.</p>
      </div>

      {/* Users Directory Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {users.length === 0 ? (
            <p className="text-sm text-muted-text text-center py-8">No registered users found.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-sidebar/40 text-xs uppercase tracking-wider text-muted-text font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-muted-bg/35 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      {item.profile ? `${item.profile.firstName} ${item.profile.lastName}` : 'N/A'}
                    </td>
                    <td className="p-4 text-muted-text">{item.email}</td>
                    <td className="p-4">
                      {/* Role selection dropdown */}
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item.id, item.role, e.target.value)}
                        className="bg-sidebar border border-border text-foreground text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 font-semibold"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-muted-text">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="p-2 rounded bg-danger/10 hover:bg-danger/25 text-danger border border-danger/20 transition-colors cursor-pointer"
                        title="Delete user profile"
                      >
                        <Trash2 className="w-4 h-4" />
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
