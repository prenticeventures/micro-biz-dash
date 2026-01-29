# Custom Email Setup for Supabase

**Last Updated:** January 29, 2026

## Overview

By default, Supabase sends authentication emails (signup confirmation, password reset, etc.) from `noreply@mail.supabase.io`. This document explains how to configure custom SMTP to send emails from your own domain.

## Current Configuration

- ✅ **Subject Line:** "Confirm your signup for Micro-Biz Dash"
- ⏳ **Sender Email:** `noreply@mail.supabase.io` (Supabase default)
- 📍 **Email Templates:** https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/auth/templates

## Why Use Custom SMTP?

**Benefits:**
- **Brand recognition:** Emails come from your domain (e.g., `noreply@yourdomain.com`)
- **Better deliverability:** Your domain's reputation matters
- **Professional appearance:** Users trust emails from your domain more than third-party services
- **Control:** Manage email sending limits and analytics

**Drawbacks:**
- Requires paid Supabase plan OR your own email service
- Additional configuration and maintenance
- Need to monitor email deliverability

---

## Setup Options

### Option 1: Use Supabase Pro Plan SMTP

**Requirements:**
- Supabase Pro plan ($25/month)
- Includes built-in SMTP with custom sender

**Steps:**
1. Upgrade to Pro: https://supabase.com/dashboard/org/xutaxqbzwcjjshpewrhv/billing
2. Go to Auth Settings: https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/settings/auth
3. Enable "Custom SMTP" under SMTP Settings
4. Configure sender email and SMTP details (provided by Supabase Pro)

---

### Option 2: Use Your Own Email Service

**Recommended Services:**

#### 1. SendGrid (Recommended for Apps)
- **Free tier:** 100 emails/day forever
- **Paid:** $19.95/month for 50,000 emails
- **Website:** https://sendgrid.com
- **Best for:** Production apps with moderate email volume

#### 2. Mailgun
- **Free tier:** 5,000 emails/month for 3 months
- **Paid:** $35/month for 50,000 emails
- **Website:** https://mailgun.com
- **Best for:** Developer-friendly API, good documentation

#### 3. AWS SES (Simple Email Service)
- **Cost:** $0.10 per 1,000 emails (very cheap)
- **Website:** https://aws.amazon.com/ses/
- **Best for:** High volume, low cost (but more complex setup)

#### 4. Gmail SMTP (Testing Only)
- **Free tier:** Up to 500 emails/day
- **Best for:** Development/testing only (not recommended for production)
- **Note:** Requires Google account with "App Password" (2FA must be enabled)

---

## Configuration Steps

### Step 1: Get SMTP Credentials

Choose one of the services above and sign up. You'll need:
- **SMTP Host** (e.g., `smtp.sendgrid.net`)
- **SMTP Port** (usually 587 for TLS or 465 for SSL)
- **SMTP Username** (often your email or API key)
- **SMTP Password** (API key or app-specific password)
- **Sender Email** (e.g., `noreply@yourdomain.com`)

### Step 2: Configure in Supabase

1. **Go to Auth Settings:**  
   https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/settings/auth

2. **Scroll to "SMTP Settings"**

3. **Enable "Enable Custom SMTP"**

4. **Enter your SMTP credentials:**
   ```
   Sender email: noreply@yourdomain.com
   Sender name: Micro-Biz Dash
   
   Host: smtp.sendgrid.net (or your provider's host)
   Port: 587 (or 465 for SSL)
   Username: apikey (SendGrid) or your username
   Password: YOUR_API_KEY_OR_PASSWORD
   ```

5. **Click "Save"**

### Step 3: Test Email Sending

1. **Trigger a test signup** in your development environment
2. **Check your inbox** for the confirmation email
3. **Verify sender email** shows your custom domain
4. **Check spam folder** if email doesn't arrive

---

## Example: SendGrid Setup

### 1. Create SendGrid Account
- Go to https://sendgrid.com
- Sign up (free tier includes 100 emails/day)

### 2. Verify Your Domain (Recommended)
- In SendGrid dashboard, go to **Settings → Sender Authentication**
- Click "Verify a Single Sender" (quick) OR "Authenticate Your Domain" (better deliverability)
- Follow the verification steps

### 3. Create API Key
- Go to **Settings → API Keys**
- Click "Create API Key"
- Name: `Supabase Auth Emails`
- Permission: "Restricted Access" → Enable "Mail Send" only
- Copy the API key (you won't see it again!)

### 4. Configure in Supabase
```
Sender email: noreply@yourdomain.com (or verified email)
Sender name: Micro-Biz Dash

Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [paste your API key]
```

### 5. Test
- Sign up with a test email
- Check deliverability in SendGrid dashboard

---

## Example: Gmail SMTP (Development Only)

⚠️ **Not recommended for production** - Gmail has daily limits and may mark your emails as spam.

### 1. Enable 2-Factor Authentication
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification

### 2. Create App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (custom name)"
- Name it "Supabase SMTP"
- Copy the 16-character password

### 3. Configure in Supabase
```
Sender email: youremail@gmail.com
Sender name: Micro-Biz Dash

Host: smtp.gmail.com
Port: 587
Username: youremail@gmail.com
Password: [16-character app password]
```

---

## Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials** - Verify host, port, username, password
2. **Check service status** - Is your email service down?
3. **Check sending limits** - Have you hit your daily/monthly limit?
4. **Check Supabase logs** - https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/logs/edge-logs

### Emails Going to Spam

1. **Verify your domain** with your email service (SPF, DKIM, DMARC records)
2. **Use a professional sender email** (`noreply@` or `hello@` not `test@`)
3. **Avoid spam trigger words** in subject/content
4. **Monitor email reputation** using your provider's dashboard
5. **Warm up your domain** - Start with low volume, gradually increase

### Wrong Sender Email

1. **Check Supabase SMTP settings** - Make sure sender email is correct
2. **Check email service verification** - Sender must be verified with your provider
3. **Clear browser cache** and test again

---

## Best Practices

### 1. Use Separate Emails for Different Types
- `noreply@yourdomain.com` - Auth emails (signup, password reset)
- `hello@yourdomain.com` - User communications
- `support@yourdomain.com` - Support tickets

### 2. Monitor Deliverability
- Check bounce rates in your email service dashboard
- Monitor spam complaints
- Keep email reputation high

### 3. Keep Templates Clear
- Use clear subject lines (e.g., "Confirm your signup for Micro-Biz Dash")
- Include your app name and logo
- Make action buttons obvious (big, clear text)
- Add unsubscribe link for marketing emails (not required for auth)

### 4. Test Regularly
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Check mobile rendering
- Verify links work correctly

---

## Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **SendGrid** | 100/day | $19.95/mo (50K) | Most apps |
| **Mailgun** | 5K/mo (3 mo) | $35/mo (50K) | Developer-friendly |
| **AWS SES** | 3K/mo (1 yr) | $0.10/1K | High volume |
| **Gmail** | 500/day | N/A | Dev/testing only |
| **Supabase Pro** | N/A | $25/mo + SMTP | All-in-one |

---

## Current Status

- ✅ Email subject line: "Confirm your signup for Micro-Biz Dash"
- ⏳ Custom SMTP: Not configured (using Supabase default)
- 📋 Recommendation: Set up SendGrid when ready for production

---

## Next Steps

When you're ready to set up custom SMTP:

1. Choose an email service (recommend SendGrid for ease of use)
2. Sign up and verify your domain
3. Get SMTP credentials
4. Configure in Supabase (follow steps above)
5. Test with a signup in development
6. Monitor deliverability for first few days

---

## Resources

- **Supabase SMTP Docs:** https://supabase.com/docs/guides/auth/auth-smtp
- **SendGrid Setup:** https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp
- **Email Deliverability Guide:** https://sendgrid.com/blog/email-deliverability-guide/
- **Auth Email Templates:** https://supabase.com/dashboard/project/zbtbtmybzuutxfntdyvp/auth/templates
