export default function DashboardLoading() {
  return (
    <main className="p-8">
      <div className="animate-pulse">
        <div className="h-9 w-48 rounded bg-gray-200" />

        <div className="mt-3 h-5 w-64 rounded bg-gray-200" />

        <div className="mt-8 space-y-6">
          <div className="h-32 rounded-lg bg-gray-200" />

          <div className="h-48 rounded-lg bg-gray-200" />

          <div className="h-48 rounded-lg bg-gray-200" />

          <div className="h-48 rounded-lg bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
