#!/usr/bin/env node

import { program } from 'commander'
import { runner } from './runner.js'

program
  .name('nuxt-ui-v4-upgrade')
  .description('Migrate from Nuxt UI Pro to Nuxt UI v4')
  .version('1.0.0')

program
  .option('--target <path>', 'Target project directory', process.cwd())
  .option('--apply', 'Apply changes (default is dry-run)')
  .option('--verbose', 'Verbose output', false)
  .action(async (options) => {
    try {
      await runner.run({
        target: options.target,
        dryRun: !options.apply,
        verbose: options.verbose
      })
    } catch (error) {
      console.error('Error running migration:', error)
      process.exit(1)
    }
  })

program.parse() 