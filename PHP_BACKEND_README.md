# SuperBills PHP Backend

This PHP backend handles VTpass API integration securely. Deploy this alongside your React frontend.

## Setup Instructions

1. **Requirements**: PHP 7.4+, MySQL, Apache/Nginx with mod_rewrite
2. **Installation**:
   ```bash
   # Place files in your web root (e.g., /var/www/html/superbills-api/)
   composer install  # If using dependencies
   ```
3. **Database**: Import `database.sql`
4. **Config**: Update `config/config.php` with your database credentials
5. **CORS**: The API includes CORS headers for React frontend

## API Endpoints

### Base URL
```
Production: https://yourdomain.com/api/
Development: http://localhost/superbills-api/
```

### Authentication (Optional for Guest Purchases)
- `POST /auth/register.php` - Register user
- `POST /auth/login.php` - Login (includes Google OAuth)
- `POST /auth/logout.php` - Logout
- `GET /auth/me.php` - Get current user

### VTpass Services
- `GET /vtpass/categories.php` - Get service categories
- `GET /vtpass/services.php?identifier={category}` - Get services
- `GET /vtpass/variations.php?serviceID={id}` - Get variations/plans
- `POST /vtpass/verify.php` - Verify customer (meter, smartcard, etc.)
- `POST /vtpass/pay.php` - Execute payment
- `POST /vtpass/requery.php` - Check transaction status

### Wallet
- `GET /wallet/balance.php` - Get wallet balance
- `POST /wallet/fund.php` - Fund wallet

### Transactions
- `GET /transactions/history.php` - Get transaction history
- `GET /transactions/export.php` - Export to CSV

### Espees Payment
- `POST /espees/initiate.php` - Initiate Espees payment
- `POST /espees/verify.php` - Verify Espees payment

## React Frontend Integration

Update your React app's API base URL:

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost/superbills-api';
```

## Security Notes

1. **Never expose API keys in frontend code**
2. All VTpass API calls go through PHP backend
3. PHP validates and sanitizes all inputs
4. CSRF protection enabled for authenticated routes
5. Rate limiting recommended for production
