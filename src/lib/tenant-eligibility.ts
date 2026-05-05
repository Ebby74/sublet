export type Gender = 'male' | 'female';

export type MaritalStatus =
  | 'single'
  | 'married-separated'
  | 'married-together'
  | 'divorced-no-kids'
  | 'divorced-with-kids';

export interface TenantEligibilityCheck {
  nationality: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  hasChildren: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export function checkEligibility(check: TenantEligibilityCheck): EligibilityResult {
  if (check.nationality.toLowerCase() !== 'malaysian') {
    return {
      eligible: false,
      reason: 'Sorry, our rooms are currently available to Malaysian nationals only.',
    };
  }

  if (check.hasChildren) {
    return {
      eligible: false,
      reason:
        'Our co-living spaces are designed for single occupants. Children cannot be accommodated.',
    };
  }

  if (check.maritalStatus === 'divorced-with-kids') {
    return {
      eligible: false,
      reason:
        'Our co-living spaces are designed for single occupants. Children cannot be accommodated.',
    };
  }

  if (check.maritalStatus === 'married-together') {
    return {
      eligible: false,
      reason:
        'Our rooms are single-occupancy co-living spaces. Married couples staying together are not eligible.',
    };
  }

  const roomGender = check.gender === 'male' ? 'Muslimin' : 'Muslimah';

  return {
    eligible: true,
    reason: `Eligible for ${roomGender} section.`,
  };
}

export function getEligibilityDisplayText(): string[] {
  return [
    'Malaysian Muslim only',
    'Gender-segregated co-living — Muslimin & Muslimah sections',
    'Single tenants (married but staying single away from spouse — allowed)',
    'No children living with tenant',
    '1-year contract · Minimum 6-month stay',
    'Early move-out before 6 months — deposit forfeited',
  ];
}

export const ELIGIBILITY_REQUIREMENTS = {
  nationality: 'malaysian' as const,
  acceptedMaritalStatuses: ['single', 'married-separated', 'divorced-no-kids'] as MaritalStatus[],
  hasChildren: false,
} as const;
