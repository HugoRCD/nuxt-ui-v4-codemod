import fs from 'fs/promises'
import path from 'path'
import { CustomRule } from '../types/custom-rule.js'
import { logger } from './logger.js'

class CustomRuleLoader {
  async loadCustomRules(customRulesPath: string): Promise<CustomRule[]> {
    try {
      const ruleFiles = await fs.readdir(customRulesPath)
      const tsFiles = ruleFiles.filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      
      const rules: CustomRule[] = []
      
      for (const file of tsFiles) {
        try {
          const filePath = path.join(customRulesPath, file)
          const absolutePath = path.resolve(filePath)
          
          const module = await import(absolutePath)
          
          for (const exportName of Object.keys(module)) {
            const exportedRule = module[exportName]
            if (this.isValidCustomRule(exportedRule)) {
              rules.push(exportedRule)
              logger.debug(`Loaded custom rule: ${exportedRule.id}`)
            }
          }
        } catch (error) {
          logger.warn(`Failed to load custom rule from ${file}:`, error)
        }
      }
      
      return rules
    } catch (error) {
      logger.error(`Failed to load custom rules from ${customRulesPath}:`, error)
      return []
    }
  }

  private isValidCustomRule(obj: any): obj is CustomRule {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.description === 'string' &&
      Array.isArray(obj.filePatterns) &&
      typeof obj.transform === 'function'
    )
  }
}

export const customRuleLoader = new CustomRuleLoader() 