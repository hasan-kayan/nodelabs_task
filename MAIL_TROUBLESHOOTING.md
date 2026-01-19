# Mail Gönderme Sorun Giderme Rehberi

## Sorun: Takım Davet Maili Ulaşmıyor

### 1. Worker Servisinin Çalıştığını Kontrol Edin

Worker servisi çalışmıyorsa, RabbitMQ'dan event'ler consume edilmez ve mail gönderilmez.

**Kontrol:**
```bash
# Worker servisinin çalışıp çalışmadığını kontrol edin
ps aux | grep "worker" | grep node

# Veya Docker kullanıyorsanız
docker-compose ps worker
```

**Başlatma:**
```bash
# Root dizinden
pnpm dev:worker

# Veya worker dizininden
cd apps/worker
pnpm dev
```

**Worker başarıyla başladığında şu log'ları görmelisiniz:**
```
✅ MongoDB connected
✅ RabbitMQ connected
✅ Redis connected
✅ Mailer consumer started
✅ Notifier consumer started
✅ Analytics consumer started
✅ All consumers setup complete
✅ Worker started successfully
```

### 2. RabbitMQ Bağlantısını Kontrol Edin

**RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: guest
- Password: guest

**Kontrol:**
1. **Queues** sekmesine gidin
2. `mailer_queue` kuyruğunu bulun
3. Mesaj sayısını kontrol edin:
   - **Ready:** Bekleyen mesajlar
   - **Unacked:** İşlenmekte olan mesajlar
   - Eğer mesajlar birikiyorsa, worker servisi çalışmıyor demektir

### 3. API Servisinin Event Publish Ettiğini Kontrol Edin

**API loglarında şunları görmelisiniz:**
```
📧 [TEAM SERVICE] Preparing to publish invitation event...
📧 [TEAM SERVICE] Publishing invitation event with data: {...}
📤 [EVENT PUBLISHER] Publishing event: team.invitation
✅ [EVENT PUBLISHER] Event published successfully: team.invitation
✅ [TEAM SERVICE] Invitation event published successfully
```

Eğer bu log'lar yoksa, event publish edilmiyor demektir.

### 4. Worker Servisinin Event'i Consume Ettiğini Kontrol Edin

**Worker loglarında şunları görmelisiniz:**
```
📨 [MAILER CONSUMER] Received message from queue
📧 [MAILER CONSUMER] Processing team invitation event: {...}
📧 [MAILER CONSUMER] Calling sendTeamInvitationEmail...
📧 [MAILER] Preparing team invitation email...
```

### 5. SMTP Yapılandırmasını Kontrol Edin

**`.env` dosyasında:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Gmail App Password (16 karakter)
SMTP_FROM=your-email@gmail.com
```

**Gmail App Password:**
1. Google Account → Security → 2-Step Verification (açık olmalı)
2. App passwords → Select app: "Mail" → Generate
3. 16 karakterlik şifreyi kopyalayın

### 6. Mail Gönderme Testi

**Test scriptini çalıştırın:**
```bash
cd apps/worker
node test-email.js
```

**Başarılı çıktı:**
```
✅ [MAILER] SMTP connection verified successfully
✅ [MAILER] Email sent successfully!
✅ Email accepted by server for delivery
```

**Hata durumunda:**
- SMTP authentication hatası: App Password'u kontrol edin
- Connection timeout: SMTP_HOST ve SMTP_PORT'u kontrol edin
- STUB mode: SMTP_USER ve SMTP_PASS'ın ayarlandığını kontrol edin

### 7. Mail Spam Klasörünü Kontrol Edin

Gmail ve diğer email sağlayıcıları bazen mail'leri spam klasörüne gönderir:
- Gmail: Spam klasörünü kontrol edin
- Outlook: Junk Email klasörünü kontrol edin
- Hotmail: Spam klasörünü kontrol edin

### 8. Worker Loglarını İzleyin

**Real-time log izleme:**
```bash
# Worker servisi çalışırken logları izleyin
cd apps/worker
pnpm dev

# Veya Docker kullanıyorsanız
docker-compose logs -f worker
```

**Davet gönderildiğinde şu log'ları görmelisiniz:**
```
📨 [MAILER CONSUMER] Received message from queue
📧 [MAILER CONSUMER] Processing team invitation event
📧 [MAILER] Preparing team invitation email...
📧 [MAILER] SMTP transporter created, sending email...
✅ [MAILER] Email sent successfully!
✅ [MAILER CONSUMER] Email was successfully sent to user@example.com
```

### 9. Yaygın Sorunlar ve Çözümleri

#### Sorun: Worker servisi başlamıyor
**Çözüm:**
- MongoDB, Redis ve RabbitMQ servislerinin çalıştığını kontrol edin
- `.env` dosyasının doğru yüklendiğini kontrol edin
- Port çakışması olup olmadığını kontrol edin

#### Sorun: Event publish edilmiyor
**Çözüm:**
- RabbitMQ bağlantısını kontrol edin
- API servisinin RabbitMQ'ya bağlandığını kontrol edin
- Exchange'in oluşturulduğunu kontrol edin (`taskboard_events`)

#### Sorun: Event consume edilmiyor
**Çözüm:**
- Worker servisinin çalıştığını kontrol edin
- Queue'nun doğru bind edildiğini kontrol edin
- Consumer'ların başlatıldığını kontrol edin

#### Sorun: Mail gönderiliyor ama ulaşmıyor
**Çözüm:**
- Spam klasörünü kontrol edin
- Email adresinin doğru olduğunu kontrol edin
- SMTP server'ın mail'i kabul ettiğini log'lardan kontrol edin
- Gmail'de "Less secure app access" ayarını kontrol edin (artık gerekli değil, App Password kullanın)

### 10. Debug Adımları

1. **Worker servisini başlatın:**
   ```bash
   pnpm dev:worker
   ```

2. **Yeni bir davet gönderin**

3. **Logları kontrol edin:**
   - API loglarında event publish edildi mi?
   - Worker loglarında event consume edildi mi?
   - Mail gönderme işlemi başarılı mı?

4. **RabbitMQ Management UI'da kontrol edin:**
   - Queue'da mesaj var mı?
   - Mesajlar işleniyor mu?

5. **Test scriptini çalıştırın:**
   ```bash
   cd apps/worker
   node test-email.js
   ```

### 11. Hızlı Kontrol Listesi

- [ ] Worker servisi çalışıyor mu?
- [ ] RabbitMQ çalışıyor mu? (http://localhost:15672)
- [ ] MongoDB çalışıyor mu?
- [ ] Redis çalışıyor mu?
- [ ] `.env` dosyasında SMTP yapılandırması var mı?
- [ ] Gmail App Password doğru mu?
- [ ] API servisi event publish ediyor mu? (log'larda görünüyor mu?)
- [ ] Worker servisi event consume ediyor mu? (log'larda görünüyor mu?)
- [ ] Mail spam klasöründe mi?

### 12. Detaylı Log Kontrolü

**API Servisi Logları:**
```bash
# API servisi çalışırken
# Davet gönderildiğinde şu log'ları görmelisiniz:
📧 [TEAM SERVICE] Preparing to publish invitation event...
📤 [EVENT PUBLISHER] Publishing event: team.invitation
✅ [EVENT PUBLISHER] Event published successfully
```

**Worker Servisi Logları:**
```bash
# Worker servisi çalışırken
# Event geldiğinde şu log'ları görmelisiniz:
📨 [MAILER CONSUMER] Received message from queue
📧 [MAILER CONSUMER] Processing team invitation event
📧 [MAILER] Preparing team invitation email...
✅ [MAILER] Email sent successfully!
```

Eğer bu log'lar görünmüyorsa, ilgili adımda sorun var demektir.
