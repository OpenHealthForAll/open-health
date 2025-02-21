# 🚀 **OpenHealth**

<div align="center">

**AI 건강 도우미 | 당신의 데이터로 구동**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge" alt="Language">
  <img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge" alt="Framework">
</p>

> **📢 웹 버전 출시!**  
> 더 쉽게 사용하고 싶다는 의견을 반영하여 웹 버전을 출시했습니다.  
> 지금 바로 사용해보세요: **[open-health.me](https://open-health.me/)**

### 🌟 개요

OpenHealth는 **당신의 건강 데이터를 관리**하도록 도와줍니다. AI와 개인 건강 정보를 활용하여,
OpenHealth는 건강을 더 잘 이해하고 관리할 수 있도록 도와주는 프라이빗한 도우미를 제공합니다. 최대한의 개인정보 보호를 위해 완전히 로컬에서 실행할 수 있습니다.

---

## ✨ 프로젝트 특징

- 📊 **중앙화된 건강 데이터 입력:** 모든 건강 데이터를 한 곳에서 쉽게 통합
- 🛠️ **스마트 파싱:** 건강 데이터를 자동으로 파싱하여 구조화된 데이터 파일 생성
- 🤝 **맥락 기반 대화:** GPT 기반 AI와의 개인화된 상호작용을 위해 구조화된 데이터를 컨텍스트로 활용

---

## 📥 지원되는 데이터 소스 & 언어 모델

| **추가 가능한 데이터 소스** | **지원되는 언어 모델** |
|----------------------------|------------------------|
| 혈액 검사 결과             | LLaMA,DeepSeek-V3      |
| 건강 검진 데이터           | GPT,Claude,Gemini      |
| 개인 신체 정보             |                        |
| 가족력                     |                        |
| 증상                       |                        |

---

## 🤔 OpenHealth를 만든 이유

- 💡 **건강은 당신의 책임입니다.**
- ✅ 진정한 건강 관리는 **당신의 데이터** + **지능**을 결합하여 통찰력을 실행 가능한 계획으로 전환합니다.
- 🧠 AI는 장기적인 건강 관리를 효과적으로 안내하고 지원하는 편견 없는 도구 역할을 합니다.

---

## 🗺️ 프로젝트 다이어그램

```plaintext
건강 데이터 입력  -->  데이터 파싱 모듈  -->  구조화된 데이터 파일  -->  GPT 통합
```

> **참고:** 현재 데이터 파싱 기능은 별도의 Python 서버에서 구현되어 있으며, 추후 TypeScript로 마이그레이션될 예정입니다.

## 시작하기

## ⚙️ OpenHealth 실행 방법

1. **저장소 클론:**
   ```bash
   git clone https://github.com/OpenHealthForAll/open-health.git
   cd open-health
   ```

2. **설치 및 실행:**
   ```bash
   # 환경 설정 파일 복사
   cp .env.example .env

   # Docker Compose로 애플리케이션 시작
   docker compose --env-file .env up
   ```

   기존 사용자의 경우:
   ```bash
   # .env 파일의 ENCRYPTION_KEY 생성:
   # 아래 명령어를 실행하고 출력값을 .env의 ENCRYPTION_KEY에 추가하세요
   echo $(head -c 32 /dev/urandom | base64)

   # 이미지 재빌드 및 시작
   docker compose --env-file .env up --build
   ```

3. **OpenHealth 접속:**
   브라우저에서 `http://localhost:3000`에 접속하여 OpenHealth를 시작하세요.

> **참고:** 시스템은 파싱과 LLM 두 가지 주요 구성 요소로 이루어져 있습니다. 파싱의 경우 [DOCLING](https://github.com/DS4SD/docling)을 사용하여 완전한 로컬 실행이 가능하며, LLM 구성 요소는 Ollama를 사용하여 완전히 로컬에서 실행할 수 있습니다.

> **참고:** Docker에서 Ollama를 사용하는 경우, Ollama API 엔드포인트를 다음과 같이 설정하세요: `http://docker.for.mac.localhost:11434` (Mac의 경우) 또는 `http://host.docker.internal:11434` (Windows의 경우)

---

## 🌐 커뮤니티 및 지원

<div align="center">

### 💫 여러분의 이야기를 공유하고 업데이트 받기
[![AIDoctor Subreddit](https://img.shields.io/badge/r/AIDoctor-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/AIDoctor/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/B9K654g4wf)

### 🤝 팀과 대화하기
[![Calendly](https://img.shields.io/badge/미팅_예약-00A2FF?style=for-the-badge&logo=calendar&logoColor=white)](https://calendly.com/open-health/30min)
[![Email](https://img.shields.io/badge/이메일_보내기-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sj@open-health.me)

</div> 