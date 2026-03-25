# SetVenue

**Locations. Stays. Events. One platform.**

SetVenue is a production marketplace connecting property owners with filmmakers, photographers, event planners, and production professionals seeking short-term location rentals for shoots, stays, and events.

---

## ✨ Features

### For Production Teams
- Browse locations by type (house, apartment, studio, outdoor)
- Filter by amenities, price, and availability
- Book locations, crew housing, and event venues in one place
- View photo galleries and detailed property info
- Secure payment via Stripe

### For Property Owners
- Create listings with photos, descriptions, pricing, and availability
- Set privacy tiers and booking rules
- Approve/decline booking requests
- **0% host fees** — only guests pay the 10% platform fee

### Platform
- Dual-role dashboards (Guest & Host)
- Real-time booking management
- Admin dashboard for oversight
- Legal compliance (terms, privacy, insurance verification)

---

## 💰 Pricing

| Platform | Fee |
|----------|-----|
| **SetVenue** | **10% guest fee, 0% host fee** |
| Giggster | 15-25% |
| Peerspace | ~20% |

We pass the savings directly to production teams.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** JSON-file based (MVP) → Supabase (planned)
- **Payments:** Stripe
- **Storage:** Cloudflare R2 / S3 (for photos)
- **Authentication:** NextAuth.js

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm/bun
- Stripe account (for payment processing)
- (Optional) Cloudflare R2 / S3 bucket for photo storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LISTINGAINOW/SetVenue.git
   cd SetVenue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   Required variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 📦 Deployment

The easiest way to deploy SetVenue is with [Vercel](https://vercel.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLISTINGAINOW%2FSetVenue)

### Steps
1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the required environment variables in the Vercel project settings.
4. Deploy — Vercel will automatically build and host your app.

---

## 📁 Project Structure

```
setvenue/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable React components
├── data/            # JSON-file database (MVP)
├── types/           # TypeScript type definitions
├── public/          # Static assets
└── ...
```

---

## 🔧 Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm start` – Run production server
- `npm run lint` – Run ESLint

---

## 📄 License

Proprietary – All rights reserved.

---

## 🤝 Contributing

Currently not accepting external contributions.  
For feedback or suggestions, please open an issue on the repository.

---

*Built with ❤️ by the SetVenue team.*
