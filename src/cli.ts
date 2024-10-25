#!/usr/bin/env node

import { Command } from 'commander'
import { init } from './commands/init.js' // 添加 .js 扩展名

const program = new Command()

program
  .name('contact-form')
  .description(
    'CLI tool for adding contact form functionality to Next.js projects'
  )
  .version('1.0.0')

program
  .command('init')
  .description(
    'Initialize contact form components and API route'
  )
  .action(init)

program.parse()
