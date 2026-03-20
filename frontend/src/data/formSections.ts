// Maps each form type to the health profile section IDs it draws data from
export const FORM_SECTIONS: Record<string, string[]> = {
  intake: [
    'demographics',
    'medical_history',
    'medications',
    'allergies',
    'family_history',
    'vaccinations',
    'primary_insurance',
    'surgeries',
  ],
  telehealth: [
    'demographics',
    'tech_access',
    'comm_preferences',
    'primary_insurance',
  ],
  pediatric: [
    'demographics',
    'medical_history',
    'medications',
    'allergies',
    'vaccinations',
    'family_history',
    'primary_insurance',
  ],
  dh9: [
    'demographics',
    'mh_conditions',
    'mh_treatment',
    'mh_recent',
    'medications',
    'primary_insurance',
  ],
}

export const FORM_LABELS: Record<string, string> = {
  intake: 'Intake Form',
  telehealth: 'Telehealth Consent Form',
  pediatric: 'Pediatric Form',
  dh9: 'DH9 Mental Health Intake Form',
}
