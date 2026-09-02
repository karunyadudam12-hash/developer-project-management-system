type DashboardSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function DashboardSection({
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section className="rounded-lg border bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}