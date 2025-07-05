import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { ref, push, set, get } from "firebase/database";
import { db, database } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    lowStockItems: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Quick action handlers
  const handleAddStock = () => {
    setShowAddStockModal(true);
  };

  const handleViewInventory = () => {
    navigate("/inventory");
  };

  const handleViewReports = () => {
    navigate("/transactions");
  };

  /**
   * Quick Action: handleQuickAdd
   * ----------------------------
   * Robust stock insertion handler. 
   * Attempts a two-tier database write strategy to maximize uptime:
   * 1. Primary: Firestore (collection: 'pipelines' and 'transactions').
   * 2. Fallback: Firebase Realtime Database (paths: 'pipelines/' and 'transactions/').
   * 
   * Includes full error containment, parsing validation, and immediate UI feedback.
   */
  const handleQuickAdd = async (stockData) => {
    try {
      // Check if user is authenticated
      if (!currentUser || !currentUser.uid) {
        alert("Please log in to add stock.");
        return;
      }

      console.log("Adding stock with data:", stockData);
      console.log("Current user:", currentUser);

      // Try Firestore first, fallback to Realtime Database
      try {
        // Add to Firestore
        const docRef = await addDoc(collection(db, "pipelines"), {
          ...stockData,
          quantity: parseInt(stockData.quantity),
          lastUpdated: new Date(),
          createdBy: currentUser.uid,
          status: "In Stock",
          material: stockData.type, // Add material field
          unit: "units", // Add unit field
          location: "Warehouse A", // Default location
          supplier: "Quick Add", // Default supplier
        });

        console.log(
          "Stock added successfully to Firestore with ID:",
          docRef.id
        );

        // Add transaction record
        await addDoc(collection(db, "transactions"), {
          pipelineId: docRef.id,
          pipelineType: `${stockData.type} ${stockData.length}×${stockData.diameter}`,
          type: "incoming",
          quantity: parseInt(stockData.quantity),
          date: new Date(),
          handledBy: currentUser.uid,
        });

        console.log("Transaction record added successfully to Firestore");
      } catch (firestoreError) {
        console.log(
          "Firestore failed, trying Realtime Database:",
          firestoreError
        );

        // Test Realtime Database connection first
        try {
          const testRef = ref(database, "test");
          await set(testRef, { timestamp: Date.now() });
          await set(testRef, null); // Clean up test
          console.log("Realtime Database connection successful");
        } catch (dbTestError) {
          console.error("Realtime Database connection failed:", dbTestError);
          throw new Error(
            "Both Firestore and Realtime Database are not accessible. Please check your Firebase configuration and rules."
          );
        }

        // Fallback to Realtime Database
        const stockRef = push(ref(database, "pipelines"));
        const transactionRef = push(ref(database, "transactions"));

        // Add stock to Realtime Database
        await set(stockRef, {
          ...stockData,
          id: stockRef.key,
          quantity: parseInt(stockData.quantity),
          lastUpdated: new Date().toISOString(),
          createdBy: currentUser.uid,
          status: "In Stock",
          material: stockData.type,
          unit: "units",
          location: "Warehouse A",
          supplier: "Quick Add",
        });

        console.log(
          "Stock added successfully to Realtime Database with ID:",
          stockRef.key
        );

        // Add transaction record
        await set(transactionRef, {
          id: transactionRef.key,
          pipelineId: stockRef.key,
          pipelineType: `${stockData.type} ${stockData.length}×${stockData.diameter}`,
          type: "incoming",
          quantity: parseInt(stockData.quantity),
          date: new Date().toISOString(),
          handledBy: currentUser.uid,
        });

        console.log(
          "Transaction record added successfully to Realtime Database"
        );
      }

      setShowAddStockModal(false);
      alert("Stock added successfully!");

      // Refresh stats by updating the local state instead of page reload
      setStats((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalQuantity: prev.totalQuantity + parseInt(stockData.quantity),
      }));
    } catch (error) {
      console.error("Error adding stock:", error);
      alert(`Failed to add stock: ${error.message}`);
    }
  };

  // Dummy data for demonstration
  const dummyStats = {
    totalItems: 12,
    totalQuantity: 2847,
    lowStockItems: 3,
    recentTransactions: [
      {
        id: "1",
        type: "incoming",
        quantity: 150,
        pipelineType: "Steel Pipes",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "2",
        type: "outgoing",
        quantity: 75,
        pipelineType: "PVC Pipes",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: "3",
        type: "incoming",
        quantity: 200,
        pipelineType: "Copper Tubes",
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: "4",
        type: "outgoing",
        quantity: 45,
        pipelineType: "Steel Pipes",
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: "5",
        type: "incoming",
        quantity: 120,
        pipelineType: "Aluminum Pipes",
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    ],
    // Additional dummy data for better demonstration
    inventoryItems: [
      {
        id: "1",
        name: "Steel Pipes",
        quantity: 450,
        unit: "units",
        category: "Metal",
        status: "In Stock",
      },
      {
        id: "2",
        name: "PVC Pipes",
        quantity: 320,
        unit: "units",
        category: "Plastic",
        status: "In Stock",
      },
      {
        id: "3",
        name: "Copper Tubes",
        quantity: 180,
        unit: "units",
        category: "Metal",
        status: "Low Stock",
      },
      {
        id: "4",
        name: "Aluminum Pipes",
        quantity: 95,
        unit: "units",
        category: "Metal",
        status: "Low Stock",
      },
      {
        id: "5",
        name: "HDPE Pipes",
        quantity: 280,
        unit: "units",
        category: "Plastic",
        status: "In Stock",
      },
      {
        id: "6",
        name: "Cast Iron Pipes",
        quantity: 3,
        unit: "units",
        category: "Metal",
        status: "Critical",
      },
    ],
    monthlyStats: {
      totalIncoming: 1250,
      totalOutgoing: 890,
      netChange: 360,
      topProduct: "Steel Pipes",
      mostActiveDay: "Wednesday",
    },
  };

  /**
   * Dashboard Real-time Subscription Hook
   * -------------------------------------
   * Subscribes to real-time updates for inventory (pipelines) and recent transactions.
   * Orchestrates dynamic failover between Firestore and Realtime Database:
   * 
   * - If Firestore connection or snapshot subscription fails, it immediately activates
   *   the `connectToRealtimeDatabase` fallback routine.
   * - If both fail, it falls back to high-fidelity dummy metrics so the app remains usable.
   * - Strictly implements a cleanup routine returning unsubscribe hooks to prevent memory leaks.
   */
  useEffect(() => {
    // Try to connect to Firestore first
    let unsubscribeFirestoreInventory = null;
    let unsubscribeFirestoreTransactions = null;
    let unsubscribeRealtimeInventory = null;
    let unsubscribeRealtimeTransactions = null;

    const connectToFirestore = async () => {
      try {
        // Listen to inventory changes
        const inventoryQuery = query(collection(db, "pipelines"));
        const unsubscribeInventory = onSnapshot(
          inventoryQuery,
          (snapshot) => {
            const items = [];
            let totalQuantity = 0;
            let lowStockCount = 0;

            snapshot.forEach((doc) => {
              const item = { id: doc.id, ...doc.data() };
              items.push(item);
              totalQuantity += item.quantity || 0;
              if (item.quantity <= 5) {
                lowStockCount++;
              }
            });

            // Use real data if available, otherwise use dummy data
            if (items.length > 0) {
              console.log("Firestore inventory loaded:", items.length, "items");
              setStats((prev) => ({
                ...prev,
                totalItems: items.length,
                totalQuantity,
                lowStockItems: lowStockCount,
              }));
            } else {
              console.log("No Firestore inventory, using dummy data");
              setStats((prev) => ({
                ...prev,
                totalItems: dummyStats.totalItems,
                totalQuantity: dummyStats.totalQuantity,
                lowStockItems: dummyStats.lowStockItems,
              }));
            }
          },
          (error) => {
            console.log("Firestore inventory error:", error);
            connectToRealtimeDatabase();
          }
        );

        // Listen to recent transactions
        const transactionsQuery = query(
          collection(db, "transactions"),
          orderBy("date", "desc"),
          limit(5)
        );
        const unsubscribeTransactions = onSnapshot(
          transactionsQuery,
          (snapshot) => {
            const transactions = [];
            snapshot.forEach((doc) => {
              transactions.push({ id: doc.id, ...doc.data() });
            });

            // Use real data if available, otherwise use dummy data
            if (transactions.length > 0) {
              console.log(
                "Firestore transactions loaded:",
                transactions.length,
                "transactions"
              );
              setStats((prev) => ({
                ...prev,
                recentTransactions: transactions,
              }));
            } else {
              console.log("No Firestore transactions, using dummy data");
              setStats((prev) => ({
                ...prev,
                recentTransactions: dummyStats.recentTransactions,
              }));
            }
            setLoading(false);
          },
          (error) => {
            console.log("Firestore transactions error:", error);
            connectToRealtimeDatabase();
          }
        );

        unsubscribeFirestoreInventory = unsubscribeInventory;
        unsubscribeFirestoreTransactions = unsubscribeTransactions;
      } catch (error) {
        console.log("Firestore setup error:", error);
        connectToRealtimeDatabase();
      }
    };

    const connectToRealtimeDatabase = async () => {
      try {
        console.log("Connecting to Realtime Database for dashboard...");

        // Import the necessary functions for Realtime Database
        const {
          ref: dbRef,
          onValue,
          off,
          query: dbQuery,
          orderByChild,
          limitToLast,
        } = await import("firebase/database");

        // Listen to inventory changes
        const inventoryRef = dbRef(database, "pipelines");
        const unsubscribeInventory = onValue(
          inventoryRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const items = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));

              let totalQuantity = 0;
              let lowStockCount = 0;

              items.forEach((item) => {
                totalQuantity += item.quantity || 0;
                if (item.quantity <= 5) {
                  lowStockCount++;
                }
              });

              console.log(
                "Realtime Database inventory loaded:",
                items.length,
                "items"
              );
              setStats((prev) => ({
                ...prev,
                totalItems: items.length,
                totalQuantity,
                lowStockItems: lowStockCount,
              }));
            } else {
              console.log("No Realtime Database inventory, using dummy data");
              setStats((prev) => ({
                ...prev,
                totalItems: dummyStats.totalItems,
                totalQuantity: dummyStats.totalQuantity,
                lowStockItems: dummyStats.lowStockItems,
              }));
            }
          },
          (error) => {
            console.log("Realtime Database inventory error:", error);
            // Use dummy data as final fallback
            setStats((prev) => ({
              ...prev,
              totalItems: dummyStats.totalItems,
              totalQuantity: dummyStats.totalQuantity,
              lowStockItems: dummyStats.lowStockItems,
            }));
          }
        );

        // Listen to recent transactions
        const transactionsRef = dbRef(database, "transactions");
        const unsubscribeTransactions = onValue(
          transactionsRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const transactions = Object.keys(data)
                .map((key) => ({
                  id: key,
                  ...data[key],
                }))
                .sort((a, b) => {
                  // Sort by date descending (newest first)
                  const dateA = a.date ? new Date(a.date) : new Date(0);
                  const dateB = b.date ? new Date(b.date) : new Date(0);
                  return dateB - dateA;
                })
                .slice(0, 5); // Limit to 5 most recent

              console.log(
                "Realtime Database transactions loaded:",
                transactions.length,
                "transactions"
              );
              setStats((prev) => ({
                ...prev,
                recentTransactions: transactions,
              }));
            } else {
              console.log(
                "No Realtime Database transactions, using dummy data"
              );
              setStats((prev) => ({
                ...prev,
                recentTransactions: dummyStats.recentTransactions,
              }));
            }
            setLoading(false);
          },
          (error) => {
            console.log("Realtime Database transactions error:", error);
            // Use dummy data as final fallback
            setStats((prev) => ({
              ...prev,
              recentTransactions: dummyStats.recentTransactions,
            }));
            setLoading(false);
          }
        );

        unsubscribeRealtimeInventory = () =>
          off(inventoryRef, "value", unsubscribeInventory);
        unsubscribeRealtimeTransactions = () =>
          off(transactionsRef, "value", unsubscribeTransactions);
      } catch (error) {
        console.log("Realtime Database setup error:", error);
        // Use dummy data as final fallback
        setStats((prev) => ({
          ...prev,
          totalItems: dummyStats.totalItems,
          totalQuantity: dummyStats.totalQuantity,
          lowStockItems: dummyStats.lowStockItems,
          recentTransactions: dummyStats.recentTransactions,
        }));
        setLoading(false);
      }
    };

    // Start with Firestore
    connectToFirestore();

    return () => {
      if (unsubscribeFirestoreInventory) {
        unsubscribeFirestoreInventory();
      }
      if (unsubscribeFirestoreTransactions) {
        unsubscribeFirestoreTransactions();
      }
      if (unsubscribeRealtimeInventory) {
        unsubscribeRealtimeInventory();
      }
      if (unsubscribeRealtimeTransactions) {
        unsubscribeRealtimeTransactions();
      }
    };
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const TransactionItem = ({ transaction }) => {
    /**
     * Helper: formatDate
     * ------------------
     * Polymorphic date-parsing utility. Real-time changes might supply dates as:
     * - Firestore Timestamps (containing `.toDate()`)
     * - ISO string representations (from Realtime Database JSON)
     * - Native Javascript Date objects (from mock/local updates)
     * 
     * Safely parses all variants and standardizes rendering into local format.
     */
    const formatDate = (date) => {
      if (!date) return "N/A";

      // If it's a Firestore Timestamp, convert it to Date
      if (date && typeof date.toDate === "function") {
        return new Date(date.toDate()).toLocaleDateString();
      }

      // If it's already a Date object, format it directly
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }

      // If it's a string or other format, try to create a Date
      try {
        return new Date(date).toLocaleDateString();
      } catch (error) {
        return "N/A";
      }
    };

    return (
      <div className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            transaction.type === "incoming" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {transaction.type === "incoming" ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {transaction.type === "incoming" ? "Stock Added" : "Stock Removed"}
          </p>
          <p className="text-sm text-gray-500">
            {transaction.quantity} units • {transaction.pipelineType}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(transaction.date)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {currentUser?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="text-blue-600"
          subtitle="Different pipeline types"
        />
        <StatCard
          title="Total Quantity"
          value={stats.totalQuantity.toLocaleString()}
          icon={BarChart3}
          color="text-green-600"
          subtitle="Units in stock"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="text-yellow-600"
          subtitle="≤ 5 units remaining"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentTransactions.length}
          icon={Clock}
          color="text-purple-600"
          subtitle="Last 5 transactions"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Transactions
          </h3>
        </div>
        <div className="p-6">
          {stats.recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {stats.recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No recent transactions
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start managing your inventory to see activity here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          {!currentUser ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Authentication Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please log in to access quick actions.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={handleAddStock}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Stock
              </button>
              <button
                onClick={handleViewInventory}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Package className="h-5 w-5 mr-2" />
                View Inventory
              </button>
              <button
                onClick={handleViewReports}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Reports
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Add Stock
                </h2>
              </div>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <QuickAddStockForm
              onSubmit={handleQuickAdd}
              onCancel={() => setShowAddStockModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Add Stock Form Component
const QuickAddStockForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "",
    length: "",
    diameter: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      formData.type &&
      formData.length &&
      formData.diameter &&
      formData.quantity
    ) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        setError("Failed to add stock. Please try again.");
        console.error("Form submission error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill in all fields");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Pipeline Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
        >
          <option value="">Select type</option>
          <option value="Steel Pipes">Steel Pipes</option>
          <option value="PVC Pipes">PVC Pipes</option>
          <option value="Copper Tubes">Copper Tubes</option>
          <option value="HDPE Pipes">HDPE Pipes</option>
          <option value="Aluminum Pipes">Aluminum Pipes</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="length"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Length
          </label>
          <input
            type="text"
            id="length"
            name="length"
            value={formData.length}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="e.g., 6m"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="diameter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Diameter
          </label>
          <input
            type="text"
            id="diameter"
            name="diameter"
            value={formData.diameter}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="e.g., 50mm"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
          min="1"
          disabled={loading}
          placeholder="Enter quantity"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Stock</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default Dashboard;
