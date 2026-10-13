# 🎓 TradEITI - Class Schedule Exchange App for Students  

## 🌟 Project Overview  

TradEITI is a **web application** designed to simplify the process of **class schedule exchanges** for students.  
During our first year of university, we identified a significant problem: the lack of a dedicated platform for swapping class hours between students.  

🚫 **The Problem:**  
Students often rely on rudimentary solutions like shared Google Docs, which are inefficient and time-consuming.  

✅ **Our Solution:**  
TradEITI aims to provide a **seamless and efficient platform** to empower students to manage their schedules effortlessly.  

---

## 🛠️ Technology Stack  

| Component   | Technology       |
|-------------|------------------|
| **Backend** | Spring Boot 4, Java 25 |
| **Frontend**| React 19, Vite, TanStack Query |
| **Database**| PostgreSQL       |

---

## 🔗 Integration with USOS API  

To enhance usability, TradEITI integrates with the **USOS API**, allowing students to securely log in using their existing credentials.  
✨ **Benefits:**  
- Personalized access  
- Secure authentication  
- Streamlined user experience  

---

## ✨ Key Features  

TradEITI will offer a range of features to make schedule exchanges easy and efficient:  

- 📝 **Create Offers:** Post new class schedule exchange offers.  
- 🔍 **Search Functionality:** Browse and filter offers with dynamic search options.  
- 📋 **Offer Management:** Manage, edit, or delete your posted offers.  
- 🤝 **Exchange Agreements:** Accept and finalize exchanges with fellow students directly through the platform.  

---

## 🚀 Running locally

Requirements: Docker with Compose.

```bash
cp .env.example .env
# set JWT_KEY in .env, e.g. to the output of: openssl rand -base64 32
docker compose up --build
```

The app is available at http://localhost:8091 (API docs: http://localhost:8091/api/docs/ui).

By default the backend runs with **`USOS_MOCK=true`**: instead of the real USOS it uses generated timetables, so no USOS
API keys are needed and every account is "connected" right after registration. Each account lands in different groups,
so you can register two accounts and exchange groups between them. To use the real USOS PW API, set `USOS_MOCK=false`
together with `CONSUMER_KEY` / `CONSUMER_SECRET` (https://apps.usos.pw.edu.pl/developers/).

### Development

| | Command |
|---|---|
| Backend tests + static analysis (SpotBugs, FindSecBugs) | `cd backend && ./mvnw verify` (Java 25) |
| Frontend dev server (proxies `/api` to `localhost:8090`) | `cd frontend && npm ci && npm run dev` |
| Frontend lint / tests / build | `npm run lint`, `npm test`, `npm run build` |

---

## 👥 Meet the Team  

We are a group of passionate developers dedicated to solving student-centric problems:  

- **Oliwier Szypczyn**  
- **Artur Kempiński**  
- **Kacper Multan**  
- **Jakub Kryczka**  

---

## 📜 License  

This project is distributed under a **proprietary license**.  
💡 All rights reserved.  

---

🌟 **We’re excited to bring TradEITI to life and revolutionize how students manage their schedules!**  
