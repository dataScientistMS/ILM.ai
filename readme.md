# ILM.ai

ILM.ai is a mobile AI-powered chat application tailored for the Muslim community. Its core purpose is to provide reliable, religiously grounded responses, each accompanied by references from Islamic texts such as the Qur'an and authentic Hadiths.

## Why ILM.ai?

The biggest challenge with AI in religious contexts is trust. Many Muslims are understandably cautious about relying on AI for religious guidance. ILM.ai was created specifically to address this issue, ensuring transparency, accuracy, and traceability by always attaching references to every AI-generated response.

## Project Structure

This repository contains three main directories:

### `QuranApp/` (Frontend)
- Cross-platform mobile app (iOS and Android)
- Clean, intuitive interface
- Integration with authentication and real-time chat via WebSocket
  
This is the mobile app built with **React Native (Expo)**. It contains the vast majority of the project's complexity.  
The main business logic is located in the `screens/` folder, which I structured according to major features.  
To be fully transparent: I did not follow any strict design pattern or architecture at this stage. I had to move quickly and plan to refactor the codebase to improve maintainability and structure.

### `QuranAppBackend/` (Backend 1)
- Handles authentication (OAuth2 via Google/Apple), admin panel, API endpoints, and data persistence
- Robust ORM and admin tools for managing users, chats, and references
  
This is a **Django-based API server**. It handles user authentication (via OAuth2), account management, and some data-related endpoints.  
It also includes remnants of older features that were later moved to the frontend or to the FastAPI service.  
Despite being the more "monolithic" part, it remains stable and handles important administrative features thanks to Django's ecosystem (admin panel, ORM, etc.).

### `FastAPI/` (Backend 2)
- Manages real-time WebSocket communication with clients
- Handles high-concurrency streaming from the OpenAI API using async/multithreaded architecture
- Isolated for better performance and scaling
  
This is a **lightweight, high-performance FastAPI server**.  
It has a very specific and critical role: managing **real-time WebSocket communication** with OpenAI.  
It receives user messages, forwards them to OpenAI, and streams the responses back.  
To handle high traffic and concurrency, it uses **async I/O**, **multi-threading**, and a **PostgreSQL connection pool**.

---

> The separation between Django and FastAPI was intentional: Django handles what it does best (auth, admin, DB), while FastAPI manages async-heavy real-time tasks.


## Technologies Used

- **Frontend**: React Native (Expo), Javascript
- **Backend (API & DB)**: Django, PostgreSQL, SimpleJWT, Allauth
- **Realtime Backend**: FastAPI, WebSockets, Async OpenAI API
- **Others**: Docker, Heroku, GitHub Actions, .env config, PostgreSQL on AWS RDS

## Features

| Functionality |
|---------------|
| OAuth2 authentication (Google & Apple) |
| In-app purchases via Apple Pay & Google Pay |
| Real-time AI chat |
| Interactive and clickable sources |
| Audio playback when available (auto-play supported) |
| Tafsir (exegesis) display when available |
| Interactive mode with 3 anticipated questions |
| Multiple concurrent chat threads |
| Prayer times based on GPS location |
| Qibla direction using magnetometer, gyroscope and GPS |
| Quran & Hadith reading with audio and tafsir |
| Daily routine: verse of the day, hadith of the day, dikr, and 10 verses |


## Environment Configuration

Sensitive data like API keys, database credentials, and OAuth secrets are managed through environment variables. Example `.env` variables:

## Some screen

![Home screen](./screenshots/home.png)
![Test flight](./screenshots/testflight.png)
![Chat](./screenshots/question.png)
![Logo](./screenshots/logo.jpg)
![Daily verse](./screenshots/dailyverses.png)
![Research function](./screenshots/research.png)







