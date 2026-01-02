import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/pageStyles/Stock/Logtable.css';
import { Scroll, TrendingUp, TrendingDown, Search } from 'lucide-react';

const LogTable = () => {
  const [stockEntries, setStockEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    fetchStockEntries();
  }, []);

  const fetchStockEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stock/entries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStockEntries(data.data || []);
      } else {
        console.error('Failed to fetch stock entries');
      }
    } catch (error) {
      console.error('Error fetching stock entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = stockEntries.filter(entry => {
    const matchesSearch =
      entry.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.materialName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || entry.entryType === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="stock-log-container">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Stock Entry Log" backPath="/stock/report" showCompanyName={sidebarExpanded} />
      <div className="log-content page-with-navbar">
        <div className="log-controls">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by material code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Filter by Type:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                className={`filter-btn credit-btn ${filterType === 'Credit' ? 'active' : ''}`}
                onClick={() => setFilterType('Credit')}
              >
                <TrendingUp size={16} />
                Credit
              </button>
              <button
                className={`filter-btn debit-btn ${filterType === 'Debit' ? 'active' : ''}`}
                onClick={() => setFilterType('Debit')}
              >
                <TrendingDown size={16} />
                Debit
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading stock entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="no-data">
            <Scroll size={48} />
            <p>No stock entries found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="log-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Material Number</th>
                  <th>Material Name</th>
                  <th>Quantity</th>
                  <th>Entry Type</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td>{index + 1}</td>
                    <td className="material-code">{entry.materialCode}</td>
                    <td>{entry.materialName}</td>
                    <td className="quantity">{entry.quantity} {entry.unit}</td>
                    <td>
                      <span className={`entry-badge ${entry.entryType?.toLowerCase()}`}>
                        {entry.entryType === 'Credit' ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="user-id">{entry.createdBy ? entry.createdBy.substring(0, 5) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTable;
