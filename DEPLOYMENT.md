# readon.gr Deployment Guide

## Production Database Setup

### 1. Create Supabase Production Project
1. Go to [supabase.com](https://supabase.com) 
2. Create new project for production
3. Note your production credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Run Database Migrations
```bash
# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### 3. Setup Storage (Images)
Copy and run the entire content of `scripts/setup-storage.sql` in your Supabase SQL Editor.

This will:
- Create the `images` storage bucket
- Set up proper RLS policies
- Configure file size limits (5MB)
- Allow only authenticated uploads

### 4. Verify Setup
After running the storage setup, you should see:
- Bucket `images` in Storage tab
- 4 policies on `storage.objects` table
- File upload working in your app

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 2. Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 3. Deploy
- Push to main branch
- Vercel automatically deploys
- Your site will be available at `your-project.vercel.app`

### 4. Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add `readon.gr` 
3. Configure DNS records as shown

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage bucket and policies created  
- [ ] Environment variables set in Vercel
- [ ] Site loads correctly
- [ ] User registration works
- [ ] Post creation works
- [ ] Image upload works
- [ ] Vote system works

## Costs

**Free Tier (Good for MVP):**
- Vercel: Free for hobby projects
- Supabase: 500MB DB, 1GB storage, 2GB bandwidth

**Paid Tier (For growth):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month  
- **Total: ~$45/month for decent traffic**

## Performance Tips

1. **Images**: Already optimized with Supabase Storage
2. **Caching**: Posts cached for 1 hour, counts for 5 minutes
3. **CDN**: Vercel provides global CDN automatically
4. **Database**: Consider read replicas if traffic grows

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database performance, storage usage
- **Error Tracking**: Consider adding Sentry for production

## Backup Strategy

- **Database**: Supabase handles automatic backups
- **Images**: Stored in Supabase Storage (backed up)
- **Code**: GitHub repository
- **Environment**: Document all environment variables

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables
4. Test locally first