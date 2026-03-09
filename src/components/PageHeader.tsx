interface PageHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function PageHeader({ title, subtitle, centered }: PageHeaderProps) {
  return (
    <div className={`mb-6 ${centered ? 'text-center' : ''}`}>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
