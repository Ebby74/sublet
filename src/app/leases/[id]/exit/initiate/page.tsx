import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createExitProcess } from '@/services/exit-process-service';

export default async function InitiateExitProcessPage({
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

  async function initiateExit(formData: FormData) {
    'use server';

    const leaseId = id;
    const expectedMoveOut = new Date(formData.get('expectedMoveOut') as string);
    const notes = formData.get('notes') as string;

    await createExitProcess({
      leaseId,
      expectedMoveOut,
      notes: notes || undefined,
    });

    return { success: true };
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link
        href={`/leases/${id}/exit`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
      >
        ← Back to exit process
      </Link>

      <h1 className="text-2xl font-bold mb-6">Initiate Exit Process</h1>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <h2 className="font-semibold mb-2">Lease Details</h2>
        <p className="text-sm text-muted-foreground">
          {lease.room.floor.property.name} - {lease.room.name}
        </p>
        <p className="text-sm text-muted-foreground">Tenant: {lease.tenant.name}</p>
        <p className="text-sm text-muted-foreground">
          Deposit: {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(lease.depositSen / 100)}
        </p>
      </div>

      <form action={async (formData) => { await initiateExit(formData); }} className="space-y-4">
        <div>
          <Label htmlFor="expectedMoveOut">Expected Move-Out Date</Label>
          <Input
            name="expectedMoveOut"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            name="notes"
            placeholder="Any additional notes about the exit..."
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Initiate Exit Process</Button>
          <Link href={`/leases/${id}/exit`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
