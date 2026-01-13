# Test Rehberi - Register İşlemi

## OTP Kodunu Nerede Bulabilirsiniz?

### 1. **Worker Terminal Logları** (Ana Yer)
Worker servisi çalışıyorsa, terminal'de şu şekilde görünecek:

```bash
[STUB] Sending OTP to user@example.com: 123456
[STUB] Mode: register, Name: John Doe
```

**Worker terminal'ini kontrol edin:**
```bash
# Worker terminal'inde şu satırları arayın:
[STUB] Sending OTP to ...
```

### 2. **API Terminal Logları**
API servisi çalışıyorsa, terminal'de şu şekilde görünecek:

```bash
🔐 OTP Generated for user@example.com: 123456 (Mode: register)
```

### 3. **Browser Console** (Development Mode)
Development modunda, browser console'da OTP görünecek:

1. Browser'da F12 tuşuna basın
2. Console sekmesine gidin
3. Register işlemi yaptığınızda şu mesajı göreceksiniz:
   ```
   🔐 OTP Code (Development Mode): 123456
   ```

### 4. **Alert Popup** (Development Mode)
Development modunda, OTP gönderildikten sonra bir alert popup çıkacak:
```
OTP Code: 123456

(Development mode - Check console for details)
```

## Register İşlemi Test Adımları

### Adım 1: Servisleri Başlatın
```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Worker
pnpm dev:worker

# Terminal 3: Frontend
pnpm dev:web
```

### Adım 2: Register Sayfasına Gidin
1. Browser'da `http://localhost:5173` adresine gidin
2. "Register" sekmesine tıklayın

### Adım 3: Bilgileri Girin
- **Full Name:** Test User
- **Email:** test@example.com (veya Phone: +905551234567)
- **Mode:** Register (otomatik seçili)

### Adım 4: OTP İsteği Gönderin
1. "Register & Send OTP" butonuna tıklayın
2. OTP kodunu bulun:
   - **Worker terminal'inde** logları kontrol edin
   - **Browser console'da** (F12) OTP'yi görün
   - **Alert popup'ta** OTP'yi görün

### Adım 5: OTP'yi Doğrulayın
1. OTP formuna 6 haneli kodu girin
2. "Verify OTP" butonuna tıklayın
3. Başarılı olursa `/projects` sayfasına yönlendirileceksiniz

## Terminal Loglarını İzleme

### Worker Logları
```bash
# Worker terminal'inde şunları göreceksiniz:
📧 Processing mailer event: { email: 'test@example.com', ... }
[STUB] Sending OTP to test@example.com: 123456
[STUB] Mode: register, Name: Test User
```

### API Logları
```bash
# API terminal'inde şunları göreceksiniz:
🔐 OTP Generated for test@example.com: 123456 (Mode: register)
📤 Published event: otp.requested
```

## Sorun Giderme

### OTP Görmüyorum
1. **Worker çalışıyor mu?** Kontrol edin: `pnpm dev:worker`
2. **RabbitMQ bağlantısı var mı?** Worker loglarında "✅ RabbitMQ connected" görünmeli
3. **Browser console'u açık mı?** F12 ile console'u açın

### OTP Çalışmıyor
1. **Redis çalışıyor mu?** `docker-compose ps` ile kontrol edin
2. **OTP expire oldu mu?** 5 dakika içinde kullanın
3. **Rate limit aşıldı mı?** 15 dakika bekleyin veya farklı email/phone deneyin

## Production'da

⚠️ **ÖNEMLİ:** Production'da OTP kodları:
- ❌ API response'unda OLMAYACAK
- ❌ Browser console'da OLMAYACAK
- ✅ Sadece Email/SMS ile gönderilecek
- ✅ Worker loglarında görünmeyecek (güvenlik için)

Production için `NODE_ENV=production` ayarlayın.
