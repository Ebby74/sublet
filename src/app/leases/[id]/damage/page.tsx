import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { getDamageReports } from '@/services/damage-report-service';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default async function LeaseDamageReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lease = await getLease(id);
  const reports = await getDamageReports(id);

  if (!lease) {
    return (
      <div className="container py-8">
        <p>Lease not found</p>
        <Link href="/leases">
          <Button variant="link">Back to leases</Button>
        </Link>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'repaired':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'assessed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8">
      <Link
        href={`/leases/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
      >
        ← Back to lease
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Damage Reports</h1>
        <Link href={`/leases/${id}/damage/new`}>
          <Button>Report Damage</Button>
        </Link>
      </div>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <h2 className="font-semibold mb-2">Lease Details</h2>
        <p className="text-sm text-muted-foreground">
          {lease.room.floor.property.name} - {lease.room.name}
        </p>
        <p className="text-sm text-muted-foreground">Tenant: {lease.tenant.name}</p>
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">No damage reports found.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold capitalize">{report.damageType} Damage</h3>
                  <p className="text-sm text-muted-foreground">
                    Reported: {formatDate(report.reportedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}
                  >
                    {report.severity}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              <p className="text-sm mb-2">{report.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {report.estimatedCostSen && (
                  <div>
                    <span className="text-muted-foreground">Est. Cost: </span>
                    {formatCurrency(report.estimatedCostSen)}
                  </div>
                )}
                {report.actualCostSen && (
                  <div>
                    <span className="text-muted-foreground">Actual Cost: </span>
                    {formatCurrency(report.actualCostSen)}
                  </div>
                )}
              </div>

              {report.repairNotes && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Repair Notes: </span>
                  {report.repairNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
