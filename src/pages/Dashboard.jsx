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

  useEffect(() => {
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
          setStats((prev) => ({
            ...prev,
            totalItems: items.length,
            totalQuantity,
            lowStockItems: lowStockCount,
          }));
        } else {
          // Set dummy data if no real data exists
          setStats((prev) => ({
            ...prev,
            totalItems: dummyStats.totalItems,
            totalQuantity: dummyStats.totalQuantity,
            lowStockItems: dummyStats.lowStockItems,
          }));
        }
      },
      (error) => {
        console.log("Firebase connection error, using dummy data:", error);
        // If Firebase fails, use dummy data
        setStats((prev) => ({
          ...prev,
          totalItems: dummyStats.totalItems,
          totalQuantity: dummyStats.totalQuantity,
          lowStockItems: dummyStats.lowStockItems,
        }));
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
          setStats((prev) => ({
            ...prev,
            recentTransactions: transactions,
          }));
        } else {
          // Set dummy transactions if no real data exists
          setStats((prev) => ({
            ...prev,
            recentTransactions: dummyStats.recentTransactions,
          }));
        }
        setLoading(false);
      },
      (error) => {
        console.log("Firebase transactions error, using dummy data:", error);
        // If Firebase fails, use dummy data
        setStats((prev) => ({
          ...prev,
          recentTransactions: dummyStats.recentTransactions,
        }));
        setLoading(false);
      }
    );

    return () => {
      unsubscribeInventory();
      unsubscribeTransactions();
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
    // Helper function to safely format dates from both regular Date objects and Firestore Timestamps
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

      {/* Monthly Statistics */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Monthly Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">
                    Total Incoming
                  </p>
                  <p className="text-2xl font-bold text-blue-900">1,250</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">
                    Total Outgoing
                  </p>
                  <p className="text-2xl font-bold text-red-900">890</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">
                    Net Change
                  </p>
                  <p className="text-2xl font-bold text-green-900">+360</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">
                    Top Product
                  </p>
                  <p className="text-lg font-bold text-purple-900">
                    Steel Pipes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Overview */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Inventory Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dummyStats.inventoryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
