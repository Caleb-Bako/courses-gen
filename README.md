# StudyPlan AI — Personalised Academic Scheduler

> **Students using StudyPlan AI reduced their academic planning time by 50%** — spending less time building schedules and more time actually studying.

![StudyPlan AI Screenshot](./screenshot.png)
*Screenshot placeholder — replace with actual app screenshot*

---

## What It Does

StudyPlan AI is an intelligent academic scheduling platform that takes the friction out of semester planning. Students input their courses, credit loads, and availability — and the platform uses Google's Gemini API to generate a personalised, conflict-free study schedule in seconds. No more spreadsheets. No more double-booked exam prep sessions.

---

## Features

**AI-Powered Schedule Generation**
Leverages the Gemini API to analyse student input and produce optimised, personalised academic schedules tailored to individual workloads and learning patterns.

**Credit Unit Validation**
Built-in backend logic validates course credit units against institutional limits, preventing over-enrollment and ensuring schedules are academically sound before they're ever generated.

**Secure User Authentication**
End-to-end user authentication and session management powered by Supabase, keeping student data private and accessible only to the right person.

**Personalised Recommendations**
The AI adapts its suggestions based on course difficulty, credit weight, and student preferences — not a one-size-fits-all template.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Framework | Next.js |
| AI / Schedule Generation | Google Gemini API |
| Backend & Auth | Supabase |
| Language | TypeScript / JavaScript |

---

## How It Works

Student inputs courses, credit units, and availability
        ↓
Backend validates credit load and flags conflicts
        ↓
Validated data is sent to the Gemini API with a structured prompt
        ↓
Gemini returns a personalised schedule recommendation
        ↓
Schedule is displayed, saved, and accessible via the student's dashboard

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) project (for auth and database)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

### Installation

1. **Clone the repository**

bash
git clone https://github.com/Caleb-Bako/studyplan-ai.git
cd studyplan-ai

2. **Install dependencies**

bash
npm install

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

4. **Run the development server**

bash
npm run dev

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

bash
npm run build
npm start

---

## Project Structure

studyplan-ai/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components
├── lib/                  # Supabase client, Gemini integration, utilities
├── utils/                # Credit unit validation logic and helpers
└── public/               # Static assets

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## License

This project is open source and available under the [MIT License](./LICENSE).

---

<div align="center">

Built by **Caleb Bako**

[github.com/Caleb-Bako](https://github.com/Caleb-Bako) · [linkedin.com/in/caleb-bako](https://linkedin.com/in/caleb-bako)

</div>
