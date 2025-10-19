# Admin Dashboard

A modern admin dashboard built with React, Vite, TypeScript, and Tailwind CSS.

## Features

- JWT Authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Light/Dark/System theme support
- Customizable primary color
- Responsive design
- Mock API with MSW
- Data fetching with React Query
- Form validation with React Hook Form + Zod
- Comprehensive UI components

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

\`\`\`bash
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

The app will be available at `http://localhost:5173`

### Build

\`\`\`bash
pnpm build
\`\`\`

### Testing

\`\`\`bash
pnpm test
\`\`\`

## Environment Variables

Create a `.env.local` file:

\`\`\`
VITE_API_BASE_URL=http://25.10.179.249:3000/api
\`\`\`

If not set, the app will use mock API with MSW.

## Dummy Login

- Email: `admin@example.com`
- Password: `password123`

## Project Structure

\`\`\`
src/
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks
├── lib/ # Utilities and configurations
├── mock/ # Mock API handlers
├── pages/ # Page components
├── router/ # Routing configuration
├── store/ # Zustand stores
├── types/ # TypeScript types
└── main.tsx # Entry point
\`\`\`

## Architecture

- **State Management**: Zustand for auth and theme
- **Data Fetching**: React Query with custom hooks
- **Routing**: React Router with code splitting
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form + Zod validation
- **API**: Axios with JWT interceptors

## License

MIT

### Contoh Penggunaan Axios dengan React Query

Untuk memperbarui penggunaan Axios dengan React Query, kita lihat contoh berikut:

// Tampilkan success toast kalau server kirim { message: "Perawat ditambahkan" }
await api.post("/nurse/add", payload, { successToast: true })

// Custom success message
await api.put(`/nurse/${id}`, body, { successToast: true, successMessage: "Data perawat diperbarui" })

// Matikan semua toast
await api.get("/stats", { silent: true })

// Matikan error toast (tangani manual)
await api.delete(`/nurse/${id}`, { errorToast: false })
