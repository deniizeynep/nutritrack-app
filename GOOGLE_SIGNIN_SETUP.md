# Google Sign-In Kurulum Rehberi (Release APK)

Bu belge, NutriTrack Android uygulamasında Google Sign-In'in release APK'da
çalışması için yapılması gereken her adımı detaylı şekilde anlatır.

---

## Ön Gereksinimler

- Bir Google Cloud Console projen olmalı (zaten var)
- Android Studio veya JDK kurulu olmalı (keytool için)
- Proje repository'sine erişim

---

## Adım 1: Mevcut Google Cloud OAuth Client'ını Kontrol Et

### 1.1 Google Cloud Console'a git

Tarayıcında şu adrese git:
```
https://console.cloud.google.com/apis/credentials
```

Giriş yap ve sol üstteki proje seçiciden projeni seç.

### 1.2 OAuth 2.0 Client ID'lerini bul

Sayfada "OAuth 2.0 Client IDs" bölümü olmalı. Şu an elinde şunlar olabilir:
- **Web Client ID** → `xxx.apps.googleusercontent.com` (bu zaten var, server-side token doğrulama için kullanılıyor)
- **Android Client ID** → olmayabilir (APK için gerekiyor)

### 1.3 Android Client ID oluştur (yoksa)

1. Üstte **"+ CREATE CREDENTIALS"** butonuna tıkla
2. Açılan menüden **"OAuth client ID"** seç
3. **Application type**: açılır menüden **"Android"** seç
4. **Name**: `NutriTrack Android` yaz (veya istediğin isim)
5. **Package name**: tam olarak şunu yaz:
   ```
   com.zeynepdeniz.nutritrack
   ```
   > Önemli: Bu, `app.config.js`'deki `android.package` değeriyle **birebir aynı** olmalı.
   > Preview buildler için: `com.zeynepdeniz.nutritrack.preview`

6. **SHA-1 certificate fingerprint**: bu değeri henüz bilmiyoruz, Adım 2'den alacağız.
   Şimdilik bu alanı **boş bırak** veya geçici bir şey yaz, sonra güncelleyeceğiz.

7. **"CREATE"** butonuna tıkla

> **Not**: Eğer zaten bir Android Client ID varsa, üzerine tıkla ve SHA-1 değerini
> güncelleyebilirsin.

---

## Adım 2: Release Keystore'unun SHA-1 Parmak İznini Al

Google, uygulamanın hangi keystore ile imzalandığını doğrular. Bunun için
release keystore'unun SHA-1 fingerprint'ine ihtiyacın var.

### 2.1 Keystore dosyanı bul

Keystore dosyan (`.keystore` veya `.jks` uzantılı) muhtemelen şu yerlerden birinde:

```
# Yaygın konumlar:
~/keystore/release.keystore
~/keystore/nutritrack.keystore
~/nutritrack.keystore
~/.keystore/release.keystore
```

Ya da build脚本'ine bak, `storeFile` satırında hangi dosyayı kullandığını gösterir.
Build脚本'in (veya `gradle.properties`'in) şu satırlara bak:
```groovy
storeFile file("/path/to/your.keystore")
storePassword "your-password"
keyAlias "your-alias"
keyPassword "your-key-password"
```

### 2.2 SHA-1'i hesapla

Terminal'de (veya Android Studio'nun terminal'inden) şu komutu çalıştır:

```bash
keytool -list -v -keystore /KESTORE/YOLU/KESTORE_DOSYASI.adystore -alias ALIAS_ADI
```

Örnek:
```bash
keytool -list -v -keystore C:/Users/zeyne/keystore/release.keystore -alias nutritrack
```

Sana şifre soracak. Keystore şifreni gir.

> **Eğer release keystore'un yoksa ve debug keystore kullanıyorsan:**
> ```bash
> keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
> ```

### 2.3 Çıktıdan SHA-1 değerini kopyala

Çıktı şöyle görünecek:

```
Keystore type: PKCS12
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: nutritrack
Creation date: ...
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: ...
Issuer: ...
Serial number: ...
Valid from: ...
Certificate fingerprints:
	 SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
	 SHA256: ...
```

**"SHA1:"**后面的整行值（如 `AA:BB:CC:...`）**复制**，这个值就是你要的 fingerprint。

---

## Adım 3: SHA-1'i Google Cloud Console'a Kaydet

### 3.1 OAuth Client'ını düzenle

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. "OAuth 2.0 Client IDs" altında **"NutriTrack Android"** (veya oluşturduğun isim) üzerine tıkla
3. **"Firebase fingerprint"** veya **"SHA-1 certificate fingerprint"** alanına **Adım 2.3'ten kopyaladığın SHA-1** değerini yapıştır
4. **"SAVE"** butonuna tıkla

> Eğer Android Client ID'yi sıfırdan oluşturuyorsan, SHA-1'i Adım 1.6'daki alana yazıp
> "CREATE" butonuna basman yeterli.

### 3.2 Client ID ve Web Client ID değerlerini not et

Şu iki değeri bir yere yaz:

- **Web Client ID**: `xxxx.apps.googleusercontent.com` (bu zaten mevcut)
- **Android Client ID**: `yyyy.apps.googleusercontent.com` (yeni oluşturduğun)

---

## Adım 4: Firebase Projesi Oluştur

`google-services.json` dosyası sadece Firebase üzerinden alınabiliyor.

### 4.1 Firebase Console'a git

```
https://console.firebase.google.com/
```

### 4.2 Yeni proje oluştur

1. **"Proje ekle"** butonuna tıkla (veya **"Add project"**)
2. **"Proje adı"**: `NutriTrack` yaz
3. **"Google Analytics"** opsiyonunu istersen aç, istersen kapat. Devam et
4. **"Proje oluştur"** butonuna tıkla
5. Birkaç saniye bekleyip **"Devam"** (Continue) de

> **Alternatif**: Eğer mevcut Google Cloud projeni kullanmak istiyorsan,
> Firebase Console'da "Proje ekle" derken aynı Google hesabını kullan,
> "Mevcut bir Google projesini kullan" seçeneği çıkacak. Aynı ID ile Firebase
> projesi bağlarsan OAuth ayarların korunur.

### 4.3 Android uygulaması ekle

1. Firebase ana sayfasında (Proje Overview) sol altta **Android** ikonuna
   tıkla (ya da **"iOS"**'un yanındaki **"Android"** butonuna)
2. Açılan formu doldur:

   | Alan | Değer |
   |------|-------|
   | **Android package name** | `com.zeynepdeniz.nutritrack` |
   | **Android app nickname** | `NutriTrack` (isteğe bağlı) |
   | **Debug signing certificate SHA-1** | Aynı SHA-1 değerini yapıştır (Adım 2.3) |

3. **"Uygulamayı kaydet"** (Register app) butonuna tıkla

### 4.4 google-services.json indir

1. Kaydettikten sonra bir sonraki sayfada **"google-services.json indir"**
   butonu çıkacak. Tıkla ve indir.
2. İndirilen dosyayı **projenin root klasörüne** kopyala:
   ```
   nutritrack-app/
   ├── google-services.json    ← BURAYA
   ├── app.config.js
   ├── package.json
   ├── ...
   ```

> **ÖNEMLİ**: `google-services.json` dosyası `.gitignore`'da olabilir.
> Bu dosya gizli/özel bilgiler içerir ama projede bulunmalı.
> `.gitignore`'ı kontrol et, eğer `google-services.json` listede varsa çıkar.

### 4.5 Firebase'i etkinleştir

Gerekirse **"Build"** → **"Authentication"** bölümüne git ve etkinleştir.
(Google Sign-In için Authentication zorunlu değil ama iyi bir alışkanlık.)

---

## Adım 5: `google-services.json`'ı kontrol et

İndirdiğin dosyayı aç ve içeriğinin şu yapıda olduğundan emin ol:

```json
{
  "project_info": {
    "project_number": "...",
    "project_id": "nutritrack-xxxxx",
    "storage_bucket": "nutritrack-xxxxx.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:xxx:android:xxx",
        "android_client_info": {
          "package_name": "com.zeynepdeniz.nutritrack"
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

**`package_name`** alanının `com.zeynepdeniz.nutritrack` olduğundan emin ol.

---

## Adım 6: `.env` dosyasını oluştur

Projenin root klasöründe `.env` adında bir dosya oluştur:

```
EXPO_PUBLIC_API_URL=http://SUNUCU_IP_ADRESI:3000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=ANDROID_CLIENT_ID.apps.googleusercontent.com
```

Değerleri şöyle doldur:

| Değer | Nereden alınır |
|-------|---------------|
| `SUNUCU_IP_ADRESI` | Backend server'ın IP adresi veya domain'i |
| `WEB_CLIENT_ID` | Google Cloud Console → Credentials → Web Client ID |
| `ANDROID_CLIENT_ID` | Google Cloud Console → Credentials → Android Client ID |

> `.env.example` dosyasını referans al, zaten hazır şablon var.

---

## Adım 7: Prebuild ve Build Al

### 7.1 Prebuild'i temizle

Eğer daha önce `android/` klasörü oluştuysa temizle:

```bash
npx expo prebuild --clean
```

Bu komut:
- `android/` klasörünü siler ve yeniden oluşturur
- `google-services.json`'ı doğru yere kopyalar
- `@react-native-google-signin/google-signin` plugin'ini yapılandırır
- `build.gradle`'a Google Services plugin'ini ekler

### 7.2 Build kontrolü

Prebuild sonrası `android/app/build.gradle` dosyasını aç ve şu satırların
olup olmadığını kontrol et:

```groovy
plugins {
    id "com.android.application"
    id "org.jetbrains.kotlin.android"
    id "com.google.gms.google-services"   ← BU OLMALI
}

dependencies {
    // ...
}
```

Ve `android/build.gradle`'da:
```groovy
buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.0")  ← BU OLMALI
    }
}
```

### 7.3 Release APK oluştur

```bash
cd android
.\gradlew.bat assembleRelease
```

> İlk build biraz uzun sürebilir (5-15 dk).

### 7.4 APK'yı bul

Release APK şu konumda olacak:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 7.5 APK'yı yükle ve test et

1. APK'yı Android cihazına aktar (USB, WhatsApp, Drive vb.)
2. Yükle (Bilinmeyen kaynaklara izin ver)
3. Uygulamayı aç
4. **"Google ile devam et"** butonuna tıkla
5. Google hesabını seç
6. Giriş başarılı olmalı

---

## Hata Durumunda Kontrol Listi

### "DEVELOPER_ERROR" veya "12500" hatası
- SHA-1 fingerprint yanlış veya eksik
- Package name eşleşmiyor
- google-services.json yanlış projeye ait

### "SIGN_IN_CANCELLED" hatası
- Bu normal, kullanıcı iptal etti demektir

### "PLAY_SERVICES_NOT_AVAILABLE" hatası
- Cihazda Google Play Services yüklü değil veya çok eski
- Huawei cihazlarda olabilir

### "MISSING_WEB_CLIENT_ID" hatası
- `.env` dosyasında `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` tanımlı değil
- `npx expo prebuild --clean` çalıştırıp tekrar dene

### Google Sign-In butonu pasif/gri
- `isGoogleSignInAvailable()` false dönüyor olabilir
- `.env` dosyası okunmuyor olabilir

### Login sonrası "Google hesabı doğrulanamadı" (server tarafı)
- Server'da `GOOGLE_WEB_CLIENT_ID` env variable'ı tanımlı değil
- Veya server'daki client ID ile client'daki client ID farklı projeye ait

---

## Kontrol Listesi Özeti

- [ ] Google Cloud Console'da **Web Client ID** var
- [ ] Google Cloud Console'da **Android Client ID** var ve **SHA-1** kayıtlı
- [ ] Firebase projesi oluşturuldu
- [ ] Firebase'den **Android uygulaması** eklendi (aynı package name ile)
- [ ] **google-services.json** indirildi ve proje rootuna konuldu
- [ ] `.env` dosyasında `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` tanımlı
- [ ] `.env` dosyasında `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` tanımlı
- [ ] `npx expo prebuild --clean` çalıştırıldı
- [ ] `android/app/build.gradle`'da `com.google.gms.google-services` plugin'i var
- [ ] `.\gradlew.bat assembleRelease` hatasız tamamlandı
- [ ] APK yüklendi ve Google Sign-In test edildi
