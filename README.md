# Pipeline Stock Management MVP

A modern, real-time stock management application built for pipeline-selling companies. This MVP provides comprehensive inventory tracking, transaction history, and user authentication.

## 🚀 Features

### Core Functionality
- **Real-time Inventory Management** - Track pipeline stock with live updates
- **User Authentication** - Secure login with email/password and Google OAuth
- **Stock CRUD Operations** - Add, edit, delete, and update stock quantities
- **Transaction History** - Complete audit trail of all stock movements
- **Low Stock Alerts** - Automatic notifications for items with ≤5 units
- **Search & Filter** - Find items quickly by type, material, or dimensions

### Technical Features
- **Real-time Updates** - Live synchronization across all devices
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI** - Clean, intuitive interface built with TailwindCSS
- **Cloud Database** - Firebase Firestore for reliable data storage
- **Secure Authentication** - Firebase Auth with role-based access

## 🛠 Tech Stack

- **Frontend**: React 18, React Router v6
- **Styling**: TailwindCSS
- **Backend**: Firebase (Firestore, Authentication)
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel/Firebase Hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-management-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Get your Firebase config and update `src/firebase.js`

4. **Configure Firebase**
   ```javascript
   // src/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## 🗄 Database Structure

### Collections

#### `pipelines`
```json
{
  "id": "auto-generated",
  "type": "PVC",
  "length": "6m",
  "diameter": "100mm",
  "material": "PVC",
  "quantity": 50,
  "lastUpdated": "timestamp",
  "createdBy": "userId"
}
```

#### `transactions`
```json
{
  "id": "auto-generated",
  "pipelineId": "reference-to-pipeline",
  "pipelineType": "PVC 6m×100mm",
  "type": "incoming|outgoing",
  "quantity": 10,
  "date": "timestamp",
  "handledBy": "userId"
}
```

## 📱 Pages & Features

### Dashboard
- Overview statistics (total items, quantity, low stock alerts)
- Recent transaction history
- Quick action buttons

### Inventory Management
- Complete stock listing with search and filters
- Add new pipeline items
- Edit existing items
- Quick quantity updates
- Delete items with confirmation

### Transaction History
- Complete audit trail of all stock movements
- Filter by transaction type and date
- Summary statistics (incoming, outgoing, net change)

### Authentication
- Email/password registration and login
- Google OAuth integration
- Protected routes for authenticated users

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Firebase Security Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pipelines/{document} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 🔮 Future Enhancements

### AI/ML Integration (Emergent)
- **Invoice Scanning** - Auto-populate stock details from invoice images
- **Natural Language Search** - "Show me all steel pipelines under 50mm"
- **Predictive Analytics** - Restocking recommendations based on usage patterns
- **Smart Alerts** - Intelligent low-stock predictions

### Advanced Features
- **Barcode/QR Code Scanning** - Quick item identification
- **Export/Import** - CSV/Excel data import/export
- **Advanced Reporting** - Custom date ranges, analytics dashboards
- **Multi-location Support** - Warehouse management
- **Supplier Management** - Track suppliers and reorder points

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Firebase documentation for backend issues

---

**Built with ❤️ for pipeline companies**
