import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calculator, Users, Repeat, Bell, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function MorePage() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <MoreLink to="/reports" title="Reports" description="Date range insights with charts" icon={BarChart3} accent="emerald" />
      <MoreLink to="/paye" title="PAYE Calculator" description="Estimate Zambian PAYE and net pay" icon={Calculator} accent="blue" />
      <MoreLink to="/chilimba" title="Chilimba Tracker" description="Manage group rounds and payouts" icon={Users} accent="violet" />
      <MoreLink to="/recurring" title="Recurring" description="Manage recurring transactions and schedules" icon={Repeat} accent="amber" />
      <MoreLink to="/notifications" title="Notifications" description="System notifications and alerts" icon={Bell} accent="rose" />
      <MoreLink to="/chatbot" title="AI Chatbot" description="Ask personalized finance questions" icon={MessageCircle} accent="teal" />
    </div>
  );
}

function MoreLink({
  to,
  title,
  description,
  icon: Icon,
  accent
}: {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'teal';
}) {
  const accentClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    blue: 'bg-blue-500/10 text-blue-600',
    violet: 'bg-violet-500/10 text-violet-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
    teal: 'bg-teal-500/10 text-teal-600'
  } as const;

  return (
    <Link
      to={to}
      className="block rounded-2xl border border-brand-100 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-50"
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon size={18} />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
