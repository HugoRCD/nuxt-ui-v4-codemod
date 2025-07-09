export class JavaScriptParser {
  parseAppConfig(content: string): any {
    const configMatch = content.match(/export\s+default\s+defineAppConfig\s*\(\s*(\{[\s\S]*\})\s*\)/)
    if (!configMatch) {
      throw new Error('Could not find defineAppConfig')
    }
    
    const configStr = configMatch[1]
    
    try {
      return eval(`(${configStr})`)
    } catch (error) {
      throw new Error(`Failed to parse config object: ${error}`)
    }
  }

  reconstructAppConfig(configObject: any): string {
    const configStr = this.stringifyObject(configObject, 1)
    return `export default defineAppConfig(${configStr})`
  }

  private stringifyObject(obj: any, depth: number = 0): string {
    const indent = '  '.repeat(depth)
    const prevIndent = '  '.repeat(depth - 1)
    
    if (obj === null || obj === undefined) {
      return String(obj)
    }
    
    if (typeof obj === 'string') {
      return `'${obj.replace(/'/g, "\\'")}'`
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj)
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      const items = obj.map(item => `${indent}${this.stringifyObject(item, depth + 1)}`).join(',\n')
      return `[\n${items}\n${prevIndent}]`
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj)
      if (keys.length === 0) return '{}'
      
      const items = keys.map(key => {
        const value = this.stringifyObject(obj[key], depth + 1)
        return `${indent}${key}: ${value}`
      }).join(',\n')
      
      return `{\n${items}\n${prevIndent}}`
    }
    
    return String(obj)
  }
}

export const jsParser = new JavaScriptParser() 