'use client';

import { ArrowRight } from 'lucide-react';

interface FieldMapping {
  csvColumn: string;
  systemField: string;
}

interface FieldMapperProps {
  csvHeaders: string[];
  systemFields: { key: string; label: string; required?: boolean }[];
  mapping: FieldMapping[];
  onMappingChange: (mapping: FieldMapping[]) => void;
}

export function FieldMapper({
  csvHeaders,
  systemFields,
  mapping,
  onMappingChange,
}: FieldMapperProps) {
  const handleChange = (systemField: string, csvColumn: string) => {
    const newMapping = mapping.filter((m) => m.systemField !== systemField);
    if (csvColumn) {
      newMapping.push({ csvColumn, systemField });
    }
    onMappingChange(newMapping);
  };

  const getSelectedColumn = (systemField: string): string => {
    return mapping.find((m) => m.systemField === systemField)?.csvColumn || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Map CSV Columns</h3>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to the system fields
        </p>
      </div>
      
      <div className="space-y-4">
        {systemFields.map((field) => (
          <div key={field.key} className="flex items-center gap-4">
            <div className="w-48 flex-shrink-0">
              <span className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1">
              <select
                value={getSelectedColumn(field.key)}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">-- Select column --</option>
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}