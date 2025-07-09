import fs from 'fs/promises'
import { TransformationRule } from '../runner.js'
import { logger } from '../utils/logger.js'

export interface TransformOptions {
  dryRun: boolean
}

class CssTransformer {
  async apply(rule: TransformationRule, files: string[], options: TransformOptions): Promise<number> {
    let changesCount = 0
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const newContent = this.applyRule(rule, content)
        
        if (newContent !== content) {
          changesCount++
          
          if (options.dryRun) {
            logger.file('modified', file)
            logger.debug(`Would apply rule ${rule.id} to ${file}`)
          } else {
            await fs.writeFile(file, newContent, 'utf-8')
            logger.file('modified', file)
            logger.debug(`Applied rule ${rule.id} to ${file}`)
          }
        }
      } catch (error) {
        logger.error(`Failed to process ${file}:`, error)
      }
    }
    
    return changesCount
  }
  
  private applyRule(rule: TransformationRule, content: string): string {
    // Simple string replacement for CSS rules
    // Convert YAML pattern/fix to regex if needed
    const pattern = rule.pattern.replace(/"/g, '')
    const fix = rule.fix.replace(/"/g, '')
    
    // Handle simple string replacement
    if (content.includes(pattern)) {
      return content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix)
    }
    
    return content
  }
}

export const cssTransformer = new CssTransformer() 