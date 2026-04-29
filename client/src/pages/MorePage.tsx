import { Link } from 'react-router-dom';

export function MorePage() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MoreLink to="/reports" title="Reports" description="Date range insights with charts" />
      <MoreLink to="/paye" title="PAYE Calculator" description="Estimate Zambian PAYE and net pay" />
      <MoreLink to="/chilimba" title="Chilimba Tracker" description="Manage group rounds and payouts" />
      <MoreLink to="/recurring" title="Recurring" description="Manage recurring transactions and schedules" />
      <MoreLink to="/notifications" title="Notifications" description="System notifications and alerts" />
      <MoreLink to="/chatbot" title="AI Chatbot" description="Ask personalized finance questions" />
    </div>
  );
}

function MoreLink({ to, title, description }: { to: string; title: string; description: string }) {
  return (
    <Link to={to} className="block rounded-2xl border border-brand-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-50">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
