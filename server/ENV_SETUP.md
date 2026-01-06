# Server Environment Setup Guide

To enable the password reset functionality, you can use either **Gmail** OR a **Custom SMTP Service** (like ServerSMTP, SMTP2GO, SendGrid, etc.).

## Option 1: Custom SMTP (Recommended for `serversmtp.com`)

If you are using a service like **ServerSMTP**, **SendGrid**, or **Mailgun**, add these lines to your `server/.env` file:

```env
# SMTP Configuration
SMTP_HOST=mail.your-smtp-provider.com  # e.g., mail.serversmtp.com
SMTP_PORT=587                          # Usually 587 or 465 or 2525
SMTP_EMAIL=your-smtp-username          # Username provided by the service
SMTP_PASSWORD=your-smtp-password       # Password provided by the service

# Important: The email address you want to appear as the sender
# (Required if your SMTP username is NOT a valid email address)
SENDER_EMAIL=your-verified-sender@yourdomain.com

CLIENT_URL=http://localhost:5173
```

> **Note:** If you use this method, you do **NOT** need `EMAIL_USERNAME` or `EMAIL_PASSWORD`.

## Option 2: Gmail (Development)

If you prefer to use a personal **Gmail** account:

```env
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password       # Generated App Password
CLIENT_URL=http://localhost:5173
```

- **How to generate Gmail App Password:**
  1. Go to **Google Account** > **Security** > **2-Step Verification**.
  2. Search for **App passwords**.
  3. Create one named "Budgetly" and use the 16-character code.

## 3. No Email (Local Testing)

If no variables are set, emails will be logged to the **server console**.
