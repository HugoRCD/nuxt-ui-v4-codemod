import fs from 'fs/promises'
import { logger } from '../../utils/logger.js'
import { jsParser } from '../../utils/js-parser.js'

export interface MergeOptions {
  dryRun: boolean
}

export class NuxtUiConfigMerger {
  async mergeUiProToUi(filePath: string, options: MergeOptions): Promise<number> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const newContent = this.mergeUiProConfig(content)
      
      if (newContent !== content) {
        if (options.dryRun) {
          logger.file('modified', filePath)
          logger.debug('Would merge uiPro config into ui section')
        } else {
          await fs.writeFile(filePath, newContent, 'utf-8')
          logger.file('modified', filePath)
          logger.debug('Merged uiPro config into ui section')
        }
        return 1
      }
      
      return 0
    } catch (error) {
      logger.error(`Failed to process ${filePath}:`, error)
      return 0
    }
  }

  private mergeUiProConfig(content: string): string {
    try {
      const configObject = jsParser.parseAppConfig(content)
      
      if (!configObject || !configObject.uiPro) {
        return content
      }
      
      if (!configObject.ui) {
        configObject.ui = {}
      }
      
      configObject.ui = { ...configObject.ui, ...configObject.uiPro }
      delete configObject.uiPro
      
      return jsParser.reconstructAppConfig(configObject)
    } catch (error) {
      logger.error('Failed to parse app config:', error)
      return content
    }
  }
}

export const nuxtUiConfigMerger = new NuxtUiConfigMerger() 