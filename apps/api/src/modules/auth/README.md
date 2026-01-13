# Authentication Module

## Akış Özeti

### 1. OTP İsteği
```
Client → API: POST /api/auth/otp/request
  ↓
Rate Limit Check (Redis)
  ↓
Generate OTP (6 digits)
  ↓
Store OTP in Redis (5 min TTL)
  ↓
Publish to RabbitMQ: 'otp.requested'
  ↓
Worker: Send Email/SMS (STUB)
```

### 2. OTP Doğrulama
```
Client → API: POST /api/auth/otp/verify
  ↓
Verify OTP from Redis
  ↓
Delete OTP (one-time use)
  ↓
Find/Create User (MongoDB)
  ↓
Generate JWT Tokens
  ↓
Store Refresh Token (Redis)
  ↓
Return: { user, accessToken, refreshToken }
```

### 3. Token Kullanımı
```
Client → API: Authorization: Bearer {accessToken}
  ↓
Middleware: Verify JWT
  ↓
Check Blacklist (Redis)
  ↓
Attach user to req.user
```

### 4. Token Yenileme
```
Client → API: POST /api/auth/refresh
  ↓
Verify Refresh Token
  ↓
Check Redis: refresh:{userId}
  ↓
Generate New Tokens
  ↓
Update Refresh Token in Redis
```

## Rate Limiting

- **OTP Request:** 5 requests / 15 minutes
- **OTP Verify:** 10 attempts / 15 minutes
- **General API:** 100 requests / 15 minutes

## Redis Keys

- `otp:email:{email}` - OTP code (TTL: 5 min)
- `otp:phone:{phone}` - OTP code (TTL: 5 min)
- `refresh:{userId}` - Refresh token (TTL: 7 days)
- `blacklist:{token}` - Blacklisted access token
- `ratelimit:otp:{identifier}` - OTP rate limit counter

## Security Notes

1. OTP sadece bir kez kullanılabilir
2. OTP 5 dakika sonra expire olur
3. Access token 15 dakika geçerli
4. Refresh token 7 gün geçerli
5. Logout edilen token'lar blacklist'te
