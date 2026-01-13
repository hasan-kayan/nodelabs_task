# Kimlik Doğrulama Akışı (Authentication Flow)

## Genel Bakış

Sistem **OTP (One-Time Password)** tabanlı kimlik doğrulama kullanır. Kullanıcılar email veya telefon numarası ile giriş yapabilir.

## Akış Diyagramı

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/otp/request
       │    { email/phone, mode, name? }
       ▼
┌─────────────────┐
│   API Server    │
└──────┬──────────┘
       │
       │ 2. Rate Limit Check (Redis)
       │ 3. Generate OTP (6 digit)
       │ 4. Store OTP in Redis (5 min TTL)
       │ 5. Publish to RabbitMQ: 'otp.requested'
       │
       ▼
┌─────────────────┐
│  RabbitMQ Queue │
└──────┬──────────┘
       │
       │ 6. Worker consumes event
       │
       ▼
┌─────────────────┐
│  Mailer Worker  │
└──────┬──────────┘
       │
       │ 7. [STUB] Log OTP
       │    (Production: Send Email/SMS)
       │
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 8. User enters OTP
       │ 9. POST /api/auth/otp/verify
       │    { email/phone, otp, mode, name? }
       │
       ▼
┌─────────────────┐
│   API Server    │
└──────┬──────────┘
       │
       │ 10. Verify OTP from Redis
       │ 11. Delete OTP (one-time use)
       │ 12. Find/Create User (MongoDB)
       │ 13. Generate JWT Tokens
       │     - Access Token (15 min)
       │     - Refresh Token (7 days)
       │ 14. Store Refresh Token (Redis)
       │
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 15. Store tokens
       │ 16. Use Access Token for API calls
       │
       ▼
```

## Detaylı Adımlar

### 1. OTP İsteği (Request OTP)

**Endpoint:** `POST /api/auth/otp/request`

**Request Body:**
```json
{
  "email": "user@example.com",  // veya
  "phone": "+905551234567",
  "mode": "login",              // "login" veya "register"
  "name": "John Doe"            // sadece register modunda
}
```

**İşlemler:**
1. **Rate Limiting:** IP ve kullanıcı bazlı rate limit kontrolü (Redis)
2. **OTP Generation:** 6 haneli rastgele kod oluşturulur
3. **Redis Storage:** OTP Redis'te saklanır
   - Key: `otp:email:{email}` veya `otp:phone:{phone}`
   - TTL: 5 dakika (300 saniye)
4. **RabbitMQ Event:** `otp.requested` eventi publish edilir
5. **Worker Processing:** Mailer worker eventi alır ve OTP gönderir (şu anda stub)

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

### 2. OTP Doğrulama (Verify OTP)

**Endpoint:** `POST /api/auth/otp/verify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "mode": "login",
  "name": "John Doe"  // sadece register modunda
}
```

**İşlemler:**
1. **OTP Verification:** Redis'ten OTP kontrol edilir
2. **One-Time Use:** OTP doğrulandıktan sonra silinir
3. **User Management:**
   - **Login Mode:** Kullanıcı varsa giriş, yoksa oluşturulur
   - **Register Mode:** Kullanıcı yoksa oluşturulur, varsa hata
4. **JWT Generation:**
   - **Access Token:** 15 dakika geçerli
   - **Refresh Token:** 7 gün geçerli
5. **Refresh Token Storage:** Redis'te saklanır
   - Key: `refresh:{userId}`
   - TTL: 7 gün

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "phone": "+905551234567",
    "name": "John Doe",
    "role": "member"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Token Yenileme (Refresh Token)

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**İşlemler:**
1. Refresh token doğrulanır
2. Redis'teki stored token ile karşılaştırılır
3. Yeni access ve refresh token'lar oluşturulur
4. Yeni refresh token Redis'te güncellenir

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Çıkış (Logout)

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**İşlemler:**
1. Access token blacklist'e eklenir (Redis)
2. Refresh token Redis'ten silinir
3. Token'lar artık geçersizdir

## Rate Limiting

### OTP Request Rate Limiting

- **Window:** 15 dakika (900 saniye)
- **Max Requests:** 5 OTP isteği
- **Key Format:** `ratelimit:otp:{ip}:{email|phone}`

### Genel API Rate Limiting

- **Window:** 15 dakika
- **Max Requests:** 100 istek
- **Key Format:** `ratelimit:{ip}:{userId}`

## Redis Key Yapısı

```
otp:email:{email}          → OTP code (TTL: 5 min)
otp:phone:{phone}          → OTP code (TTL: 5 min)
refresh:{userId}           → Refresh token (TTL: 7 days)
blacklist:{accessToken}    → "1" (TTL: token expiry)
ratelimit:otp:{ip}:{id}    → Request count (TTL: 15 min)
ratelimit:{ip}:{userId}    → Request count (TTL: 15 min)
```

## RabbitMQ Event Flow

### Event: `otp.requested`

**Exchange:** `taskboard_events` (topic)
**Routing Key:** `otp.requested`
**Queue:** `mailer_queue`

**Event Payload:**
```json
{
  "email": "user@example.com",
  "phone": "+905551234567",
  "mode": "login",
  "name": "John Doe",
  "otp": "123456",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Worker İşlemi:**
- Event consumer tarafından alınır
- Şu anda **STUB** modda: Sadece log'a yazılır
- Production'da: Email/SMS servisi çağrılır

## Güvenlik Özellikleri

1. **OTP Expiry:** 5 dakika sonra geçersiz
2. **One-Time Use:** OTP sadece bir kez kullanılabilir
3. **Token Blacklist:** Logout edilen token'lar blacklist'te
4. **Rate Limiting:** Brute force saldırılarına karşı koruma
5. **JWT Expiry:** Access token kısa süreli (15 min)
6. **Refresh Token Rotation:** Her refresh'te yeni token

## Production İyileştirmeleri

1. **Email/SMS Integration:**
   - SendGrid, Twilio, AWS SES gibi servisler
   - Mailer worker'da gerçek entegrasyon

2. **OTP Security:**
   - OTP'yi event'te göndermemek (sadece worker'da)
   - Rate limiting'i daha sıkı yapmak

3. **Monitoring:**
   - OTP gönderim başarı oranları
   - Rate limit ihlalleri
   - Token kullanım istatistikleri
