import fs from 'fs/promises'
import path from 'path'
import { parse as parseYaml } from 'yaml'
import { TransformationRule } from '../runner.js'
import { logger } from './logger.js'

interface RawRule {
  id: string
  language: string
  pattern: string
  fix: string
  include?: string[]
  exclude?: string[]
}

class RuleLoader {
  async loadRules(rulesPath: string): Promise<TransformationRule[]> {
    try {
      const ruleFiles = await fs.readdir(rulesPath)
      const yamlFiles = ruleFiles.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
      
      const rules: TransformationRule[] = []
      
      for (const file of yamlFiles) {
        try {
          const filePath = path.join(rulesPath, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const rawRule = parseYaml(content) as RawRule
          
          if (rawRule.id && rawRule.language && rawRule.pattern && rawRule.fix) {
            const rule: TransformationRule = {
              id: rawRule.id,
              type: this.mapLanguageToType(rawRule.language),
              pattern: rawRule.pattern,
              fix: rawRule.fix,
              include: rawRule.include,
              exclude: rawRule.exclude
            }
            rules.push(rule)
            logger.debug(`Loaded rule: ${rule.id}`)
          } else {
            logger.warn(`Invalid rule format in ${file}`)
          }
        } catch (error) {
          logger.warn(`Failed to load rule from ${file}:`, error)
        }
      }
      
      return rules
    } catch (error) {
      logger.error(`Failed to load rules from ${rulesPath}:`, error)
      return []
    }
  }
  
  async loadRule(rulePath: string): Promise<TransformationRule | null> {
    try {
      const content = await fs.readFile(rulePath, 'utf-8')
      const rawRule = parseYaml(content) as RawRule
      
      if (rawRule.id && rawRule.language && rawRule.pattern && rawRule.fix) {
        return {
          id: rawRule.id,
          type: this.mapLanguageToType(rawRule.language),
          pattern: rawRule.pattern,
          fix: rawRule.fix,
          include: rawRule.include,
          exclude: rawRule.exclude
        }
      } else {
        logger.warn(`Invalid rule format in ${rulePath}`)
        return null
      }
    } catch (error) {
      logger.error(`Failed to load rule from ${rulePath}:`, error)
      return null
    }
  }

  private mapLanguageToType(language: string): 'css' | 'typescript' | 'json' {
    switch (language.toLowerCase()) {
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return 'css'
      case 'typescript':
      case 'javascript':
      case 'ts':
      case 'js':
      case 'vue':
        return 'typescript'
      case 'json':
        return 'json'
      default:
        logger.warn(`Unknown language: ${language}, defaulting to typescript`)
        return 'typescript'
    }
  }
}

export const ruleLoader = new RuleLoader() 