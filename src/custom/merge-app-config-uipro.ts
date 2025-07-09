import { CustomRule, CustomRuleResult, CustomRuleOptions } from '../types/custom-rule.js'
import { jsParser } from '../utils/js-parser.js'

export const mergeAppConfigUiPro: CustomRule = {
  id: 'merge-app-config-uipro',
  description: 'Merge uiPro configuration into ui section in app.config.ts',
  filePatterns: ['**/app.config.{ts,js}'],
  excludePatterns: ['**/node_modules/**'],
  
  transform: (content: string, filePath: string, options: CustomRuleOptions): CustomRuleResult => {
    try {
      const configObject = jsParser.parseAppConfig(content)
      
      if (!configObject || !configObject.uiPro) {
        return { changed: false }
      }
      
      if (!configObject.ui) {
        configObject.ui = {}
      }
      
      const hasChanges = Object.keys(configObject.uiPro).length > 0
      
      if (hasChanges) {
        configObject.ui = { ...configObject.ui, ...configObject.uiPro }
        delete configObject.uiPro
        
        const newContent = jsParser.reconstructAppConfig(configObject)
        
        return {
          changed: true,
          content: newContent,
          message: `Merged uiPro config into ui section`
        }
      }
      
      return { changed: false }
    } catch (error) {
      if (options.verbose) {
        console.error(`Failed to parse ${filePath}:`, error)
      }
      return { changed: false }
    }
  }
} 