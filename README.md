# Next.js/Redis vibecodedtrash-kanban-board-ui 

A high-performance, interactive Kanban board built with **Next.js 16** (App Router) and **Redis**. This project demonstrates how to effectively use Redis as a primary data store for application state, leveraging its speed for a responsive user experience.

## 🏗 Architecture

This application uses a modern serverless-friendly architecture:

### Frontend
- **Framework**: Next.js 16 App Router.
- **UI Components**: Built with React, Tailwind CSS, and Radix UI (via shadcn/ui).
- **State Management**: React `useState` / `useEffect` with optimistic UI updates for drag-and-drop operations.

### Backend
- **API Routes**: Next.js Route Handlers (`/app/api/...`) serve as the interface between the client and the database.
- **Database**: **Redis**. We use `ioredis` to connect to a Redis instance.
- **Data Modeling**:
  - **Columns**: Stored in a Redis Hash (`kanban:columns`) where fields are column IDs and values are JSON strings.
  - **Tasks**: Stored in a Redis Hash (`kanban:tasks`) where fields are task IDs and values are JSON strings.

### The Real-time Aspect ⚡

One of the key focuses of this project is **responsiveness**.

#### Current Implementation: Polling Strategy
To ensure all users see the latest board state without complex WebSocket infrastructure, the current implementation uses a **polling strategy**:
- The client (`KanbanBoard` component) automatically fetches the latest data from the API every **2 seconds**.
- This "near real-time" approach is simple, robust, and works perfectly in serverless environments where maintaining persistent WebSocket connections can be challenging or costly.
- Redis's in-memory nature ensures that these frequent read operations are extremely fast (<1ms), making high-frequency polling viable without database bottlenecks.

#### Future Real-time Enhancements
For true event-driven real-time updates, the architecture is ready to be extended with:
- **Redis Pub/Sub**: The backend could publish events (`task:moved`, `task:created`) to a Redis channel.
- **WebSockets**: A separate WebSocket server (or service like Pusher/Ably) could subscribe to these Redis channels and push updates to connected clients instantly, removing the need for polling.

## 📂 Project Structure

```bash
├── app/
│   ├── api/            # Next.js Route Handlers (Backend API)
│   │   ├── columns/    # API for creating/deleting columns
│   │   └── tasks/      # API for CRUD operations on tasks
│   ├── page.tsx        # Main application page
│   └── layout.tsx      # Root layout
├── components/
│   ├── kanban-board.tsx # Main board logic (Drag & Drop, Polling)
│   ├── kanban-column.tsx # Column UI resource
│   └── ...             # Other UI components
├── lib/
│   └── redis.ts        # Redis client configuration (ioredis)
├── types/              # TypeScript definitions
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A running Redis instance (Local or Cloud)

### Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   # Defaults to localhost:6379 if not set
   REDIS_URL=redis://localhost:6379
   ```

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000).

## 🔮 Future Improvements

- [ ] **True Real-time**: Replace polling with WebSockets/Server-Sent Events backed by Redis Pub/Sub.
- [ ] **Persistence**: Add a persistence layer (e.g., PostgreSQL) for long-term storage, using Redis as a write-through cache.
- [ ] **Authentication**: Add user auth to support multiple private boards.
- [ ] **Drag & Drop library**: Integrate `dnd-kit` for more accessible and robust drag-and-drop interactions.
