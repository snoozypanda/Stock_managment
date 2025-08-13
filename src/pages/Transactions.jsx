import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Dummy data for demonstration
  const dummyTransactions = [
    {
      id: "1",
      type: "incoming",
      pipelineType: "Steel Pipes 6m×50mm",
      quantity: 150,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      handledBy: "user123",
      pipelineId: "pipeline1"
    },
    {
      id: "2",
      type: "outgoing",
      pipelineType: "PVC Pipes 3m×75mm",
      quantity: 75,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      handledBy: "user123",
      pipelineId: "pipeline2"
    },
    {
      id: "3",
      type: "incoming",
      pipelineType: "Copper Tubes 4m×25mm",
      quantity: 200,
      date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      handledBy: "user456",
      pipelineId: "pipeline3"
    },
    {
      id: "4",
      type: "outgoing",
      pipelineType: "Steel Pipes 6m×50mm",
      quantity: 45,
      date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      handledBy: "user123",
      pipelineId: "pipeline1"
    },
    {
      id: "5",
      type: "incoming",
      pipelineType: "Aluminum Pipes 5m×40mm",
      quantity: 120,
      date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      handledBy: "user789",
      pipelineId: "pipeline4"
    },
    {
      id: "6",
      type: "outgoing",
      pipelineType: "HDPE Pipes 6m×100mm",
      quantity: 60,
      date: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
      handledBy: "user456",
      pipelineId: "pipeline5"
    },
    {
      id: "7",
      type: "incoming",
      pipelineType: "Galvanized Pipes 6m×80mm",
      quantity: 90,
      date: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      handledBy: "user123",
      pipelineId: "pipeline7"
    },
    {
      id: "8",
      type: "outgoing",
      pipelineType: "Stainless Steel Pipes 5m×60mm",
      quantity: 25,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      handledBy: "user789",
      pipelineId: "pipeline8"
    },
    {
      id: "9",
      type: "incoming",
      pipelineType: "Cast Iron Pipes 4m×150mm",
      quantity: 40,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      handledBy: "user456",
      pipelineId: "pipeline6"
    },
    {
      id: "10",
      type: "outgoing",
      pipelineType: "Steel Pipes 6m×50mm",
      quantity: 30,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      handledBy: "user123",
      pipelineId: "pipeline1"
    }
  ];

  // Helper function to safely format dates from both regular Date objects and Firestore Timestamps
  const formatDate = (date) => {
    if (!date) return "N/A";
    
    // If it's a Firestore Timestamp, convert it to Date
    if (date && typeof date.toDate === 'function') {
      return new Date(date.toDate());
    }
    
    // If it's already a Date object, return it directly
    if (date instanceof Date) {
      return date;
    }
    
    // If it's a string or other format, try to create a Date
    try {
      return new Date(date);
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionList = [];
      snapshot.forEach((doc) => {
        transactionList.push({ id: doc.id, ...doc.data() });
      });
      
      // Use real data if available, otherwise use dummy data
      if (transactionList.length > 0) {
        setTransactions(transactionList);
      } else {
        setTransactions(dummyTransactions);
      }
      setLoading(false);
    }, (error) => {
      console.log("Firebase connection error, using dummy data:", error);
      // If Firebase fails, use dummy data
      setTransactions(dummyTransactions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = !filterType || transaction.type === filterType;
    
    // Safely format the date for comparison
    const transactionDate = formatDate(transaction.date);
    const matchesDate = !dateFilter || 
      (transactionDate && 
       transactionDate.toDateString() === new Date(dateFilter).toDateString());
    
    return matchesType && matchesDate;
  });

  const getTransactionIcon = (type) => {
    return type === 'incoming' ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  };

  const getTransactionColor = (type) => {
    return type === 'incoming' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTransactionText = (type) => {
    return type === 'incoming' ? 'Stock Added' : 'Stock Removed';
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
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track all stock movements and inventory changes
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Transactions</option>
              <option value="incoming">Incoming Stock</option>
              <option value="outgoing">Outgoing Stock</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {getTransactionText(transaction.type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.pipelineType} • {transaction.quantity} units
                      </p>
                      <p className="text-xs text-gray-400">
                        Transaction ID: {transaction.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {(() => {
                        const formattedDate = formatDate(transaction.date);
                        return formattedDate ? formattedDate.toLocaleDateString() : 'N/A';
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const formattedDate = formatDate(transaction.date);
                        return formattedDate ? formattedDate.toLocaleTimeString() : '';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterType || dateFilter ? 'Try adjusting your filters.' : 'Start managing your inventory to see transactions here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Incoming</p>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredTransactions
                    .filter(t => t.type === 'incoming')
                    .reduce((sum, t) => sum + (t.quantity || 0), 0)
                    .toLocaleString()} units
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Outgoing</p>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredTransactions
                    .filter(t => t.type === 'outgoing')
                    .reduce((sum, t) => sum + (t.quantity || 0), 0)
                    .toLocaleString()} units
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Net Change</p>
                <p className={`text-lg font-semibold ${
                  filteredTransactions
                    .reduce((sum, t) => sum + (t.type === 'incoming' ? t.quantity : -t.quantity), 0) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {filteredTransactions
                    .reduce((sum, t) => sum + (t.type === 'incoming' ? t.quantity : -t.quantity), 0)
                    .toLocaleString()} units
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
