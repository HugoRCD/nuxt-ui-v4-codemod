import path from 'path'
import { ruleLoader } from './utils/rule-loader.js'
import { customRuleLoader } from './utils/custom-rule-loader.js'
import { fileScanner } from './utils/file-scanner.js'
import { logger } from './utils/logger.js'
import { cssTransformer } from './transformers/css.js'
import { typescriptTransformer } from './transformers/typescript.js'
import { jsonTransformer } from './transformers/json.js'
import { customTransformer } from './transformers/custom.js'
import { CustomRule } from './types/custom-rule.js'

export interface RunnerOptions {
  target: string
  dryRun: boolean
  verbose: boolean
}

export interface TransformationRule {
  id: string
  type: 'css' | 'typescript' | 'json'
  pattern: string
  fix: string
  include?: string[]
  exclude?: string[]
}

export class CodemodRunner {
  async run(options: RunnerOptions): Promise<void> {
    logger.info('Starting Nuxt UI v4 migration...')
    
    const rulesPath = path.join(process.cwd(), 'rules')
    const customRulesPath = path.join(process.cwd(), 'dist', 'custom')
    
    const [yamlRules, customRules] = await Promise.all([
      ruleLoader.loadRules(rulesPath),
      customRuleLoader.loadCustomRules(customRulesPath)
    ])
    
    let totalChanges = 0

    logger.info(`\nApplying ${yamlRules.length} YAML rules...`)
    for (const rule of yamlRules) {
      const changes = await this.applyYamlRule(rule, options)
      totalChanges += changes
    }

    logger.info(`\nApplying ${customRules.length} custom rules...`)
    for (const rule of customRules) {
      const changes = await this.applyCustomRule(rule, options)
      totalChanges += changes
    }

    if (options.dryRun) {
      logger.success(`\nDry run complete! Would apply ${totalChanges} changes`)
      logger.info('Run with --apply to apply changes')
    } else {
      logger.success(`\nMigration complete! Applied ${totalChanges} changes`)
    }
  }

  private async applyYamlRule(rule: TransformationRule, options: RunnerOptions): Promise<number> {
    logger.info(`\nApplying rule: ${rule.id}`)
    
    const includePatterns = rule.include || this.getDefaultIncludePatterns(rule.type)
    const excludePatterns = rule.exclude || ['**/node_modules/**', '**/dist/**', '**/.nuxt/**']
    
    const files = await fileScanner.findFiles(options.target, {
      include: includePatterns,
      exclude: excludePatterns
    })

    if (files.length === 0) {
      logger.warn(`No files found for rule ${rule.id}`)
      return 0
    }

    logger.info(`Found ${files.length} files to process`)

    const changes = await this.applyRule(rule, files, {
      dryRun: options.dryRun,
      verbose: options.verbose
    })

    logger.info(`Applied ${changes} changes`)
    return changes
  }

  private async applyCustomRule(rule: CustomRule, options: RunnerOptions): Promise<number> {
    logger.info(`\nApplying custom rule: ${rule.id}`)
    logger.info(`Description: ${rule.description}`)
    
    const excludePatterns = rule.excludePatterns || ['**/node_modules/**', '**/dist/**', '**/.nuxt/**']
    
    const files = await fileScanner.findFiles(options.target, {
      include: rule.filePatterns,
      exclude: excludePatterns
    })

    if (files.length === 0) {
      logger.warn(`No files found for custom rule ${rule.id}`)
      return 0
    }

    logger.info(`Found ${files.length} files to process`)

    const changes = await customTransformer.apply(rule, files, {
      dryRun: options.dryRun,
      verbose: options.verbose
    })

    logger.info(`Applied ${changes} changes`)
    return changes
  }

  private async applyRule(rule: TransformationRule, files: string[], options: { dryRun: boolean, verbose: boolean }): Promise<number> {
    switch (rule.type) {
      case 'css':
        return await cssTransformer.apply(rule, files, options)
      case 'typescript':
        return await typescriptTransformer.apply(rule, files, options)
      case 'json':
        return await jsonTransformer.apply(rule, files, options)
      default:
        logger.error(`Unknown rule type: ${rule.type}`)
        return 0
    }
  }

  private getDefaultIncludePatterns(type: string): string[] {
    switch (type) {
      case 'css':
        return ['**/*.css', '**/*.scss', '**/*.sass', '**/*.less']
      case 'typescript':
        return ['**/*.ts', '**/*.js', '**/*.vue']
      case 'json':
        return ['**/package.json']
      default:
        return ['**/*']
    }
  }
}

export const runner = new CodemodRunner() 