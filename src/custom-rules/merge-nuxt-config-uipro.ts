import { CustomRule, CustomRuleResult, CustomRuleOptions } from '../types/custom-rule.js'

export const mergeNuxtConfigUiPro: CustomRule = {
  id: 'merge-nuxt-config-uipro',
  description: 'Merge uiPro configuration into ui section in nuxt.config.ts',
  filePatterns: ['**/nuxt.config.{ts,js}'],
  excludePatterns: ['**/node_modules/**'],
  
  transform: (content: string, filePath: string, options: CustomRuleOptions): CustomRuleResult => {
    try {
      const uiProMatch = content.match(/uiPro:\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      if (!uiProMatch) {
        return { changed: false }
      }
      
      const uiProContent = uiProMatch[1].trim()
      const uiMatch = content.match(/ui:\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      
      let newContent = content
      
      if (uiMatch) {
        const existingUiContent = uiMatch[1].trim()
        
        let mergedContent = existingUiContent
        if (!mergedContent.endsWith(',')) {
          mergedContent += ','
        }
        mergedContent += '\n    ' + uiProContent
        
        const mergedUiContent = `ui: {\n    ${mergedContent}\n  }`
        
        newContent = newContent.replace(uiMatch[0], mergedUiContent)
        newContent = newContent.replace(/,?\s*uiPro:\s*{[^}]+(?:{[^}]*}[^}]*)*}/s, '')
      } else {
        const newUiContent = `ui: {\n    ${uiProContent}\n  }`
        newContent = newContent.replace(uiProMatch[0], newUiContent)
      }
      
      return {
        changed: newContent !== content,
        content: newContent,
        message: 'Merged uiPro config into ui section in nuxt.config'
      }
    } catch (error) {
      if (options.verbose) {
        console.error(`Failed to parse ${filePath}:`, error)
      }
      return { changed: false }
    }
  }
} 