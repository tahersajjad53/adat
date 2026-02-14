import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type LoginForm = z.infer<typeof loginSchema>;

const Auth: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>);

  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-display text-primary">السَّلَامُ عَلَيْكُمْ</h1>
          <p className="text-muted-foreground">
            Track prayers, manage dues, and cultivate daily habits
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field} />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />


            <FormField
              control={form.control}
              name="password"
              render={({ field }) =>
              <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field} />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              } />


            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}>

              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>);

};

export default Auth;