# 🚀 **OpenHealth**

<div align="center">

**Yapay Zeka Sağlık Asistanı | Verilerinizle Güçlendirilmiş, Yerel Olarak Çalışır**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Dil-TypeScript-blue?style=for-the-badge" alt="Dil">
  <img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge" alt="Framework">
</p>

> **📢 Artık Web'de Kullanılabilir!**  
> Daha kolay erişim taleplerine yanıt olarak, web sürümünü yayınladık.  
> Hemen deneyin: **[open-health.me](https://open-health.me/)**

### 🌍 Dil Seçenekleri
[Türkçe](i18n/readme/README.tr.md) | [İngilizce](README.md) | [Français](i18n/readme/README.fr.md) | [Deutsch](i18n/readme/README.de.md) | [Español](i18n/readme/README.es.md) | [한국어](i18n/readme/README.ko.md) | [中文](i18n/readme/README.zh.md) | [日本語](i18n/readme/README.ja.md) | [Українська](i18n/readme/README.uk.md) | [Русский](i18n/readme/README.ru.md) | [اردو](i18n/readme/README.ur.md)

</div>

---

<p align="center">
  <img src="/intro/openhealth.avif" alt="OpenHealth Tanıtımı">
</p>

## 🌟 Genel Bakış

> OpenHealth, **sağlık verilerinizin kontrolünü elinize almanıza yardımcı olur**. Yapay zeka ve kişisel sağlık bilgilerinizi kullanarak, OpenHealth size özel bir sağlık asistanı sunar. Üstelik tüm işlemler **yerel olarak çalışır** ve **tamamen gizlidir**.

## ✨ Proje Özellikleri

<details open>
<summary><b>Temel Özellikler</b></summary>

- 📊 **Merkezi Sağlık Verisi Girişi:** Tüm sağlık verilerinizi tek bir yerde toplayın.
- 🛠️ **Akıllı Veri İşleme:** Sağlık verilerinizi otomatik olarak analiz ederek yapılandırılmış veri dosyaları oluşturur.
- 🤝 **Bağlamsal Konuşmalar:** Yapay zeka destekli asistan, yapılandırılmış verileriniz ile kişiselleştirilmiş yanıtlar üretir.

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
      • Genel Sağlık Taramaları<br>
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

## 🤔 OpenHealth Neden Geliştirildi?

> - 💡 **Sağlığınız sizin sorumluluğunuzdadır.**
> - ✅ Gerçek sağlık yönetimi, **verileriniz** + **yapay zeka** kombinasyonu ile içgörüleri eyleme dökerek sağlanır.
> - 🧠 Yapay zeka, sağlığınızı uzun vadeli olarak yönetmenize yardımcı olan tarafsız bir araçtır.

## 🗺️ Proje Diyagramı

```mermaid
graph LR
    subgraph Sağlık Veri Kaynakları
        A1[Hastane Kayıtları<br>Kan Testleri/Tanı/İlaçlar/Görüntüleme]
        A2[Sağlık Platformları<br>Apple Health/Google Fit]
        A3[Giyilebilir Cihazlar<br>Oura/Whoop/Garmin]
        A4[Kişisel Kayıtlar<br>Beslenme/Semptomlar/Aile Geçmişi]
    end

    subgraph Veri İşleme
        B1[Veri Analizi ve Standardizasyon]
        B2[Birleşik Sağlık Verisi Formatı]
    end

    subgraph Yapay Zeka Entegrasyonu
        C1[LLM İşleme<br>Ticari & Yerel Modeller]
        C2[Etkileşim Yöntemleri<br>RAG/Cache/Agents]
    end

    A1 & A2 & A3 & A4 --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
```

> **Not:** Veri işleme özellikleri şu anda ayrı bir Python sunucusunda çalışmaktadır, ancak ilerleyen süreçte TypeScript'e taşınması planlanmaktadır.

## 🚀 Başlarken

## ⚙️ OpenHealth Nasıl Çalıştırılır?

<details open>
<summary><b>Kurulum Talimatları</b></summary>

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/OpenHealthForAll/open-health.git
   cd open-health
   ```

2. **Kurulum ve Çalıştırma:**
   ```bash
   # Çevre dosyasını oluşturun
   cp .env.example .env

   # API anahtarlarını .env dosyasına ekleyin:
   # UPSTAGE_API_KEY - Veri işleme için (https://www.upstage.ai adresinden ücretsiz $10 kredi alabilirsiniz)
   # OPENAI_API_KEY - Gelişmiş analiz için

   # Uygulamayı Docker Compose ile başlatın
   docker compose --env-file .env up
   ```

   Eğer zaten kuruluysa:
   ```bash
   docker compose --env-file .env up --build
   ```
   komutunu çalıştırarak yeni yapılandırmaları uygulayabilirsiniz.

3. **OpenHealth'e Erişim:**
   Tarayıcınızda `http://localhost:3000` adresini açarak OpenHealth'i kullanmaya başlayabilirsiniz.

> **Not:** Sistem iki ana bileşenden oluşur: veri işleme ve yapay zeka. Şu anda veri işleme için Upstage ve OpenAI API'leri kullanılmaktadır. Gelecekte yerel bir analiz aracı eklenecektir. Yapay zeka bileşeni ise tamamen yerel olarak **Ollama** kullanılarak çalıştırılabilir.

> **Not:** Eğer Docker ile Ollama kullanıyorsanız, Mac için `http://docker.for.mac.localhost:11434/`, Windows için `http://host.docker.internal:11434/` API uç noktasını kullanmalısınız.

</details>

---

## ⭐ Yıldız Geçmişi

[![Star History Chart](https://api.star-history.com/svg?repos=OpenHealthForAll/open-health&type=Date)](https://star-history.com/#OpenHealthForAll/open-health&Date)

---

## 🌐 Topluluk ve Destek

<div align="center">

### 💫 Hikayenizi Paylaşın & Geri Bildirim Verin
[![AIDoctor Subreddit](https://img.shields.io/badge/r/AIDoctor-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/AIDoctor/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/B9K654g4wf)

</div>