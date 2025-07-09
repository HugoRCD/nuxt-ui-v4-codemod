import glob from 'fast-glob'
import path from 'path'

export interface FilePattern {
  include: string[]
  exclude: string[]
}

class FileScanner {
  async findFiles(projectPath: string, patterns: FilePattern): Promise<string[]> {
    const { include, exclude } = patterns
    
    const files = await glob(include, {
      cwd: projectPath,
      ignore: exclude,
      absolute: true
    })
    
    return files
  }
  
  async findProjectFiles(projectPath: string): Promise<{
    css: string[]
    typescript: string[]
    json: string[]
    vue: string[]
  }> {
    const baseExclude = ['**/node_modules/**', '**/dist/**', '**/.nuxt/**', '**/coverage/**']
    
    const [css, typescript, json, vue] = await Promise.all([
      this.findFiles(projectPath, {
        include: ['**/*.css', '**/*.scss', '**/*.sass'],
        exclude: baseExclude
      }),
      this.findFiles(projectPath, {
        include: ['**/*.ts', '**/*.js', '**/nuxt.config.*', '**/app.config.*'],
        exclude: [...baseExclude, '**/*.d.ts']
      }),
      this.findFiles(projectPath, {
        include: ['**/package.json'],
        exclude: baseExclude
      }),
      this.findFiles(projectPath, {
        include: ['**/*.vue'],
        exclude: baseExclude
      })
    ])
    
    return { css, typescript, json, vue }
  }
}

export const fileScanner = new FileScanner() 