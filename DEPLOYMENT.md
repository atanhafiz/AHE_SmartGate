# AHE SmartGate v1 - Deployment Guide

## 🚀 Complete Deployment Checklist

### 1. Supabase Setup

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note down your project URL and anon key

#### Database Setup
1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL from `supabase-schema.sql` to create all tables and policies
3. Go to Storage and create two buckets:
   - `selfies` (public, for visitor/resident photos)
   - `forced-entries` (public, for guard incident photos)

#### Edge Function Deployment
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Deploy function: `supabase functions deploy notify-telegram`
5. Set secrets:
   ```bash
   supabase secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   supabase secrets set TELEGRAM_CHAT_ID=your_chat_id
   ```

#### Database Trigger
1. Run the SQL from `supabase-trigger.sql` in SQL Editor
2. Update the URLs and keys with your actual values

### 2. Telegram Bot Setup

#### Create Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Save your bot token

#### Get Chat ID
1. Message your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID in the response

### 3. Environment Configuration

Create `.env` file with:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_KEY=your_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Frontend Deployment (Vercel)

#### Option A: Vercel CLI
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts and set environment variables

#### Option B: Vercel Dashboard
1. Connect GitHub repository to Vercel
2. Set environment variables in project settings
3. Deploy automatically

### 5. Testing Checklist

#### Basic Functionality
- [ ] Entry registration form works
- [ ] Selfie upload functions
- [ ] Guard dashboard loads entries
- [ ] Admin dashboard shows statistics
- [ ] Forced entry modal works

#### Telegram Integration
- [ ] New entries trigger Telegram notifications
- [ ] Photos are sent to Telegram
- [ ] Message formatting is correct

#### Data Management
- [ ] CSV export works
- [ ] Real-time updates function
- [ ] Image storage works properly

### 6. Production Considerations

#### Security
- Review and adjust RLS policies as needed
- Consider implementing proper authentication
- Set up proper CORS policies

#### Performance
- Monitor Supabase usage and limits
- Consider implementing pagination for large datasets
- Optimize image sizes if needed

#### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor Telegram bot rate limits
- Track Supabase function execution

### 7. Troubleshooting

#### Common Issues
1. **Environment variables not loading**: Check Vercel environment settings
2. **Telegram not working**: Verify bot token and chat ID
3. **Images not uploading**: Check storage bucket policies
4. **Database errors**: Verify RLS policies and table structure

#### Debug Steps
1. Check browser console for errors
2. Monitor Supabase logs for Edge Function errors
3. Test Telegram bot manually
4. Verify all environment variables are set

### 8. Maintenance

#### Regular Tasks
- Monitor system usage and performance
- Update dependencies regularly
- Review and rotate API keys
- Backup database regularly

#### Scaling Considerations
- Implement user authentication for production
- Add rate limiting for API calls
- Consider implementing caching strategies
- Plan for increased storage needs

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ All pages load without errors
- ✅ Entry registration works end-to-end
- ✅ Telegram notifications are sent
- ✅ Admin dashboard shows real-time data
- ✅ CSV export functions properly
- ✅ Images are stored and displayed correctly

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase and Vercel documentation
3. Check browser console and network tabs
4. Verify all environment variables are correct
