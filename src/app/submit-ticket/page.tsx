// src/app/submit-ticket/page.tsx
import { SubmitTicketForm } from '@/components/SubmitTicketForm';
import AuthGuard from '@/components/AuthGuard';

export default function SubmitTicketPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto py-8">
        <SubmitTicketForm />
      </div>
    </AuthGuard>
  );
}
