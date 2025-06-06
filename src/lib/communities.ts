export const COMMUNITIES = {
  'general': 'Γενικά',
  'technologia': 'Τεχνολογία', 
  'politiki': 'Πολιτική',
  'athlitika': 'Αθλητικά',
  'psichagogia': 'Ψυχαγωγία',
  'oikonomia': 'Οικονομία',
  'ekpaideysi': 'Εκπαίδευση',
  'ygeia': 'Υγεία',
  'koinonia': 'Κοινωνία',
  'epistimi': 'Επιστήμη'
} as const

export type CommunityKey = keyof typeof COMMUNITIES

export function getCommunityDisplayName(key: string): string {
  return COMMUNITIES[key as CommunityKey] || key
}

export function getCommunityUrl(key: string): string {
  return `/c/${key}`
}