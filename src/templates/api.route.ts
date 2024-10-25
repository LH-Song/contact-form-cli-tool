export function createApiTemplate(
  emailTo: string
) {
  return `import { createClient } from '@vercel/kv';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function createEmailContent(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  return \`
    <html>
      <body>
        <h1>New Contact Form Submission</h1>
        <p><strong>First Name:</strong> \${data.firstName}</p>
        <p><strong>Last Name:</strong> \${data.lastName}</p>
        <p><strong>Email:</strong> \${data.email}</p>
        <p><strong>Phone:</strong> \${data.phone}</p>
        <p><strong>Message:</strong> \${data.message}</p>
      </body>
    </html>
  \`;
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = \`rate_limit:\${clientIp}\`;

    const requestCount = await kv.incr(rateLimitKey);
    if (requestCount === 1) {
      await kv.expire(rateLimitKey, 86400);
    }

    if (requestCount > 50) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    const data = await req.json();
    const htmlContent = createEmailContent(data);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: '${emailTo}',
      subject: 'New Contact Form Submission',
      html: htmlContent,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}`
}
