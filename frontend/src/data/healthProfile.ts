export interface Field {
  key: string
  label: string
  type?: 'text' | 'date' | 'tel' | 'textarea' | 'select'
  options?: string[]
}

export interface Section {
  id: string
  title: string
  description: string
  fields: Field[]
}

export interface SectionGroup {
  id: string
  title: string
  subtitle: string
  sections: Section[]
}

export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'general',
    title: 'General',
    subtitle: 'Core health information used across most medical forms.',
    sections: [
      {
        id: 'demographics',
        title: 'Demographics',
        description: 'Basic personal information used across all health forms.',
        fields: [
          { key: 'full_name', label: 'Full Name' },
          { key: 'dob', label: 'Date of Birth', type: 'date' },
          { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'] },
          { key: 'address', label: 'Home Address' },
          { key: 'phone', label: 'Phone Number', type: 'tel' },
          { key: 'emergency_contact_name', label: 'Emergency Contact Name' },
          { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'tel' },
        ],
      },
      {
        id: 'medical_history',
        title: 'Medical History',
        description: 'Current and past medical conditions.',
        fields: [
          { key: 'conditions', label: 'Current conditions or diagnoses', type: 'textarea' },
          { key: 'hospitalizations', label: 'Hospitalizations in the last 5 years', type: 'textarea' },
        ],
      },
      {
        id: 'medications',
        title: 'Medications',
        description: 'All medications you are currently taking.',
        fields: [
          { key: 'prescriptions', label: 'Current prescription medications (include dosage and frequency)', type: 'textarea' },
          { key: 'otc_supplements', label: 'Over-the-counter medications or supplements', type: 'textarea' },
        ],
      },
      {
        id: 'allergies',
        title: 'Allergies',
        description: 'Known allergies and reactions.',
        fields: [
          { key: 'drug_allergies', label: 'Drug allergies (include reaction if known)', type: 'textarea' },
          { key: 'other_allergies', label: 'Other allergies (food, environmental, latex, etc.)', type: 'textarea' },
        ],
      },
      {
        id: 'family_history',
        title: 'Family History',
        description: 'Medical history of immediate family members.',
        fields: [
          { key: 'family_conditions', label: 'Significant conditions in immediate family (parents, siblings)', type: 'textarea' },
        ],
      },
      {
        id: 'vaccinations',
        title: 'Vaccinations',
        description: 'Your vaccination history.',
        fields: [
          { key: 'vaccination_list', label: 'Vaccinations received (include dates if known)', type: 'textarea' },
          { key: 'flu_shot', label: 'Flu shot in the last 12 months?', type: 'select', options: ['Yes', 'No', 'Not sure'] },
        ],
      },
    ],
  },
  {
    id: 'mental_health',
    title: 'Mental Health History',
    subtitle: 'Used for mental health intake forms such as PHQ-9, GAD-7, and DH9.',
    sections: [
      {
        id: 'mh_conditions',
        title: 'Mental Health Conditions',
        description: 'Current and past mental health diagnoses.',
        fields: [
          { key: 'mh_diagnoses', label: 'Current or past mental health diagnoses (e.g. depression, anxiety, PTSD)', type: 'textarea' },
          { key: 'mh_hospitalizations', label: 'Psychiatric hospitalizations or crisis episodes', type: 'textarea' },
          { key: 'mh_onset', label: 'When did you first experience mental health concerns?', type: 'text' },
        ],
      },
      {
        id: 'mh_treatment',
        title: 'Treatment & Providers',
        description: 'Current and past mental health treatment.',
        fields: [
          { key: 'current_therapist', label: 'Current therapist or counselor (name, practice)', type: 'text' },
          { key: 'therapy_type', label: 'Type of therapy (e.g. CBT, DBT, talk therapy)', type: 'text' },
          { key: 'therapy_frequency', label: 'Frequency of sessions', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly', 'As needed', 'Not currently in therapy'] },
          { key: 'psych_medications', label: 'Psychiatric or mood-related medications (include dosage)', type: 'textarea' },
        ],
      },
      {
        id: 'mh_recent',
        title: 'Recent Symptoms',
        description: 'How you have been feeling recently — useful for PHQ-9 and GAD-7 screenings.',
        fields: [
          { key: 'mood_last2weeks', label: 'How would you describe your mood over the last 2 weeks?', type: 'textarea' },
          { key: 'sleep_issues', label: 'Any sleep difficulties (insomnia, oversleeping, nightmares)?', type: 'textarea' },
          { key: 'anxiety_triggers', label: 'Known anxiety triggers or stressors', type: 'textarea' },
          { key: 'self_harm_history', label: 'Any history of self-harm or suicidal thoughts (yes/no and context if comfortable)', type: 'textarea' },
        ],
      },
    ],
  },
  {
    id: 'telehealth',
    title: 'Online & Telehealth Services',
    subtitle: 'Helps providers set up remote appointments and virtual care.',
    sections: [
      {
        id: 'tech_access',
        title: 'Technology & Access',
        description: 'Devices and connectivity for virtual visits.',
        fields: [
          { key: 'device_type', label: 'Devices available for telehealth', type: 'select', options: ['Smartphone', 'Tablet', 'Laptop/Desktop', 'Multiple devices'] },
          { key: 'internet_quality', label: 'Internet connection quality', type: 'select', options: ['Reliable broadband', 'Moderate (occasional drops)', 'Poor/Limited', 'Mobile data only'] },
          { key: 'preferred_platform', label: 'Preferred video platform (e.g. Zoom, Teams, MyChart)', type: 'text' },
          { key: 'tech_comfort', label: 'Comfort level with video calls', type: 'select', options: ['Very comfortable', 'Comfortable', 'Needs assistance', 'Prefers phone'] },
        ],
      },
      {
        id: 'comm_preferences',
        title: 'Communication Preferences',
        description: 'How and when you prefer to be contacted.',
        fields: [
          { key: 'preferred_contact', label: 'Preferred contact method', type: 'select', options: ['Phone call', 'Text message', 'Email', 'Patient portal message'] },
          { key: 'best_contact_time', label: 'Best time to reach you', type: 'select', options: ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Anytime'] },
          { key: 'pharmacy_name', label: 'Preferred pharmacy name', type: 'text' },
          { key: 'pharmacy_phone', label: 'Preferred pharmacy phone', type: 'tel' },
        ],
      },
    ],
  },
  {
    id: 'disability',
    title: 'Disability Accommodations',
    subtitle: 'Ensures providers can make appropriate accommodations for your visit.',
    sections: [
      {
        id: 'physical_accommodations',
        title: 'Physical & Mobility',
        description: 'Mobility aids and physical accessibility needs.',
        fields: [
          { key: 'mobility_aids', label: 'Mobility aids used (wheelchair, walker, cane, etc.)', type: 'textarea' },
          { key: 'transfer_assistance', label: 'Do you need assistance transferring to an exam table?', type: 'select', options: ['Yes', 'No', 'Sometimes'] },
          { key: 'parking_needs', label: 'Accessible parking or entrance needs', type: 'textarea' },
        ],
      },
      {
        id: 'sensory_accommodations',
        title: 'Sensory & Communication',
        description: 'Vision, hearing, and communication accommodations.',
        fields: [
          { key: 'hearing_aids', label: 'Hearing aids or cochlear implant?', type: 'select', options: ['Yes', 'No'] },
          { key: 'sign_language', label: 'Sign language interpreter needed?', type: 'select', options: ['Yes', 'No', 'Preferred but not required'] },
          { key: 'vision_impairment', label: 'Vision impairment or need for large-print materials?', type: 'textarea' },
          { key: 'language_preference', label: 'Preferred spoken language or interpreter needs', type: 'text' },
        ],
      },
      {
        id: 'other_accommodations',
        title: 'Other Accommodations',
        description: 'Cognitive, sensory sensitivities, and any additional needs.',
        fields: [
          { key: 'cognitive_accommodations', label: 'Cognitive or learning accommodations needed (e.g. simplified instructions, extra time)', type: 'textarea' },
          { key: 'sensory_sensitivities', label: 'Sensory sensitivities (e.g. bright lights, strong smells, noise)', type: 'textarea' },
          { key: 'support_person', label: 'Do you bring a support person or caregiver to appointments?', type: 'select', options: ['Always', 'Sometimes', 'Never'] },
          { key: 'other_needs', label: 'Any other accommodation requests', type: 'textarea' },
        ],
      },
    ],
  },
  {
    id: 'insurance',
    title: 'Insurance & Billing',
    subtitle: 'Required for most medical intake forms and billing purposes.',
    sections: [
      {
        id: 'primary_insurance',
        title: 'Primary Insurance',
        description: 'Your main health insurance plan.',
        fields: [
          { key: 'insurer_name', label: 'Insurance company name', type: 'text' },
          { key: 'plan_name', label: 'Plan name or type (e.g. BlueCross PPO)', type: 'text' },
          { key: 'member_id', label: 'Member ID / Policy number', type: 'text' },
          { key: 'group_number', label: 'Group number', type: 'text' },
          { key: 'subscriber_name', label: 'Primary subscriber name (if not you)', type: 'text' },
          { key: 'subscriber_dob', label: 'Primary subscriber date of birth (if not you)', type: 'date' },
        ],
      },
      {
        id: 'secondary_insurance',
        title: 'Secondary Insurance',
        description: 'Secondary coverage, if any.',
        fields: [
          { key: 'secondary_insurer', label: 'Secondary insurance company', type: 'text' },
          { key: 'secondary_member_id', label: 'Secondary member ID / Policy number', type: 'text' },
        ],
      },
    ],
  },
  {
    id: 'surgical_history',
    title: 'Surgical & Procedure History',
    subtitle: 'Common on specialist intake forms and pre-operative screenings.',
    sections: [
      {
        id: 'surgeries',
        title: 'Past Surgeries',
        description: 'Surgical procedures you have had.',
        fields: [
          { key: 'surgery_list', label: 'Surgeries (include procedure and approximate year)', type: 'textarea' },
          { key: 'complications', label: 'Any complications from past surgeries or anesthesia', type: 'textarea' },
        ],
      },
      {
        id: 'implants_devices',
        title: 'Implants & Medical Devices',
        description: 'Implanted devices that may affect treatment or imaging.',
        fields: [
          { key: 'implants', label: 'Implants or medical devices (pacemaker, stent, joint replacement, etc.)', type: 'textarea' },
          { key: 'mri_safe', label: 'Any known MRI contraindications?', type: 'select', options: ['Yes', 'No', 'Not sure'] },
        ],
      },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Social History',
    subtitle: 'Frequently asked on primary care, cardiology, and behavioral health forms.',
    sections: [
      {
        id: 'occupation_habits',
        title: 'Occupation & Daily Habits',
        description: 'Work and lifestyle factors that affect health.',
        fields: [
          { key: 'occupation', label: 'Current occupation or job title', type: 'text' },
          { key: 'exercise_frequency', label: 'Exercise frequency', type: 'select', options: ['Daily', '3–5 times/week', '1–2 times/week', 'Rarely', 'Never'] },
          { key: 'diet_notes', label: 'Dietary restrictions or patterns (vegetarian, diabetic diet, etc.)', type: 'textarea' },
        ],
      },
      {
        id: 'substance_use',
        title: 'Substance Use',
        description: 'Tobacco, alcohol, and substance use history — standard on most intake forms.',
        fields: [
          { key: 'tobacco', label: 'Tobacco use', type: 'select', options: ['Never', 'Former smoker', 'Current smoker', 'Vaping/e-cigarettes', 'Smokeless tobacco'] },
          { key: 'alcohol', label: 'Alcohol use', type: 'select', options: ['None', 'Occasional (social)', 'Moderate (1–2 drinks/day)', 'Heavy (3+ drinks/day)'] },
          { key: 'recreational_drugs', label: 'Recreational drug use (current or past)', type: 'textarea' },
        ],
      },
    ],
  },
]

// Flat list used by PatientOnboarding wizard
export const SECTIONS: Section[] = SECTION_GROUPS.flatMap(g => g.sections)
