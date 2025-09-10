# 🚀 **OpenHealth**

<div align="center">

**Yapay Zekâ Sağlık Asistanı | Verilerinizle Güçlendirilmiş**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge" alt="Language">
  <img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge" alt="Framework">
</p>

> **📢 Artık Web’de Kullanılabilir!**  
> OpenHealth’i daha erişilebilir hale getirdik; iki farklı seçenekle:  
> **[Klinik](https://qna.open-health.me/)** - Hızlı ve kolay sağlık danışmanlığı  
> **[Tam Platform](https://www.open-health.me/)** - Kapsamlı sağlık yönetimi için gelişmiş araçlar

### 🌍 Dilinizi Seçin
[English](README.md) | [Français](i18n/readme/README.fr.md) | [Deutsch](i18n/readme/README.de.md) | [Español](i18n/readme/README.es.md) | [한국어](i18n/readme/README.ko.md) | [中文](i18n/readme/README.zh.md) | [日本語](i18n/readme/README.ja.md) | [Українська](i18n/readme/README.uk.md) | [Русский](i18n/readme/README.ru.md) | [اردو](i18n/readme/README.ur.md) | [Türkçe](i18n/readme/README.tr.md)

</div>

---

<p align="center">
  <img src="/intro/openhealth.avif" alt="OpenHealth Demo">
</p>

## 🌟 Genel Bakış

> OpenHealth, **sağlık verilerinizi kontrol altına almanıza** yardımcı olur.  
> Yapay zekâ ve kişisel sağlık bilgilerinizi kullanarak size özel bir sağlık asistanı sağlar.  
> Maksimum gizlilik için tamamen yerel olarak çalıştırabilirsiniz.

## ✨ Proje Özellikleri

<details open>
<summary><b>Temel Özellikler</b></summary>

- 📊 **Merkezi Sağlık Verisi Girişi:** Tüm sağlık verilerinizi tek bir yerde toplayın.  
- 🛠️ **Akıllı Ayrıştırma:** Verilerinizi otomatik olarak ayrıştırır ve yapılandırılmış dosyalara dönüştürür.  
- 🤝 **Bağlamsal Sohbetler:** Yapılandırılmış verileri GPT destekli kişiselleştirilmiş sohbetlerde kullanın.  

</details>

## 📥 Desteklenen Veri Kaynakları & Dil Modelleri

<table>
  <tr>
    <th>Ekleyebileceğiniz Veri Kaynakları</th>
    <th>Desteklenen Dil Modelleri</th>
  </tr>
  <tr>
    <td>
      • Kan Testi Sonuçları<br>
      • Sağlık Kontrol Verileri<br>
      • Kişisel Fiziksel Bilgiler<br>
      • Aile Geçmişi<br>
      • Semptomlar
    </td>
    <td>
      • LLaMA<br>
      • DeepSeek-V3<br>
      • GPT<br>
      • Claude<br>
      • Gemini
    </td>
  </tr>
</table>

## 🤔 Neden OpenHealth?

> - 💡 **Sağlığınız sizin sorumluluğunuzdur.**  
> - ✅ Gerçek sağlık yönetimi, **verileriniz** + **zeka** birleşiminden doğar ve içgörüleri eyleme dönüştürür.  
> - 🧠 Yapay zekâ, uzun vadeli sağlığınızı etkili bir şekilde yönetmede tarafsız bir araçtır.  

## 🗺️ Proje Diyagramı

```mermaid
graph LR
    subgraph Sağlık Veri Kaynakları
        A1[Klinik Kayıtlar<br>Kan Testleri/Tanı<br>Reçeteler/Görüntüleme]
        A2[Sağlık Platformları<br>Apple Health/Google Fit]
        A3[Wearable Cihazlar<br>Oura/Whoop/Garmin]
        A4[Kişisel Kayıtlar<br>Diyet/Semptomlar/<br>Aile Geçmişi]
    end

    subgraph Veri İşleme
        B1[Veri Ayrıştırma & Standardizasyon]
        B2[Birleşik Sağlık Veri Formatı]
    end

    subgraph Yapay Zekâ Entegrasyonu
        C1[LLM İşleme<br>Ticari & Yerel Modeller]
        C2[Etkileşim Yöntemleri<br>RAG/Cache/Agents]
    end

    A1 & A2 & A3 & A4 --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
    style A1 fill:#e6b3cc,stroke:#cc6699,stroke-width:2px,color:#000
    style A2 fill:#b3d9ff,stroke:#3399ff,stroke-width:2px,color:#000
    style A3 fill:#c2d6d6,stroke:#669999,stroke-width:2px,color:#000
    style A4 fill:#d9c3e6,stroke:#9966cc,stroke-width:2px,color:#000
    
    style B1 fill:#c6ecd9,stroke:#66b399,stroke-width:2px,color:#000
    style B2 fill:#c6ecd9,stroke:#66b399,stroke-width:2px,color:#000
    
    style C1 fill:#ffe6cc,stroke:#ff9933,stroke-width:2px,color:#000
    style C2 fill:#ffe6cc,stroke:#ff9933,stroke-width:2px,color:#000

    classDef default color:#000
```

> **Not:**  Veri ayrıştırma fonksiyonu şu anda ayrı bir Python sunucusunda uygulanmaktadır. Gelecekte TypeScript’e taşınması planlanmaktadır.

## Başlangıç

## ⚙️ OpenHealth Nasıl Çalıştırılır

<details open>
<summary><b>Kurulum Talimatları</b></summary>

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/OpenHealthForAll/open-health.git
   cd open-health
   ```

2. **Kurulum ve Çalıştırma:**
   ```bash
   # Ortam dosyasını kopyalayın
   cp .env.example .env

   # Docker/Podman Compose ile başlatın
   docker/podman compose --env-file .env up
   ```

   Mevcut kullanıcılar için:
   ```bash
   # .env dosyası için ENCRYPTION_KEY oluşturun:
   # Çıktıyı .env içindeki ENCRYPTION_KEY alanına ekleyin
   echo $(head -c 32 /dev/urandom | base64)

   # Uygulamayı yeniden oluşturup başlatın
   docker/podman compose --env-file .env up --build
   ```
   to rebuild the image. Run this also if you make any modifications to the .env file.

3. **OpenHealth’e Erişim:**
   Tarayıcınızdan `http://localhost:3000` adresine giderek OpenHealth’i kullanmaya başlayabilirsiniz.

> **Note:** Sistem iki ana bileşenden oluşur: ayrıştırma ve LLM. Ayrıştırma için docling kullanabilirsiniz, LLM bileşeni ise Ollama ile tamamen yerel çalıştırılabilir.

> **Note:** Docker ile Ollama kullanıyorsanız, API endpoint’inizi şu şekilde ayarlayın: Mac: `http://docker.for.mac.localhost:11434` ya da Windows: `http://host.docker.internal:11434`.

</details>

---

## Yıldız Geçmişi

[![Star History Chart](https://api.star-history.com/svg?repos=OpenHealthForAll/open-health&type=Date)](https://star-history.com/#OpenHealthForAll/open-health&Date)

---

## 🌐 Topluluk ve Destek

<div align="center">

### 💫 Hikayeni Paylaş | Güncellemeleri Takip Et | Geri Bildirim Ver
[![AIDoctor Subreddit](https://img.shields.io/badge/r/AIDoctor-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/AIDoctor/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/B9K654g4wf)

### 🤝 Ekip ile İletişime Geç
[![Calendly](https://img.shields.io/badge/Schedule_Meeting-00A2FF?style=for-the-badge&logo=calendar&logoColor=white)](https://calendly.com/open-health/30min)
[![Email](https://img.shields.io/badge/Send_Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sj@open-health.me)

</div>

