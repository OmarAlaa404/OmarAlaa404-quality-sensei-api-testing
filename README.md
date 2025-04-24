
# Quality Sensei - API Testing Playground  
A fullstack educational tool for learning and practicing API testing concepts, built using modern technologies including Express.js, React, and TypeScript.

---

## ✨ Features

- 🔧 Interactive API testing interface  
- 📘 Swagger/OpenAPI auto-generated documentation  
- 🗂️ Board & card management system  
- 🔐 Authentication & user management  
- 🌈 Modern UI built with Tailwind CSS & Radix UI  

---

## 🔧 Tech Stack

- **Frontend Framework:** React 18  
- **Type System:** TypeScript  
- **Styling:** Tailwind CSS, Radix UI  
- **Backend Framework:** Express.js  
- **ORM & DB:** Drizzle ORM + PostgreSQL  
- **API Docs:** Swagger/OpenAPI  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)  
- npm (or yarn)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the app at:
👉 http://0.0.0.0:5000

### 🔑 Default Credentials
- Username: QualitySensei
- Password: (contact administrator)

## 📚 API Endpoints

### 🧾 Authentication
- POST `/api/login` – Login and receive token
- POST `/api/register` – Register new user
- POST `/api/logout` – Logout
- GET `/api/user` – Get current user info

### 📋 Boards
- GET `/boards` – Get all boards
- POST `/boards` – Create a new board
- GET `/boards/{id}` – Get a specific board
- PUT `/boards/{id}` – Update a board
- DELETE `/boards/{id}` – Delete a board

### 🧩 Lists
- GET `/boards/{boardId}/lists` – Lists in a board
- POST `/boards/{boardId}/lists` – Create new list
- PUT `/boards/{boardId}/lists/{listId}` – Update list
- DELETE `/boards/{boardId}/lists/{listId}` – Delete list

### 🃏 Cards
- GET `/lists/{listId}/cards` – Cards in a list
- POST `/lists/{listId}/cards` – Create new card
- PATCH `/lists/{listId}/cards/{cardId}` – Update card
- DELETE `/lists/{listId}/cards/{cardId}` – Delete card

## 🔎 Query Parameters

### Pagination
- `page` – Page number (starting from 1)
- `limit` – Items per page

Example:
```bash
/api/boards?page=1&limit=10
```

### Search
#### Boards
```sql
/api/boards/search?name=MyBoard&description=Test
```

#### Cards
```arduino
/api/cards/search?title=Task&label=important&due=2024-02-20
```

### Sorting (Cards Only)
- `sort` – Field name
- `order` – asc or desc

Example:
```bash
/api/lists/{listId}/cards?sort=title&order=desc
```

## 🛠 Development Scripts
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint
