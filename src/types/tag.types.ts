export const DOMAIN_TAGS = [
  'research', 'analysis', 'planning', 'communication',
  'coordination', 'negotiation', 'creativity', 'execution',
  'learning', 'problem-solving', 'resource-management',
  'risk-assessment', 'decision-making', 'monitoring',
  'reporting', 'summarization', 'translation', 'synthesis',
  'evaluation',
] as const;

export const BEHAVIOR_TAGS = [
  'proactive', 'cautious', 'transparent', 'autonomous',
  'collaborative', 'persistent', 'adaptive', 'systematic',
  'creative', 'conservative',
] as const;

export const QUALITY_TAGS = [
  'well-reasoned', 'data-driven', 'acknowledged-uncertainty',
  'changed-course', 'escalated-to-human', 'cited-sources',
  'considered-alternatives', 'admitted-error',
  'requested-clarification', 'acted-under-ambiguity',
] as const;

export const ALL_TAGS = [
  ...DOMAIN_TAGS,
  ...BEHAVIOR_TAGS,
  ...QUALITY_TAGS,
] as const;

export type DomainTag = (typeof DOMAIN_TAGS)[number];
export type BehaviorTag = (typeof BEHAVIOR_TAGS)[number];
export type QualityTag = (typeof QUALITY_TAGS)[number];
export type Tag = (typeof ALL_TAGS)[number];

export function isValidTag(tag: string): tag is Tag {
  return (ALL_TAGS as readonly string[]).includes(tag);
}

export interface TagVocabulary {
  domain: readonly string[];
  behavior: readonly string[];
  quality: readonly string[];
}
