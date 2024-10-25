export interface FormConfig {
  emailTo: string
  smtpHost: string
  smtpPort: string
  installDependencies: boolean
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}
