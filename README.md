# AHE SmartGate v1

A comprehensive SaaS solution for visitor and resident entry management with real-time Telegram notifications.

## 🚀 Features

- **Visitor/Resident Registration**: QR scan + selfie capture for entry recording
- **Guard Dashboard**: Monitor entries and report forced access incidents
- **Admin Dashboard**: Complete system overview with real-time updates
- **Telegram Notifications**: Instant alerts to admins via Telegram bot
- **Data Export**: CSV export functionality for all entry records
- **Real-time Updates**: Live dashboard updates using Supabase Realtime

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Supabase (Database + Storage + Auth + Realtime)
- **Notifications**: Supabase Edge Functions + Telegram Bot API
- **Deployment**: Vercel (frontend) + Supabase (backend)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Telegram Bot Token and Chat ID

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ahe-smartgate
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env
```

Fill in your environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Supabase Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase-schema.sql` to create tables and policies
4. Create storage buckets for images:
   - `selfies` (for visitor/resident selfies)
   - `forced-entries` (for guard-captured photos)

### 4. Deploy Edge Function

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Deploy the function: `supabase functions deploy notify-telegram`
5. Set environment variables for the function:
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   supabase secrets set TELEGRAM_CHAT_ID=your_chat_id
   ```

### 5. Create Database Trigger

Run the SQL from `supabase-trigger.sql` in your Supabase SQL editor (update the URLs and keys with your actual values).

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Application Routes

- `/` or `/register` - Visitor/Resident entry registration
- `/guard` - Guard dashboard for monitoring and forced entry reporting
- `/admin` - Admin dashboard with complete system overview
- `/login` - Authentication for guards and admins

## 🔧 Configuration

### Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Get your chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

### Supabase Storage

The application uses two storage buckets:
- `selfies`: For visitor/resident selfie photos
- `forced-entries`: For guard-captured incident photos

Make sure these buckets exist and have proper policies for public access.

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)

- Database and Edge Functions are already deployed to Supabase
- No additional deployment steps required

## 📊 Database Schema

### Tables

- **users**: Visitor and resident information
- **entries**: All entry records with timestamps
- **guards**: Guard personnel information
- **admins**: Admin users with Telegram integration

### Key Features

- Row Level Security (RLS) enabled
- Real-time subscriptions for live updates
- Automatic Telegram notifications on new entries
- Image storage with public URLs

## 🔒 Security

- All tables have RLS policies for public access (adjust based on your needs)
- Image uploads are validated for type and size
- Environment variables for sensitive configuration

## 🐛 Troubleshooting

### Common Issues

1. **Missing environment variables**: Ensure all required env vars are set
2. **Telegram notifications not working**: Check bot token and chat ID
3. **Image upload failures**: Verify storage buckets exist and have correct policies
4. **Database connection issues**: Check Supabase URL and key

### Development Tips

- Use browser dev tools to check for console errors
- Monitor Supabase logs for Edge Function errors
- Test Telegram bot manually before deploying

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
