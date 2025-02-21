# 🚀 **OpenHealth**

<div align="center">

**AI健康助手 | 由您的数据驱动**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge" alt="Language">
  <img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge" alt="Framework">
</p>

> **📢 网页版现已上线！**  
> 应用户要求提供更便捷的使用方式，我们推出了网页版。  
> 立即体验：**[open-health.me](https://open-health.me/)**

### 🌟 概述

OpenHealth帮助您**掌控健康数据**。通过利用AI和您的个人健康信息，
OpenHealth提供私密的助手，帮助您更好地理解和管理健康。为了最大程度地保护隐私，您可以完全在本地运行。

---

## ✨ 项目特点

- 📊 **集中化健康数据输入：** 轻松整合所有健康数据于一处
- 🛠️ **智能解析：** 自动解析您的健康数据并生成结构化数据文件
- 🤝 **上下文对话：** 使用结构化数据作为上下文，与GPT驱动的AI进行个性化交互

---

## 📥 支持的数据源和语言模型

| **可添加的数据源** | **支持的语言模型** |
|-------------------|-------------------|
| 血液检测结果      | LLaMA,DeepSeek-V3  |
| 体检数据          | GPT,Claude,Gemini  |
| 个人体格信息      |                   |
| 家族病史          |                   |
| 症状              |                   |

---

## 🤔 为什么我们建立OpenHealth

- 💡 **您的健康由您负责。**
- ✅ 真正的健康管理结合**您的数据** + **智能**，将洞察转化为可行计划。
- 🧠 AI作为无偏见的工具，有效指导和支持您管理长期健康。

---

## 🗺️ 项目图示

```plaintext
健康数据输入 --> 数据解析模块 --> 结构化数据文件 --> GPT集成
```

> **注意：** 数据解析功能目前在独立的Python服务器中实现，计划未来迁移到TypeScript。

## 开始使用

## ⚙️ 如何运行 OpenHealth

1. **克隆仓库：**
   ```bash
   git clone https://github.com/OpenHealthForAll/open-health.git
   cd open-health
   ```

2. **设置和运行：**
   ```bash
   # 复制环境文件
   cp .env.example .env

   # 使用Docker Compose启动应用
   docker compose --env-file .env up
   ```

   对于现有用户：
   ```bash
   # 生成 .env 文件的 ENCRYPTION_KEY：
   # 运行以下命令并将输出添加到 .env 的 ENCRYPTION_KEY
   echo $(head -c 32 /dev/urandom | base64)

   # 重新构建并启动应用
   docker compose --env-file .env up --build
   ```

3. **访问OpenHealth：**
   打开浏览器并访问 `http://localhost:3000` 开始使用OpenHealth。

> **注意：** 系统由解析和LLM两个主要组件组成。对于解析，您可以使用docling进行完全本地执行，而LLM组件可以使用Ollama在本地完全运行。

> **注意：** 如果您使用Docker运行Ollama，请确保将Ollama API端点设置为：`http://docker.for.mac.localhost:11434`（Mac用户）或 `http://host.docker.internal:11434`（Windows用户）

---

## 🌐 社区与支持

<div align="center">

### 💫 分享您的故事并获取更新
[![AIDoctor Subreddit](https://img.shields.io/badge/r/AIDoctor-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/AIDoctor/)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/B9K654g4wf)

### 🤝 与团队交流
[![Calendly](https://img.shields.io/badge/预约会议-00A2FF?style=for-the-badge&logo=calendar&logoColor=white)](https://calendly.com/open-health/30min)
[![Email](https://img.shields.io/badge/发送邮件-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sj@open-health.me)

</div> 