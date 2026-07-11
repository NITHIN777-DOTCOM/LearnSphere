import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Lock, Camera, Save, Key, Flame, Award, FileText, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../components/Toast.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Input } from '../components/Input.js';
import { Button } from '../components/Button.js';
import { Avatar } from '../components/Avatar.js';
import { Badge } from '../components/Badge.js';
import { ProgressBar } from '../components/ProgressBar.js';

// Schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  biography: z.string().nullable().optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmNewPassword: z.string().min(1, 'Confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Forms
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      biography: user?.biography || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Calculate Profile Completion Percentage
  let completionPercentage = 0;
  if (user?.firstName) completionPercentage += 25;
  if (user?.lastName) completionPercentage += 25;
  if (user?.biography) completionPercentage += 25;
  if (user?.avatarUrl) completionPercentage += 25;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatarUrl: response.data.avatarUrl });
      toast.success('Avatar photo updated successfully!');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar image');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onUpdateProfileSubmit = async (data: ProfileFormValues) => {
    setProfileSaving(true);
    try {
      const response = await api.put('/users/profile', data);
      updateUser(response.data.user);
      toast.success('Profile details updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordSaving(true);
    try {
      await api.put('/users/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password credentials updated successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const avatarFullPath = avatarPreview || user?.avatarUrl || '';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Account Profile</h2>
        <p className="text-xs text-muted-text mt-0.5">Manage your personal information, profile photo, and password credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Stats, achievements & certificates */}
        <div className="space-y-6">
          {/* Avatar card */}
          <Card className="text-center p-6 bg-card border-border/40">
            <CardContent className="pt-4 space-y-4">
              <div className="relative inline-block">
                <Avatar
                  src={avatarFullPath}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  size="xl"
                />
                <label className="absolute bottom-1 right-1 p-2 bg-primary hover:bg-primary-hover text-white rounded-full cursor-pointer shadow-soft border border-border/40 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                </label>
              </div>

              {avatarUploading && <p className="text-xs text-primary animate-pulse">Uploading photo...</p>}

              <div>
                <h3 className="font-bold text-foreground text-base">
                  {user?.firstName} {user?.lastName}
                </h3>
                <Badge variant="primary" className="mt-1 uppercase text-[10px] tracking-wider">
                  {user?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion percentage */}
          <Card className="p-4 bg-card border-border/40 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">Profile Completeness</span>
              <span className="text-xs font-semibold text-primary">{completionPercentage}%</span>
            </div>
            <ProgressBar value={completionPercentage} size="sm" />
            <p className="text-[10px] text-muted-text leading-relaxed">
              Add first names, last names, bio descriptors, and custom avatars to verify your learning credentials.
            </p>
          </Card>

          {/* Streaks Widget */}
          <Card className="p-4 bg-card border-border/40 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-foreground">Current Streak</p>
              <p className="text-[10px] text-muted-text mt-0.5">Consecutive study days</p>
            </div>
            <div className="flex items-center gap-1 text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-full text-xs font-extrabold animate-pulse">
              <Flame className="w-4 h-4 fill-warning" />
              <span>5 Days</span>
            </div>
          </Card>

          {/* Achievements Card */}
          <Card className="p-4 bg-card border-border/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" /> Achievements
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded bg-sidebar/50 border border-border/40 text-xs">
                <CheckCircle className="w-4 h-4 text-success" />
                <div>
                  <p className="font-bold text-foreground">First Enroll</p>
                  <p className="text-[9px] text-muted-text">Started first platform course</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-sidebar/50 border border-border/40 text-xs">
                <Award className="w-4 h-4 text-warning" />
                <div>
                  <p className="font-bold text-foreground">Quiz Champ</p>
                  <p className="text-[9px] text-muted-text">Scored 100% on module assessments</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Earned Certificates */}
          <Card className="p-4 bg-card border-border/40 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-success" /> Completion Certificates
            </h4>
            <div className="space-y-2">
              <div className="p-2 border border-border/40 rounded bg-sidebar/30 text-xs flex justify-between items-center">
                <div className="truncate pr-1">
                  <p className="font-semibold text-foreground truncate">Full Stack Web Dev</p>
                  <p className="text-[9px] text-muted-text">Issued July 11, 2026</p>
                </div>
                <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest font-bold px-1 rounded shrink-0">
                  Verify
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Columns - Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onUpdateProfileSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    id="firstName"
                    error={profileErrors.firstName?.message}
                    {...registerProfile('firstName')}
                  />
                  <Input
                    label="Last Name"
                    id="lastName"
                    error={profileErrors.lastName?.message}
                    {...registerProfile('lastName')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 block mb-1.5">Biography</label>
                  <textarea
                    id="biography"
                    placeholder="Tell us about yourself..."
                    className="w-full bg-sidebar border border-border text-foreground text-sm rounded-md p-3 min-h-[100px] placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-sans"
                    {...registerProfile('biography')}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" isLoading={profileSaving} leftIcon={<Save className="w-4 h-4" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-warning" /> Change Credentials Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(onChangePasswordSubmit)} className="space-y-5">
                <Input
                  label="Current Password"
                  id="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={passwordErrors.oldPassword?.message}
                  {...registerPassword('oldPassword')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword')}
                  />

                  <Input
                    label="Confirm New Password"
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={passwordErrors.confirmNewPassword?.message}
                    {...registerPassword('confirmNewPassword')}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" isLoading={passwordSaving}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
