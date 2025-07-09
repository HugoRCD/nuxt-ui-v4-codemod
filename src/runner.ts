import path from 'path'
import { ruleLoader } from './utils/rule-loader.js'
import { fileScanner } from './utils/file-scanner.js'
import { logger } from './utils/logger.js'
import { cssTransformer } from './transformers/css.js'
import { typescriptTransformer } from './transformers/typescript.js'
import { jsonTransformer } from './transformers/json.js'
import { nuxtUiConfigMerger } from './transformers/nuxt-ui/merge-uipro-config.js'

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
    const rules = await ruleLoader.loadRules(rulesPath)
    let totalChanges = 0

    for (const rule of rules) {
      logger.info(`\nApplying rule: ${rule.id}`)
      
      const includePatterns = rule.include || this.getDefaultIncludePatterns(rule.type)
      const excludePatterns = rule.exclude || ['**/node_modules/**', '**/dist/**', '**/.nuxt/**']
      
      const files = await fileScanner.findFiles(options.target, {
        include: includePatterns,
        exclude: excludePatterns
      })

      if (files.length === 0) {
        logger.warn(`No files found for rule ${rule.id}`)
        continue
      }

      logger.info(`Found ${files.length} files to process`)

      const changes = await this.applyRule(rule, files, {
        dryRun: options.dryRun,
        verbose: options.verbose
      })

      totalChanges += changes
      logger.info(`Applied ${changes} changes`)
    }

    const appConfigFiles = await fileScanner.findFiles(options.target, {
      include: ['**/app.config.{ts,js}'],
      exclude: ['**/node_modules/**']
    })

    if (appConfigFiles.length > 0) {
      logger.info('\nMerging uiPro config into ui section...')
      
      for (const file of appConfigFiles) {
        const changes = await nuxtUiConfigMerger.mergeUiProToUi(file, {
          dryRun: options.dryRun
        })
        totalChanges += changes
      }
    }

    if (options.dryRun) {
      logger.success(`\nDry run complete! Would apply ${totalChanges} changes`)
      logger.info('Run with --apply to apply changes')
    } else {
      logger.success(`\nMigration complete! Applied ${totalChanges} changes`)
    }
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