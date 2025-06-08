# SmartShopper: Your Intelligent Grocery List Manager

SmartShopper is a smart and intuitive web application designed to simplify your grocery shopping experience. It helps you organize your shopping list by store sections, leverage AI for item mapping, and manage your lists efficiently, making your trips to the supermarket faster and smarter.

## ✨ Features

- **Intelligent List Sorting**: Automatically organizes your raw shopping list into logical store sections (e.g., Dairy, Produce, Bakery) based on pre-defined or AI-suggested mappings.
- **Customizable Store Layouts**: Allows you to define and manage your own store layouts by mapping specific items to their corresponding sections, ensuring the list matches your local supermarket's arrangement.
- **AI-Powered Item Mapping**: Utilizes a large language model (Gemini API) to suggest common supermarket sections for items not yet mapped in your custom layout.
- **Drag-and-Drop Section Reordering**: Easily reorder sections in your sorted list to match your preferred shopping path within the store.
- **Item Management**: Add, remove, and mark items as "bought" within your list.
- **Save and Load Lists**: Persist your shopping lists and store layouts securely in the cloud using Firebase Firestore.
- **Multi-language Support**: Toggle between English and Hebrew for a localized user experience.
- **Dark Mode**: Switch between light and dark themes for comfortable viewing in any environment.
- **Interactive 3D Element**: A subtle 3D shopping cart animation adds a modern visual touch.
- **Smooth UI Animations**: Utilizes GSAP for smooth scroll-triggered and dynamic cursor animations.

## 🚀 Technologies Used

- **React**: Frontend JavaScript library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and responsive design.
- **Firebase (Authentication & Firestore)**: Backend-as-a-Service for user authentication (anonymous sign-in) and cloud-based data storage.
- **Google Gemini API**: Used for intelligent item-to-section mapping suggestions.
- **Three.js**: JavaScript 3D library for rendering the interactive shopping cart.
- **GSAP**: Powerful JavaScript animation library for UI effects.
- **Vite**: Fast frontend build tool.

## ⚙️ Setup and Installation (For Local Development)

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-shopper.git
cd smart-shopper
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Project Setup

**Create a Firebase Project:**

- Go to the Firebase Console.
- Click "Add project" and follow the steps to create a new Firebase project.

**Create a Firestore Database:**

- In your Firebase project, navigate to "Build" > "Firestore Database".
- Click "Create database". Choose "Start in production mode", then select a location.

**Register a Web App:**

- In Firebase settings, add a new web app and copy the `firebaseConfig` object.

**Configure Firebase Security Rules:**

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Environment Variables

Create a `.env.local` file with:

```bash
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
# VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional
```

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Access the app at `http://localhost:5173`.

## 🛳 Deploying the Backend to Cloud Run

The Express server resides in the `/server` folder. To deploy it using Cloud Run's
source-based workflow, run:

```bash
gcloud run deploy backend --source ./server --region us-central1 --allow-unauthenticated
```

The service name `backend` matches the Firebase Hosting rewrite that forwards `/api/**`
requests to your Cloud Run instance.

## 💡 Usage

- **Add Items**: Type grocery items, one per line, then click "Add Items".
- **Sort List**: Click "Sort by Section".
- **Customize Layout**: Update item-to-section mappings under "Store Layout".
- **Reorder Sections**: Drag and drop sections to rearrange.
- **Mark as Bought**: Check items off your list.
- **Save/Load Lists**: Persist your shopping lists via cloud.

## 🔒 Security Considerations

- **Firebase Security Rules**: Prevent unauthorized access.
- **API Keys**: Keep server-side credentials private.
- **Anonymous Authentication**: Consider upgrading to persistent methods if needed.

## 🤝 Contributing

Feel free to open issues or submit PRs for enhancements or fixes.

## 📄 License

This project is open-source under the MIT License.
