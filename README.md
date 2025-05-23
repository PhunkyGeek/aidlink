AIDLINK - DECENTRALIZED AID REQUEST PLATFORM

AidLink is a decentralized platform that allows users in need to create aid requests and receive support from verified donors. The app supports Sui Crypto wallet connection, dynamic aid request forms, file uploads, and categorized listings. Built with modern technologies and optimized for a great User experience.


FEATURES

Create Aid Requests with title, description, media, category, location, and optional funding target.

Connect Web3 Wallet for identity and authentication.

Dark Mode Support via a theme toggle.

User Roles for donors and recipients (requesters).

My Requests section for managing previously submitted requests.

Responsive Design that works seamlessly across devices.

Smart UI/UX with modern icons and intuitive layout.


TECHNOLOGIES USED

Technology & Purpose

Next.js 14 (App Router) - Frontend Framework (SSR, Routing, etc.)
React - UI Development
Tailwind CSS - Styling & Responsive Design
TypeScript - Type Safety
Sui Move Contract - Ensure Transparent & Secure Transactions
zkLogin - Application/ Wallet Auth
Firebase - Google & Facebook Auth
w3up - Web3 Storage
sui/dapp - Web3 Wallet Integration (Slush, surf wallet, etc.)
@mysten/sui - Web3 Wallet
Heroicons / React-Icons - Iconography
zustand	State Management
Framer Motion - Animations and transitions


SETUP INSTRUCTIONS

Clone the Repository

git clone https://github.com/yourusername/aidlink.git
cd aidlink

Install Dependencies

npm install
or
yarn install


SET ENVIRONMENT VARIABLES

Create a .env.local file and add the following (example):

WEB3_STORAGE_TOKEN
SUI_NETWORK
EXT_PUBLIC_PACKAGE_ID
ZKLOGIN_PROVIDER
ZKLOGIN_REDIRECT_URI
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id


RUN LOCALLY

npm run dev


VISIT APP

Navigate to: http://localhost:3000


PROJECT STRUCTURE

.
├── components/         # Reusable UI components (Navbar, Sidebar, etc.)
├── app/                # Next.js App Router pages
├── store/              # zustand stores for global state
├── public/             # Static assets (e.g., logo)
├── styles/             # Global styles
├── firebase/           # Firebase config
└── utils/              # Utility functions

HOW IT WORKS

User connects wallet via the “Connect Wallet” button.

Recipient users can navigate to "Submit Aid" and fill out a dynamic form with a title, description, media, category, amount, and location.

Uploaded media is sent to Firebase Storage.

Aid requests are stored in Firestore and shown in the user's dashboard.

Donors can view and filter aid requests via “My Requests”.

Dark mode is toggled via a switch and preserved with local storage.


DEPLOYMENT

You can deploy it easily with Vercel:

Push to GitHub

Connect GitHub repo to Vercel

Set environment variables in Vercel dashboard


ACKNOWLEDGEMENTS

Inspired by humanitarian aid platforms.

Inspired by Sui Overflow Hackathon.

Icons by React Icons.

Web3 interactions by Sui.js.

Backend powered by Firebase.


CONTACT
Built with ❤️ by Ronald Abel-Obi
Discord: @phunkygeek
GitHub: @Phunkygeek
Project inquiries: ronaldabel1996@gmail.com


LICENSE
This project is MIT Licensed.
