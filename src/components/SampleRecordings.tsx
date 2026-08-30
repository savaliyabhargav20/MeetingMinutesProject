import React from 'react';
import { Sparkles, PlayCircle, Users, ShieldAlert, Cpu } from 'lucide-react';
import { SampleMeeting } from '../types';

export const SAMPLE_MEETINGS: SampleMeeting[] = [
  {
    id: 'product-sync',
    title: 'Q3 Product & Engineering Sprint Sync',
    duration: '14 mins',
    description: 'Sprint milestones, database migration latency improvements, onboarding redesign & launch newsletter.',
    transcript: `Alex (Product Lead): Welcome everyone to our Q3 Project Sync. Today we'll review the rollout schedule, backend migration milestones, and customer onboarding feedback.
Sarah (Engineering Lead): On the backend migration, database indexing is complete. We saw query latency drop by 42%. Next up is API caching, which we aim to finish by next Friday.
David (Design): Design specs for the revised onboarding flow are ready in Figma. We simplified the signup steps from 5 steps down to 3.
Alex: That's great progress. Sarah, do you foresee any blockers with the caching deployment?
Sarah: Only dependency is getting staging server credentials approved by DevOps.
Alex: I'll talk to Michael in DevOps today to approve the access immediately.
Elena (Marketing): On the launch campaign side, the newsletter draft and blog post are ready for review. We need final feature screenshots by Wednesday.
David: I will supply high-resolution screenshots and UI motion assets to Elena by Tuesday at 3 PM.
Alex: Fantastic. Let's recap: I'll unblock DevOps access today, David delivers assets by Tuesday, Sarah completes API caching by Friday, and Elena launches the campaign next Monday. Thanks team!`
  },
  {
    id: 'executive-review',
    title: 'Quarterly Executive Strategy Review',
    duration: '28 mins',
    description: 'Annual revenue trajectory, enterprise tier expansion, hiring plans, and customer retention metrics.',
    transcript: `Chairman (Robert): Good morning board members. Let's review our Q2 financial results and Q3 growth strategy.
CFO (Victoria): Total revenue reached $4.2M, up 28% year-over-year. Enterprise expansion contributed 60% of new ARR. Net revenue retention holds strong at 118%.
CEO (Marcus): To accelerate this momentum in Q3, we propose allocating $400K into dedicated enterprise customer success and opening 3 senior sales engineer requisitions.
Board Member (Claire): What is the expected payback period on the additional sales engineering headcount?
CFO: Under 6 months based on our current pipeline conversion rate of 34%.
Marcus: We are also transitioning our SLA tier to 99.99% for Tier-1 clients starting September 1st.
Robert: All in favor of approving the Q3 budget expansion and headcount authorization?
Victoria: Approved unanimously.
Marcus: Action items: Victoria will update the financial models by Thursday; HR will publish the job listings on Friday; and I will communicate the updated SLA guidelines to strategic account managers.`
  },
  {
    id: 'security-audit',
    title: 'SOC2 & Infrastructure Security Audit',
    duration: '22 mins',
    description: 'Vulnerability assessment review, key rotation protocols, automated backup testing, and compliance checklist.',
    transcript: `CISO (Liam): Welcome team. Today we are conducting the preliminary review for our annual SOC2 Type II audit.
DevOps (Rachel): All production Kubernetes clusters have been upgraded to the latest patch release. RBAC policies have been tightened to least privilege.
Security Engineer (Ken): We finished automated penetration testing on the public REST endpoints. No critical vulnerabilities found; two low-severity header configuration warnings were remediated yesterday.
Liam: Excellent work. What is the status of our automated database snapshot verification?
Rachel: We simulated an automated point-in-time recovery test on Sunday. Full restore took 8 minutes, well within our 30-minute RTO target.
Liam: Great. Next steps: Ken will finalize the vendor risk assessment questionnaires by Wednesday. Rachel will deliver the access log audit trail to our compliance auditor by Friday morning.`
  }
];

interface SampleRecordingsProps {
  onSelectSample: (sample: SampleMeeting) => void;
  disabled?: boolean;
}

export const SampleRecordings: React.FC<SampleRecordingsProps> = ({
  onSelectSample,
  disabled
}) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Or try a sample meeting recording
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_MEETINGS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onSelectSample(sample)}
            disabled={disabled}
            id={`sample-${sample.id}`}
            className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group disabled:opacity-50 disabled:pointer-events-none shadow-xs"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {sample.duration}
              </span>
              <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h5 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
              {sample.title}
            </h5>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {sample.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
