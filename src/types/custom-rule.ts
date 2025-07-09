export interface CustomRuleOptions {
  dryRun: boolean
  verbose: boolean
}

export interface CustomRuleResult {
  changed: boolean
  content?: string
  message?: string
}

export interface CustomRule {
  id: string
  description: string
  filePatterns: string[]
  excludePatterns?: string[]
  transform: (content: string, filePath: string, options: CustomRuleOptions) => Promise<CustomRuleResult> | CustomRuleResult
} 