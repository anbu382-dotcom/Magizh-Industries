import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { API_BASE_URL } from '../../config/api';
import '../../styles/pageStyles/Stock/FinalData.css';
import { Database, Search, TrendingUp, TrendingDown } from 'lucide-react';

const FinalData = () => {
  const [stockBalances, setStockBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    fetchStockBalances();
  }, []);

  const fetchStockBalances = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Fetch all stock entries
      const response = await fetch(`${API_BASE_URL}/api/stock/entries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const entries = data.data || [];
        
        // Fetch master data to get class information
        const masterResponse = await fetch(`${API_BASE_URL}/api/master`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const masterData = masterResponse.ok ? await masterResponse.json() : { data: [] };
        const masters = masterData.data || [];
        
        // Create a map of materialCode to class
        const classMap = {};
        masters.forEach(master => {
          classMap[master.materialCode] = master.class;
        });
        
        // Calculate balance for each material
        const balanceMap = {};
        
        entries.forEach(entry => {
          const key = entry.materialCode;
          
          if (!balanceMap[key]) {
            balanceMap[key] = {
              materialCode: entry.materialCode,
              materialName: entry.materialName,
              unit: entry.unit,
              quantity: 0,
              class: classMap[entry.materialCode] || 'N/A'
            };
          }
          
          // Add for Credit, subtract for Debit
          if (entry.entryType === 'Credit') {
            balanceMap[key].quantity += parseFloat(entry.quantity || 0);
          } else if (entry.entryType === 'Debit') {
            balanceMap[key].quantity -= parseFloat(entry.quantity || 0);
          }
        });
        
        // Convert to array and sort by material code
        const balancesArray = Object.values(balanceMap).sort((a, b) => 
          a.materialCode.localeCompare(b.materialCode)
        );
        
        setStockBalances(balancesArray);
      } else {
        console.error('Failed to fetch stock entries');
      }
    } catch (error) {
      console.error('Error fetching stock balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBalances = stockBalances.filter(balance => {
    const matchesSearch =
      balance.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      balance.materialName?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesClass = true;
    if (filterClass !== 'all') {
      const materialCode = balance.materialCode || '';
      switch(filterClass) {
        case 'A':
          matchesClass = materialCode.startsWith('1000');
          break;
        case 'B':
          matchesClass = materialCode.startsWith('2000');
          break;
        case 'C':
          matchesClass = materialCode.startsWith('3000');
          break;
        case 'D':
          matchesClass = materialCode.startsWith('4000');
          break;
        case 'F':
          matchesClass = materialCode.startsWith('5000');
          break;
        default:
          matchesClass = true;
      }
    }

    return matchesSearch && matchesClass;
  });

  return (
    <div className="final-data-container">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Final Stock Data" onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} showCompanyName={sidebarExpanded} />
      
      <div className="final-main-wrapper page-with-navbar">
        <div className="final-content">
          <div className="final-controls">
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
              <label>Filter by Class:</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading stock balances...</p>
            </div>
          ) : filteredBalances.length === 0 ? (
            <div className="no-data">
              <Database size={48} />
              <p>No stock data found</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="final-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Material Code</th>
                    <th>Material Name</th>
                    <th>Current Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBalances.map((balance, index) => (
                    <tr key={balance.materialCode}>
                      <td>{index + 1}</td>
                      <td className="material-code">{balance.materialCode}</td>
                      <td>{balance.materialName}</td>
                      <td className="quantity">
                        {balance.quantity.toFixed(2)} {balance.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalData;
