import inquirer from 'inquirer'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import type { FormConfig } from '../types/index.js'

const currentFilePath = fileURLToPath(
  import.meta.url
)
const currentDirPath = dirname(currentFilePath)

async function generateTemplate(
  templatePath: string,
  config?: FormConfig
): Promise<string> {
  const content = await fs.readFile(
    templatePath,
    'utf-8'
  )

  if (!config) return content

  const replacements: Record<string, string> = {
    '{{EMAIL_TO}}': config.emailTo,
    '{{SMTP_HOST}}': config.smtpHost,
    '{{SMTP_PORT}}': config.smtpPort,
  }

  return Object.entries(replacements).reduce(
    (acc, [key, value]) =>
      acc.replace(key, value),
    content
  )
}

export async function init() {
  console.log(
    chalk.blue('🚀 Setting up contact form...')
  )

  const answers =
    await inquirer.prompt<FormConfig>([
      {
        type: 'input',
        name: 'emailTo',
        message:
          'Enter the email address to receive form submissions:',
        validate: (input: string) =>
          input.includes('@') ||
          'Please enter a valid email',
      },
      {
        type: 'input',
        name: 'smtpHost',
        message: 'Enter SMTP host:',
        default: 'smtp.gmail.com',
      },
      {
        type: 'input',
        name: 'smtpPort',
        message: 'Enter SMTP port:',
        default: '587',
      },
      {
        type: 'confirm',
        name: 'installDependencies',
        message:
          'Would you like to install required dependencies?',
        default: true,
      },
    ])

  try {
    console.log(
      chalk.blue('\n📁 Creating directories...')
    )

    const apiDir = path.join(
      process.cwd(),
      'app/api/send'
    )
    const contactDir = path.join(
      process.cwd(),
      'app/contact'
    )

    await fs.ensureDir(apiDir)
    await fs.ensureDir(contactDir)

    console.log(
      chalk.blue('\n📝 Creating files...')
    )

    // 生成文件内容
    const apiTemplate = path.join(
      currentDirPath,
      '../templates/api.route.template.ts'
    )
    const formTemplate = path.join(
      currentDirPath,
      '../templates/form.component.template.ts'
    )

    const apiContent = await generateTemplate(
      apiTemplate,
      answers
    )
    const formContent = await generateTemplate(
      formTemplate
    )

    // 写入文件
    await fs.writeFile(
      path.join(apiDir, 'route.ts'),
      apiContent
    )
    await fs.writeFile(
      path.join(contactDir, 'page.tsx'),
      formContent
    )

    console.log(
      chalk.blue(
        '\n⚙️  Creating environment variables...'
      )
    )

    const envContent = `
# Contact Form Configuration
SMTP_HOST=${answers.smtpHost}
SMTP_PORT=${answers.smtpPort}
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=your-email@example.com

# Vercel KV Configuration
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
`.trim()

    await fs.appendFile(
      path.join(process.cwd(), '.env.local'),
      envContent
    )

    if (answers.installDependencies) {
      console.log(
        chalk.blue(
          '\n📦 Installing dependencies...'
        )
      )
      const { execSync } = await import(
        'child_process'
      )
      execSync(
        'npm install nodemailer @vercel/kv',
        { stdio: 'inherit' }
      )
    }

    console.log(
      chalk.green(
        '\n✨ Contact form setup completed successfully!'
      )
    )
    console.log(chalk.yellow('\n📝 Next steps:'))
    console.log(
      '1. Configure your SMTP credentials in .env.local'
    )
    console.log(
      '2. Set up your Vercel KV database'
    )
    console.log(
      '3. Add your contact form to any page using:'
    )
    console.log(
      chalk.cyan(
        "\n  import ContactForm from './app/contact/page'\n"
      )
    )

    if (answers.smtpHost.includes('gmail')) {
      console.log(
        chalk.yellow('\n📧 Gmail SMTP Setup:')
      )
      console.log(
        '1. Enable 2-Step Verification in your Google Account'
      )
      console.log(
        '2. Generate an App Password at: https://myaccount.google.com/apppasswords'
      )
      console.log(
        '3. Use your Gmail address as SMTP_USER and the App Password as SMTP_PASS'
      )
    }
  } catch (error) {
    console.error(
      chalk.red(
        '\n❌ Error setting up contact form:'
      ),
      error
    )
    if (error instanceof Error) {
      console.error(
        chalk.red('Error details:'),
        error.message
      )
    }
    process.exit(1)
  }
}
