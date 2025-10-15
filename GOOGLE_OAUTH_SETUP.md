# Google OAuth Setup Instructions

Google OAuth has been implemented using your existing PHP backend. Follow these steps to complete the setup:

## 1. Update Database Schema

Run this SQL to make existing installations compatible:

```sql
ALTER TABLE users 
  MODIFY password VARCHAR(255) DEFAULT NULL,
  MODIFY phone VARCHAR(20) DEFAULT NULL,
  MODIFY username VARCHAR(50) DEFAULT NULL,
  ADD COLUMN name VARCHAR(100) DEFAULT NULL AFTER id;
```

## 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth Client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `https://smcgame.com`
   - `https://superbills.lovable.app` (for testing)
7. Add authorized redirect URIs:
   - `https://smcgame.com/api/auth/google-callback.php`
8. Copy the **Client ID** and **Client Secret**

## 3. Configure PHP Backend

Edit these files and replace the placeholder credentials:

**File: `php-backend/auth/google-login.php`** (Line 9-10)
```php
define('GOOGLE_CLIENT_ID', 'YOUR_ACTUAL_CLIENT_ID_HERE');
define('GOOGLE_CLIENT_SECRET', 'YOUR_ACTUAL_CLIENT_SECRET_HERE');
```

**File: `php-backend/auth/google-callback.php`** (Line 9-10)
```php
define('GOOGLE_CLIENT_ID', 'YOUR_ACTUAL_CLIENT_ID_HERE');
define('GOOGLE_CLIENT_SECRET', 'YOUR_ACTUAL_CLIENT_SECRET_HERE');
```

## 4. Testing

1. Visit your auth page: `https://superbills.lovable.app/auth`
2. Click the "Google" button
3. You'll be redirected to Google's login page
4. After authentication, you'll be redirected back to your app
5. Check session storage to confirm login

## Security Notes

- Never commit credentials to Git
- Consider moving credentials to a config file outside web root
- Implement CSRF protection for production
- Add rate limiting to prevent abuse
