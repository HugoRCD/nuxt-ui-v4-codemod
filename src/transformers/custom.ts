import fs from 'fs/promises'
import { CustomRule, CustomRuleOptions } from '../types/custom-rule.js'
import { logger } from '../utils/logger.js'

class CustomTransformer {
  async apply(rule: CustomRule, files: string[], options: CustomRuleOptions): Promise<number> {
    let changesCount = 0
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8')
        const result = await rule.transform(content, file, options)
        
        if (result.changed && result.content) {
          changesCount++
          
          if (options.dryRun) {
            logger.file('modified', file)
            if (result.message) {
              logger.debug(result.message)
            }
          } else {
            await fs.writeFile(file, result.content, 'utf-8')
            logger.file('modified', file)
            if (result.message) {
              logger.debug(result.message)
            }
          }
        }
      } catch (error) {
        logger.error(`Failed to process ${file}:`, error)
      }
    }
    
    return changesCount
  }
}

export const customTransformer = new CustomTransformer() 