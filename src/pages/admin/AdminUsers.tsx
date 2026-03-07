import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  city: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? '?';
}

const AdminUsers: React.FC = () => {
  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_admin_users');
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl tracking-tight font-display font-normal">
            Users
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${users.length} registered user${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">City</TableHead>
                  <TableHead className="hidden md:table-cell">Signed Up</TableHead>
                  <TableHead className="hidden md:table-cell">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          {user.full_name && (
                            <p className="text-sm font-medium truncate">{user.full_name}</p>
                          )}
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {user.city ?? '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.last_sign_in_at
                        ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
