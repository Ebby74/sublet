import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDamageReport } from '@/services/damage-report-service';

export default async function NewDamageReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lease = await getLease(id);

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

  async function createReport(formData: FormData) {
    'use server';

    const leaseId = id;
    const damageType = formData.get('damageType') as string;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string;
    const estimatedCostSen = formData.get('estimatedCostSen') as string;
    const reporterName = formData.get('reporterName') as string;

    await createDamageReport({
      leaseId,
      damageType,
      severity,
      description,
      estimatedCostSen: estimatedCostSen ? parseInt(estimatedCostSen) * 100 : undefined,
      reporterName: reporterName || undefined,
    });

    return { success: true };
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link
        href={`/leases/${id}/damage`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
      >
        ← Back to damage reports
      </Link>

      <h1 className="text-2xl font-bold mb-6">Report Damage</h1>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <h2 className="font-semibold mb-2">Lease Details</h2>
        <p className="text-sm text-muted-foreground">
          {lease.room.floor.property.name} - {lease.room.name}
        </p>
        <p className="text-sm text-muted-foreground">Tenant: {lease.tenant.name}</p>
      </div>

      <form action={async (formData) => { await createReport(formData); }} className="space-y-4">
        <div>
          <Label htmlFor="damageType">Damage Type</Label>
          <Select name="damageType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select damage type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="structural">Structural</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="severity">Severity</Label>
          <Select name="severity" defaultValue="minor">
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            name="description"
            placeholder="Describe the damage..."
            required
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="estimatedCostSen">Estimated Cost (RM)</Label>
          <Input
            name="estimatedCostSen"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="reporterName">Reporter Name (Optional)</Label>
          <Input
            name="reporterName"
            type="text"
            placeholder="Name of person reporting"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Submit Report</Button>
          <Link href={`/leases/${id}/damage`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
