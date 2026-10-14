import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, GraduationCap, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../components/Toast.js';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { Card, CardContent } from '../components/Card.js';
import type { Role } from '../types/index.js';

const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  role: z.enum(['STUDENT', 'INSTRUCTOR'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const selectRole = (role: 'STUDENT' | 'INSTRUCTOR') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await authRegister(data.email, data.password, data.firstName, data.lastName, data.role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please check your credentials.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-semibold text-foreground">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-text">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Choose your account type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => selectRole('STUDENT')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center transition-all ${
                      selectedRole === 'STUDENT'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-muted-bg/40 text-muted-text hover:text-foreground hover:border-border/80'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-xs font-semibold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectRole('INSTRUCTOR')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center transition-all ${
                      selectedRole === 'INSTRUCTOR'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-muted-bg/40 text-muted-text hover:text-foreground hover:border-border/80'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-xs font-semibold">Instructor</span>
                  </button>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  id="firstName"
                  type="text"
                  placeholder="John"
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />

                <Input
                  label="Last Name"
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <Button type="submit" fullWidth isLoading={loading} leftIcon={<UserPlus className="w-4 h-4" />}>
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
