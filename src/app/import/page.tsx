'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSVUpload } from '@/components/import/csv-upload';
import { FieldMapper } from '@/components/import/field-mapper';
import { ImportPreview } from '@/components/import/import-preview';
import { importService } from '@/services/import-service';
import type { FieldMapping, CSVRow, ValidationError } from '@/services/import-service';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'complete';
type ImportEntity = 'properties' | 'tenants' | 'leases';

const ENTITY_FIELDS = {
  properties: [
    { key: 'name', label: 'Property Name', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'type', label: 'Property Type' },
    { key: 'rentAmountSen', label: 'Monthly Rent (RM)' },
    { key: 'status', label: 'Status' },
  ],
  tenants: [
    { key: 'name', label: 'Tenant Name', required: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'icNumber', label: 'IC Number' },
  ],
  leases: [
    { key: 'propertyName', label: 'Property Name', required: true },
    { key: 'tenantName', label: 'Tenant Name', required: true },
    { key: 'startDate', label: 'Start Date', required: true },
    { key: 'endDate', label: 'End Date', required: true },
    { key: 'monthlyRentSen', label: 'Monthly Rent (RM)' },
    { key: 'depositSen', label: 'Deposit (RM)' },
    { key: 'status', label: 'Status' },
  ],
};

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [entityType, setEntityType] = useState<ImportEntity>('properties');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<FieldMapping[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number } | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    const result = await importService.parseCSV(selectedFile);
    setHeaders(result.headers);
    setRows(result.rows);
    
    if (result.errors.length > 0) {
      console.warn('CSV parse warnings:', result.errors);
    }
    
    setStep('mapping');
  };

  const handleMappingComplete = () => {
    // Validate before preview
    const records = importService.applyMapping(rows, mapping, entityType);
    const validationErrors = importService.validateImport(records, mapping);
    setErrors(validationErrors);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      const result = await importService.executeImport(rows, mapping, entityType);
      setImportResult(result);
      setStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const steps = ['Upload', 'Map Fields', 'Preview', 'Complete'];
  const currentStepIndex = ['upload', 'mapping', 'preview', 'complete'].indexOf(step);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Import Data</h1>
        <p className="text-muted-foreground">
          Import properties, tenants, or leases from a CSV file
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                i <= currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                i === currentStepIndex ? 'font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${
                i < currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Entity Type Selector */}
      {step === 'upload' && (
        <div className="space-y-4">
          <label className="text-sm font-medium">What are you importing?</label>
          <div className="flex gap-2">
            {(['properties', 'tenants', 'leases'] as ImportEntity[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEntityType(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  entityType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {step === 'upload' && (
          <CSVUpload onFileSelect={handleFileSelect} />
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <FieldMapper
              csvHeaders={headers}
              systemFields={ENTITY_FIELDS[entityType]}
              mapping={mapping}
              onMappingChange={setMapping}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('upload');
                  setMapping([]);
                }}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleMappingComplete}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue to Preview
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <ImportPreview
            headers={headers}
            rows={rows}
            errors={errors}
            onConfirm={handleImport}
            onCancel={() => setStep('upload')}
            isImporting={isImporting}
          />
        )}

        {step === 'complete' && importResult && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            {importResult.success ? (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <span className="text-2xl text-green-600">✓</span>
                </div>
                <h2 className="text-xl font-semibold">Import Complete</h2>
                <p className="text-muted-foreground">
                  {importResult.imported} records imported successfully
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <span className="text-2xl text-red-600">✗</span>
                </div>
                <h2 className="text-xl font-semibold">Import Failed</h2>
                <p className="text-muted-foreground">
                  Please check the errors and try again
                </p>
              </>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/${entityType}`)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground"
              >
                View {entityType}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setHeaders([]);
                  setRows([]);
                  setMapping([]);
                  setErrors([]);
                  setImportResult(null);
                }}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent"
              >
                Import Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}