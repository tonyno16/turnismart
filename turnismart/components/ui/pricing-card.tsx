import Link from "next/link";

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const isHighlighted = plan.highlighted ?? false;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
        isHighlighted
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-lg dark:bg-[hsl(var(--primary))]/10"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50"
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-medium text-white">
          Più popolare
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {plan.description}
        </p>
      </div>
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {plan.price}
        </span>
        <span className="text-zinc-600 dark:text-zinc-400">{plan.period}</span>
      </div>
      <ul className="mb-8 flex-1 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-0.5 shrink-0 text-[hsl(var(--primary))]"
              aria-hidden
            >
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={`inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
          isHighlighted
            ? "bg-[hsl(var(--primary))] text-white shadow-sm hover:opacity-90 focus:ring-[hsl(var(--primary))]"
            : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
