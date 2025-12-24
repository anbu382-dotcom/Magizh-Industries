import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/pageStyles/Stock/EntryStock.css';

const EntryStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const material = location.state?.material;

  const [formData, setFormData] = useState({
    quantity: '',
    entryType: ''
  });

  const [errors, setErrors] = useState({
    quantity: false,
    entryType: false
  });

  const [showRequiredError, setShowRequiredError] = useState(false);
  const [showInsufficientStockError, setShowInsufficientStockError] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Store the original decimal value when switching between units
  const [originalQuantity, setOriginalQuantity] = useState('');

  const handleMenuClick = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Redirect if no material data
  useEffect(() => {
    if (!material) {
      navigate('/stock/entry');
    } else {
      fetchCurrentBalance();
    }
  }, [material, navigate]);

  const fetchCurrentBalance = async () => {
    if (!material) return;
    
    setLoadingBalance(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stock/entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const entries = data.data || [];
        
        // Calculate balance for this material
        let balance = 0;
        entries.forEach(entry => {
          if (entry.materialCode === material.materialCode) {
            if (entry.entryType === 'Credit') {
              balance += parseFloat(entry.quantity || 0);
            } else if (entry.entryType === 'Debit') {
              balance -= parseFloat(entry.quantity || 0);
            }
          }
        });
        
        setCurrentBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching current balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate quantity to allow only numbers and decimals
    if (name === 'quantity') {
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid
      }
      // Block values less than or equal to 0
      const numValue = parseFloat(value);
      if (value !== '' && numValue <= 0) {
        return;
      }

      // Store the original value (with decimals)
      setOriginalQuantity(value);

      // If unit is EA, round to integer
      if (material.unit === 'EA' && value !== '') {
        const roundedValue = Math.round(parseFloat(value)).toString();
        setFormData(prev => ({
          ...prev,
          quantity: roundedValue
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          quantity: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: false
    }));

    // Check for insufficient stock when entryType is Debit or quantity changes
    if (name === 'entryType' && value === 'Debit') {
      const qty = parseFloat(formData.quantity) || 0;
      if (qty > currentBalance) {
        setShowInsufficientStockError(true);
      } else {
        setShowInsufficientStockError(false);
      }
    } else if (name === 'quantity' && formData.entryType === 'Debit') {
      const qty = parseFloat(value) || 0;
      if (qty > currentBalance) {
        setShowInsufficientStockError(true);
      } else {
        setShowInsufficientStockError(false);
      }
    } else if (name === 'entryType' && value !== 'Debit') {
      setShowInsufficientStockError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if required fields are empty
    if (!formData.quantity || !formData.entryType) {
      setShowRequiredError(true);
      setErrors({
        quantity: !formData.quantity,
        entryType: !formData.entryType
      });
      return;
    }

    setShowRequiredError(false);

    // Check for insufficient stock on Debit
    if (formData.entryType === 'Debit' && parseFloat(formData.quantity) > currentBalance) {
      setShowInsufficientStockError(true);
      return;
    }

    // Prepare entry data
    const entryData = {
      materialCode: material.materialCode,
      materialName: material.materialName,
      supplierCode: material.supplierCode,
      materialFlow: material.materialFlow,
      quantity: parseFloat(formData.quantity),
      unit: material.unit,
      entryType: formData.entryType,
      timestamp: new Date().toISOString()
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stock/entry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        alert('Stock entry created successfully!');
        navigate('/stock/entry');
      } else {
        const error = await response.json();
        alert(`Failed to create stock entry: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating stock entry:', error);
      alert('An error occurred while creating stock entry');
    }
  };

  const handleCancel = () => {
    navigate('/stock/entry');
  };

  if (!material) {
    return null;
  }

  return (
    <div className="es-wrapper">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Stock Entry" onMenuClick={handleMenuClick} />
      <div className="es-content page-with-navbar">
        <div className="es-container">
          <div className="es-main-panel">
            <form onSubmit={handleSubmit} className="es-form">
              <div className="es-form-section">
                <h3>Material Information (Read-Only)</h3>

                <div className="es-form-row">
                  <div className="es-form-group">
                    <label>Material Code</label>
                    <input
                      type="text"
                      value={material.materialCode || 'N/A'}
                      readOnly
                      className="es-readonly-input"
                    />
                  </div>

                  <div className="es-form-group">
                    <label>Material Name</label>
                    <input
                      type="text"
                      value={material.materialName || 'N/A'}
                      readOnly
                      className="es-readonly-input"
                    />
                  </div>
                </div>

                <div className="es-form-row">
                  <div className="es-form-group">
                    <label>Supplier Code</label>
                    <input
                      type="text"
                      value={material.supplierCode || 'N/A'}
                      readOnly
                      className="es-readonly-input"
                    />
                  </div>

                  <div className="es-form-group">
                    <label>Material Flow</label>
                    <input
                      type="text"
                      value={material.materialFlow || 'N/A'}
                      readOnly
                      className="es-readonly-input"
                    />
                  </div>
                </div>
              </div>

              <div className="es-form-section">
                <h3>Entry Details</h3>

                <div className="es-form-row">
                  <div className="es-form-group">
                    <label htmlFor="quantity">Quantity ({material.unit === 'EA' ? 'EA (Each)' : material.unit === 'KG' ? 'KG (Kilogram)' : material.unit === 'M' ? 'M (Meter)' : 'units'}) <span className="es-required">*</span></label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      required
                      className={`${errors.quantity ? 'es-error-input' : ''}`}
                    />
                  </div>

                  <div className="es-form-group">
                    <label htmlFor="entryType">Entry Type <span className="es-required">*</span></label>
                    <select
                      id="entryType"
                      name="entryType"
                      value={formData.entryType}
                      onChange={handleChange}
                      required
                      className={`${errors.entryType ? 'es-error-input' : ''}`}
                    >
                      <option value="" disabled hidden>Select entry type</option>
                      <option value="Credit">Credit (Stock In)</option>
                      <option value="Debit">Debit (Stock Out)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="es-form-actions">
                {showRequiredError && (
                  <div className="es-error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Please fill in all required fields</span>
                  </div>
                )}
                {showInsufficientStockError && (
                  <div className="es-error-message" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#991b1b' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>Insufficient stock! Current balance: {currentBalance.toFixed(2)} {material.unit || 'units'}. Cannot debit {formData.quantity}.</span>
                  </div>
                )}
                <button type="button" className="es-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="es-submit-btn" disabled={showInsufficientStockError}>
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryStock;
