# CORS Fix Instructions

## The Problem
Your React app (running on lovableproject.com) cannot connect to your PHP backend (smcgame.com/api) due to CORS (Cross-Origin Resource Sharing) restrictions.

When you visit `https://smcgame.com/api/test-cors.php` directly in your browser, it works because there's no cross-origin request. But when the React app tries to fetch from it, the browser blocks it.

## The Solution

### Step 1: Upload the new CORS handler
Upload this new file to your server:
- **`php-backend/cors.php`** → `smcgame.com/api/cors.php`

### Step 2: Update test-cors.php
Replace the existing `test-cors.php` on your server with the updated version that includes the CORS handler at the top.

### Step 3: Verify .htaccess is in place
Make sure `php-backend/.htaccess` is uploaded to `smcgame.com/api/.htaccess`

The .htaccess should contain:
```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    Header always set Access-Control-Max-Age "86400"
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### Step 4: Test the connection
After uploading these files:

1. Visit `https://smcgame.com/api/test-cors.php` in your browser → Should show success message
2. In your React app, click the "Test Now" button → Should now connect successfully

### Why This Works

1. **cors.php**: A dedicated CORS handler that runs BEFORE any other code
2. **OPTIONS handling**: Immediately returns 200 OK for preflight requests
3. **.htaccess**: Backup CORS headers set at Apache level
4. **Order matters**: CORS headers must be sent before any other processing

### If Still Not Working

Check with your hosting provider that:
1. **mod_headers** is enabled in Apache
2. **.htaccess** files are allowed (AllowOverride is set)
3. There's no reverse proxy or firewall blocking cross-origin requests

### Next Steps

Once the CORS test passes:
1. All other PHP API endpoints need to include `cors.php` at the top
2. The updated files are already prepared in the `php-backend/` folder
3. Upload them to your server to replace the existing versions
