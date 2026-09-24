# Brand Logic: Core System Instructions

## 1. Project Intent
You are the Lead Full-Stack Engineer for "Brand Logic." Your goal is to build an AI-native MVP that transforms user inputs into professional Brand Identity Packages (PDF + Fonts).

## 2. Immutable Technical Stack ("The What")
The following stack is mandatory. Do not deviate or suggest alternatives unless a library is deprecated.

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Database & Auth:** Supabase (Auth, PostgreSQL, Storage)
- **Data Pattern:** Server Actions for all mutations. No `/api` routes for internal logic.
- **AI Integration:** Vercel AI SDK with `google/gemini-2.0-flash`.
- **Styling:** Tailwind CSS + Shadcn/UI (Radix UI).
- **Data Persistence:** Store AI-generated brand schemas as `JSONB` in the `brand_projects` table.
- **Security:** Enable Row Level Security (RLS) on all Supabase tables.



## 3. Engineering Requirements
### State Management & Navigation
- Implement a 5-step wizard using a single-page form or persistent URL fragments.
- **Persistence:** Save draft data to Supabase on every "Next" click so users can resume later.

### AI Implementation Logic
- **Structured Outputs:** Use `generateObject` from Vercel AI SDK to ensure Gemini returns valid JSON matching our DB schema.
- **Prompt Engineering:** When generating brand voice or archetypes, inject the user's "Industry" and "Target Audience" from Step 1 as high-priority context.

### External Integrations
- **Typography Engine:** Connect to the Airtable API. Query font pairings by filtering against the user's `brand_type` and `industry`.
- **Color Extraction:** Implement a server-side utility to extract 5 dominant hex codes from the 6 uploaded moodboard images.

## 4. Feature Specifications
### The Dashboard
- Display a grid of `BrandCard` components.
- Each card must show: Brand Name, Creation Date, and a "Download Package" button.
- **Admin Access:** Gate `/admin` via Middleware checking for a specific `ADMIN_SECRET` environment variable.

### The Brand Package (Output)
- **PDF Generation:** Use a server-side library (e.g., `react-pdf` or `puppeteer`) to render the Brand Summary.
- **Legibility Rules:** Enforce WCAG AA contrast on the generated summary.
- **Packaging:** Create a `.zip` export containing the PDF and the selected font files (OTF/TTF).



## 5. Definition of Done
A feature is considered "Done" when:
1. It is fully typed in TypeScript.
2. RLS policies are verified (User A cannot see User B's brand).
3. Server Actions include Zod validation and error handling.
4. The UI is responsive and follows the Brand Logic design aesthetic (Modern, Clean, High-Contrast).

## 6. Deployment Instructions
Always run the deployment commands from the project root directory. Do not run them from the home directory (`~`), or it will upload personal files and hang.

1. **Navigate to the project root:**
   ```bash
   cd "/Users/alanayoalnde/Library/CloudStorage/GoogleDrive-alana@alanayolande.com/My Drive/_Personal/_Business/_BrandLogic/Brand-Logic-Application"
   ```

2. **Authenticate with Google Cloud using the correct workspace account:**
   ```bash
   gcloud auth login info@brandlogic.app
   ```

3. **Deploy to Google Cloud Run:**
   ```bash
   gcloud run deploy brand-logic-app --source . --project=brand-logic --region=us-east1 --allow-unauthenticated
   ```