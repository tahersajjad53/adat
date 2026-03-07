import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl tracking-tight font-display font-normal">
            Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Admin overview and quick actions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/admin/elans"
            className="rounded-xl border bg-card p-5 hover:bg-accent/50 transition-colors"
          >
            <p className="font-medium">Elans</p>
            <p className="text-sm text-muted-foreground mt-1">
              Manage community goals and reminders.
            </p>
          </a>
          <a
            href="/admin/tags"
            className="rounded-xl border bg-card p-5 hover:bg-accent/50 transition-colors"
          >
            <p className="font-medium">Tags</p>
            <p className="text-sm text-muted-foreground mt-1">
              Manage goal categories visible to all users.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
