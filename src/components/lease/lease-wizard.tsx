'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LeaseWizardProps {
  userId?: string;
}

interface Property {
  id: string;
  name: string;
  rentAmountSen: number;
}

interface Tenant {
  id: string;
  name: string;
}

const steps = [
  { id: 1, title: 'Select Property' },
  { id: 2, title: 'Select Tenant' },
  { id: 3, title: 'Set Terms' },
  { id: 4, title: 'Review & Confirm' },
];

export function LeaseWizard({ userId }: LeaseWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
  });

  // Load vacant properties on step 1
  const loadProperties = async () => {
    const res = await fetch('/api/v1/properties?status=vacant');
    const data = await res.json();
    setProperties(data.data ?? []);
  };

  // Load tenants on step 2
  const loadTenants = async () => {
    const res = await fetch('/api/v1/tenants');
    const data = await res.json();
    setTenants(data.data ?? []);
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      await loadProperties();
    } else if (currentStep === 2) {
      await loadTenants();
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch('/api/v1/leases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        userId,
      }),
    });

    if (res.ok) {
      router.push('/leases');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-1 text-center ${
              currentStep === step.id
                ? 'text-primary font-semibold'
                : currentStep > step.id
                ? 'text-green-600'
                : 'text-muted-foreground'
            }`}
          >
            <div className="text-sm">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step 1: Select Property */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select a Property</h2>
          {properties.length === 0 ? (
            <p className="text-muted-foreground">No vacant properties available.</p>
          ) : (
            <div className="space-y-2">
              {properties.map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, propertyId: property.id })}
                  className={`w-full text-left p-4 border rounded-lg ${
                    formData.propertyId === property.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{property.name}</div>
                  <div className="text-sm text-muted-foreground">
                    RM {(property.rentAmountSen / 100).toFixed(2)}/month
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Tenant */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select a Tenant</h2>
          {tenants.length === 0 ? (
            <p className="text-muted-foreground">No tenants available. Add a tenant first.</p>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, tenantId: tenant.id })}
                  className={`w-full text-left p-4 border rounded-lg ${
                    formData.tenantId === tenant.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{tenant.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Set Terms */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Set Lease Terms</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monthly Rent (RM) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deposit (RM)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Usually 1-2 months rent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deposit stored separately, never set-off with final rent
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Review & Confirm</h2>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium">
                {properties.find((p) => p.id === formData.propertyId)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tenant</span>
              <span className="font-medium">
                {tenants.find((t) => t.id === formData.tenantId)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{formData.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{formData.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Rent</span>
              <span className="font-medium">RM {formData.monthlyRent}</span>
            </div>
            {formData.deposit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit</span>
                <span className="font-medium">RM {formData.deposit}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Back
        </Button>
        {currentStep < 4 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Lease'}
          </Button>
        )}
      </div>
    </div>
  );
}