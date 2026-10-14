import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../components/Toast.js';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { Card, CardContent } from '../components/Card.js';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Signed in');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-text hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-semibold text-foreground">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-muted-text">
          New here?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Make an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded bg-sidebar border-border text-primary focus:ring-primary/30"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-muted-text select-none">
                    Remember me
                  </label>
                </div>

              </div>

              <Button type="submit" fullWidth isLoading={loading} >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
