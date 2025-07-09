import chalk from 'chalk'

class Logger {
  private verbose = false

  setVerbose(verbose: boolean) {
    this.verbose = verbose
  }

  info(message: string, ...args: any[]) {
    console.log(chalk.blue('ℹ'), message, ...args)
  }

  success(message: string, ...args: any[]) {
    console.log(chalk.green('✓'), message, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.log(chalk.yellow('⚠'), message, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(chalk.red('✗'), message, ...args)
  }

  debug(message: string, ...args: any[]) {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message, ...args)
    }
  }

  file(operation: 'modified' | 'created' | 'skipped', filePath: string) {
    const icon = operation === 'modified' ? '📝' : operation === 'created' ? '📄' : '⏭️'
    const color = operation === 'modified' ? 'yellow' : operation === 'created' ? 'green' : 'gray'
    console.log(chalk[color](icon), filePath)
  }
}

export const logger = new Logger() 