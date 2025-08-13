import React, { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, database } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import InventoryTable from "../components/InventoryTable";
import StockForm from "../components/StockForm";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const { currentUser } = useAuth();

  // Dummy data for demonstration
  const dummyInventory = [
    {
      id: "1",
      type: "Steel Pipes",
      material: "Carbon Steel",
      length: "6m",
      diameter: "50mm",
      quantity: 450,
      unit: "units",
      location: "Warehouse A",
      supplier: "SteelCorp Inc.",
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "In Stock",
    },
    {
      id: "2",
      type: "PVC Pipes",
      material: "Polyvinyl Chloride",
      length: "3m",
      diameter: "75mm",
      quantity: 320,
      unit: "units",
      location: "Warehouse B",
      supplier: "PlastTech Ltd.",
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "In Stock",
    },
    {
      id: "3",
      type: "Copper Tubes",
      material: "Copper",
      length: "4m",
      diameter: "25mm",
      quantity: 180,
      unit: "units",
      location: "Warehouse A",
      supplier: "MetalWorks Co.",
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: "Low Stock",
    },
    {
      id: "4",
      type: "Aluminum Pipes",
      material: "Aluminum Alloy",
      length: "5m",
      diameter: "40mm",
      quantity: 95,
      unit: "units",
      location: "Warehouse C",
      supplier: "AluCorp Industries",
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: "Low Stock",
    },
    {
      id: "5",
      type: "HDPE Pipes",
      material: "High-Density Polyethylene",
      length: "6m",
      diameter: "100mm",
      quantity: 280,
      unit: "units",
      location: "Warehouse B",
      supplier: "PolyPipe Solutions",
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: "In Stock",
    },
    {
      id: "6",
      type: "Cast Iron Pipes",
      material: "Cast Iron",
      length: "4m",
      diameter: "150mm",
      quantity: 3,
      unit: "units",
      location: "Warehouse A",
      supplier: "IronWorks Ltd.",
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      status: "Critical",
    },
    {
      id: "7",
      type: "Galvanized Pipes",
      material: "Galvanized Steel",
      length: "6m",
      diameter: "80mm",
      quantity: 125,
      unit: "units",
      location: "Warehouse C",
      supplier: "GalvaSteel Corp.",
      lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      status: "In Stock",
    },
    {
      id: "8",
      type: "Stainless Steel Pipes",
      material: "Stainless Steel 316",
      length: "5m",
      diameter: "60mm",
      quantity: 75,
      unit: "units",
      location: "Warehouse A",
      supplier: "StainlessCorp Inc.",
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "In Stock",
    },
  ];

  useEffect(() => {
    // Try to connect to Firestore first
    let unsubscribeFirestore = null;
    let unsubscribeRealtime = null;

    const connectToFirestore = async () => {
      try {
        const unsubscribe = onSnapshot(
          collection(db, "pipelines"),
          (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });

            // Use real data if available, otherwise use dummy data
            if (items.length > 0) {
              console.log("Firestore data loaded:", items.length, "items");
              setInventory(items);
            } else {
              console.log("No Firestore data, using dummy data");
              setInventory(dummyInventory);
            }
            setLoading(false);
          },
          (error) => {
            console.log("Firestore connection error:", error);
            // Try Realtime Database as fallback
            connectToRealtimeDatabase();
          }
        );
        unsubscribeFirestore = unsubscribe;
      } catch (error) {
        console.log("Firestore setup error:", error);
        connectToRealtimeDatabase();
      }
    };

    const connectToRealtimeDatabase = async () => {
      try {
        console.log("Connecting to Realtime Database...");

        // Import the necessary functions for Realtime Database
        const { ref, onValue, off } = await import("firebase/database");

        const pipelinesRef = ref(database, "pipelines");

        const unsubscribe = onValue(
          pipelinesRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const items = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));
              console.log(
                "Realtime Database data loaded:",
                items.length,
                "items"
              );
              setInventory(items);
            } else {
              console.log("No Realtime Database data, using dummy data");
              setInventory(dummyInventory);
            }
            setLoading(false);
          },
          (error) => {
            console.log("Realtime Database error:", error);
            // Use dummy data as final fallback
            setInventory(dummyInventory);
            setLoading(false);
          }
        );

        unsubscribeRealtime = () => off(pipelinesRef, "value", unsubscribe);
      } catch (error) {
        console.log("Realtime Database setup error:", error);
        // Use dummy data as final fallback
        setInventory(dummyInventory);
        setLoading(false);
      }
    };

    // Start with Firestore
    connectToFirestore();

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      if (unsubscribeRealtime) {
        unsubscribeRealtime();
      }
    };
  }, []);

  const handleAddStock = async (formData) => {
    try {
      const stockData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        lastUpdated: new Date(),
        createdBy: currentUser.uid,
      };

      // Try Firestore first, fallback to Realtime Database
      try {
        await addDoc(collection(db, "pipelines"), stockData);

        // Add transaction record
        await addDoc(collection(db, "transactions"), {
          pipelineId: "new",
          pipelineType: `${formData.type} ${formData.length}×${formData.diameter}`,
          type: "incoming",
          quantity: parseInt(formData.quantity),
          date: new Date(),
          handledBy: currentUser.uid,
        });

        console.log("Stock added successfully to Firestore");
      } catch (firestoreError) {
        console.log(
          "Firestore failed, using Realtime Database:",
          firestoreError
        );

        // Fallback to Realtime Database
        const { ref, push, set } = await import("firebase/database");

        const stockRef = push(ref(database, "pipelines"));
        const transactionRef = push(ref(database, "transactions"));

        await set(stockRef, {
          ...stockData,
          id: stockRef.key,
          lastUpdated: new Date().toISOString(),
        });

        await set(transactionRef, {
          id: transactionRef.key,
          pipelineId: stockRef.key,
          pipelineType: `${formData.type} ${formData.length}×${formData.diameter}`,
          type: "incoming",
          quantity: parseInt(formData.quantity),
          date: new Date().toISOString(),
          handledBy: currentUser.uid,
        });

        console.log("Stock added successfully to Realtime Database");
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      throw error;
    }
  };

  const handleEditStock = async (formData) => {
    try {
      const updateData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        lastUpdated: new Date(),
      };

      // Try Firestore first, fallback to Realtime Database
      try {
        const stockRef = doc(db, "pipelines", editingItem.id);
        await updateDoc(stockRef, updateData);

        // Add transaction record for quantity change
        if (formData.quantity !== editingItem.quantity) {
          const quantityDiff = formData.quantity - editingItem.quantity;
          await addDoc(collection(db, "transactions"), {
            pipelineId: editingItem.id,
            pipelineType: `${formData.type} ${formData.length}×${formData.diameter}`,
            type: quantityDiff > 0 ? "incoming" : "outgoing",
            quantity: Math.abs(quantityDiff),
            date: new Date(),
            handledBy: currentUser.uid,
          });
        }

        console.log("Stock updated successfully in Firestore");
      } catch (firestoreError) {
        console.log(
          "Firestore failed, using Realtime Database:",
          firestoreError
        );

        // Fallback to Realtime Database
        const { ref, set, push } = await import("firebase/database");

        const stockRef = ref(database, `pipelines/${editingItem.id}`);
        await set(stockRef, {
          ...editingItem,
          ...updateData,
          lastUpdated: new Date().toISOString(),
        });

        // Add transaction record for quantity change
        if (formData.quantity !== editingItem.quantity) {
          const quantityDiff = formData.quantity - editingItem.quantity;
          const transactionRef = push(ref(database, "transactions"));
          await set(transactionRef, {
            id: transactionRef.key,
            pipelineId: editingItem.id,
            pipelineType: `${formData.type} ${formData.length}×${formData.diameter}`,
            type: quantityDiff > 0 ? "incoming" : "outgoing",
            quantity: Math.abs(quantityDiff),
            date: new Date().toISOString(),
            handledBy: currentUser.uid,
          });
        }

        console.log("Stock updated successfully in Realtime Database");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  };

  const handleDeleteStock = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Try Firestore first, fallback to Realtime Database
        try {
          await deleteDoc(doc(db, "pipelines", itemId));
          console.log("Stock deleted successfully from Firestore");
        } catch (firestoreError) {
          console.log(
            "Firestore failed, using Realtime Database:",
            firestoreError
          );

          // Fallback to Realtime Database
          const { ref, remove } = await import("firebase/database");

          const stockRef = ref(database, `pipelines/${itemId}`);
          await remove(stockRef);

          console.log("Stock deleted successfully from Realtime Database");
        }
      } catch (error) {
        console.error("Error deleting stock:", error);
      }
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const item = inventory.find((item) => item.id === itemId);

      // Try Firestore first, fallback to Realtime Database
      try {
        const stockRef = doc(db, "pipelines", itemId);
        await updateDoc(stockRef, {
          quantity: newQuantity,
          lastUpdated: new Date(),
        });

        // Add transaction record
        const quantityDiff = newQuantity - item.quantity;
        if (quantityDiff !== 0) {
          await addDoc(collection(db, "transactions"), {
            pipelineId: itemId,
            pipelineType: `${item.type} ${item.length}×${item.diameter}`,
            type: quantityDiff > 0 ? "incoming" : "outgoing",
            quantity: Math.abs(quantityDiff),
            date: new Date(),
            handledBy: currentUser.uid,
          });
        }

        console.log("Quantity updated successfully in Firestore");
      } catch (firestoreError) {
        console.log(
          "Firestore failed, using Realtime Database:",
          firestoreError
        );

        // Fallback to Realtime Database
        const { ref, set, push } = await import("firebase/database");

        const stockRef = ref(database, `pipelines/${itemId}`);
        await set(stockRef, {
          ...item,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
        });

        // Add transaction record
        const quantityDiff = newQuantity - item.quantity;
        if (quantityDiff !== 0) {
          const transactionRef = push(ref(database, "transactions"));
          await set(transactionRef, {
            id: transactionRef.key,
            pipelineId: itemId,
            pipelineType: `${item.type} ${item.length}×${item.diameter}`,
            type: quantityDiff > 0 ? "incoming" : "outgoing",
            quantity: Math.abs(quantityDiff),
            date: new Date().toISOString(),
            handledBy: currentUser.uid,
          });
        }

        console.log("Quantity updated successfully in Realtime Database");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSave = async (formData) => {
    if (editingItem) {
      await handleEditStock(formData);
    } else {
      await handleAddStock(formData);
    }
  };

  // Filter and search inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.length?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diameter?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterType || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getUniqueTypes = () => {
    const types = [...new Set(inventory.map((item) => item.type))];
    return types.filter(Boolean);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inventory Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your pipeline stock items
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by type, material, dimensions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {getUniqueTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable
        inventory={filteredInventory}
        onEdit={handleEdit}
        onDelete={handleDeleteStock}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Stock Form Modal */}
      <StockForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleFormSave}
        editItem={editingItem}
      />
    </div>
  );
};

export default Inventory;
