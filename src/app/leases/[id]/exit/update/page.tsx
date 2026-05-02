import Link from 'next/link';
import { getLease } from '@/services/lease-service';
import { getExitProcessByLeaseId } from '@/services/exit-process-service';
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
import { updateExitProcess, completeExitProcess } from '@/services/exit-process-service';
import { formatCurrency } from '@/lib/format';

export default async function UpdateExitProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lease = await getLease(id);
  const exitProcess = await getExitProcessByLeaseId(id);

  if (!lease || !exitProcess) {
    return (
      <div className="container py-8">
        <p>{!lease ? 'Lease' : 'Exit process'} not found</p>
        <Link href={`/leases/${id}/exit`}>
          <Button variant="link">Back to exit process</Button>
        </Link>
      </div>
    );
  }

  async function updateExit(formData: FormData) {
    'use server';

    const status = formData.get('status') as string;
    const actualMoveOut = formData.get('actualMoveOut') as string;
    const checklistData = formData.get('checklistData') as string;
    const totalDeductionsSen = formData.get('totalDeductionsSen') as string;
    const depositReturnSen = formData.get('depositReturnSen') as string;
    const refundMethod = formData.get('refundMethod') as string;
    const refundReference = formData.get('refundReference') as string;
    const notes = formData.get('notes') as string;

    if (status === 'completed') {
      await completeExitProcess(id);
    } else {
      await updateExitProcess(id, {
        status,
        actualMoveOut: actualMoveOut ? new Date(actualMoveOut) : undefined,
        checklistData: checklistData ? JSON.parse(checklistData) : undefined,
        totalDeductionsSen: totalDeductionsSen ? parseInt(totalDeductionsSen) * 100 : undefined,
        depositReturnSen: depositReturnSen ? parseInt(depositReturnSen) * 100 : undefined,
        refundMethod: refundMethod || undefined,
        refundReference: refundReference || undefined,
        notes: notes || undefined,
      });
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link
        href={`/leases/${id}/exit`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 block"
      >
        ← Back to exit process
      </Link>

      <h1 className="text-2xl font-bold mb-6">Update Exit Process</h1>

      <div className="border rounded-lg p-6 bg-card mb-6">
        <h2 className="font-semibold mb-2">Current Status</h2>
        <p className="text-sm text-muted-foreground">
          Status: {exitProcess.status.replace(/_/g, ' ')}
        </p>
        <p className="text-sm text-muted-foreground">
          Expected Move-Out: {new Date(exitProcess.expectedMoveOut).toLocaleDateString()}
        </p>
      </div>

      <form action={updateExit} className="space-y-4">
        <div>
          <Label htmlFor="status">Update Status</Label>
          <Select name="status" defaultValue={exitProcess.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="inspection_scheduled">Inspection Scheduled</SelectItem>
              <SelectItem value="inspection_complete">Inspection Complete</SelectItem>
              <SelectItem value="final_payment_calculated">Final Payment Calculated</SelectItem>
              <SelectItem value="deposit_returned">Deposit Returned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="actualMoveOut">Actual Move-Out Date</Label>
          <Input
            name="actualMoveOut"
            type="date"
            defaultValue={exitProcess.actualMoveOut?.toISOString().split('T')[0]}
          />
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">Financial Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalDeductionsSen">Total Deductions (RM)</Label>
              <Input
                name="totalDeductionsSen"
                type="number"
                step="0.01"
                defaultValue={(exitProcess.totalDeductionsSen / 100).toFixed(2)}
              />
            </div>
            <div>
              <Label htmlFor="depositReturnSen">Deposit Return (RM)</Label>
              <Input
                name="depositReturnSen"
                type="number"
                step="0.01"
                placeholder={(lease.depositSen / 100).toFixed(2)}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="refundMethod">Refund Method</Label>
          <Select name="refundMethod" defaultValue={exitProcess.refundMethod ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select refund method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="refundReference">Refund Reference</Label>
          <Input
            name="refundReference"
            type="text"
            placeholder="Transaction ID, cheque number, etc."
            defaultValue={exitProcess.refundReference ?? ''}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            name="notes"
            placeholder="Additional notes..."
            rows={3}
            defaultValue={exitProcess.notes ?? ''}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Update Exit Process</Button>
          <Link href={`/leases/${id}/exit`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
