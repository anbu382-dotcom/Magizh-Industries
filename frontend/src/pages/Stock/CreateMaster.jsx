import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import '../../styles/pageStyles/Stock/CreateMaster.css';

const CreateMaster = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    materialFlow: '',
    class: '',
    category: '',
    materialName: '',
    hsnCode: '',
    supplierName: '',
    supplierCode: '',
    cgst: '',
    igst: '',
    sgst: '',
    costPerItem: ''
  });

  const [gstError, setGstError] = useState({
    cgst: false,
    sgst: false,
    igst: false
  });

  const [hsnError, setHsnError] = useState(false);
  const [supplierCodeError, setSupplierCodeError] = useState(false);
  const [primaryFieldError, setPrimaryFieldError] = useState({
    materialFlow: false,
    class: false,
    category: false,
    materialName: false
  });

  const [showGstError, setShowGstError] = useState(false);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [showPrimaryFieldError, setShowPrimaryFieldError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric fields
    if (name === 'cgst' || name === 'igst' || name === 'sgst') {
      // Allow only numbers (integers or decimals)
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid
      }
      // Check if value exceeds 28 and set error state
      const numValue = parseFloat(value);
      if (value !== '' && numValue > 28) {
        setGstError(prev => ({ ...prev, [name]: true }));
      } else {
        setGstError(prev => ({ ...prev, [name]: false }));
      }
      // Block values less than 0
      if (value !== '' && numValue < 0) {
        return;
      }
    }

    if (name === 'costPerItem') {
      // Allow only numbers and decimals for cost
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
        return; // Don't update if invalid
      }
    }

    if (name === 'hsnCode') {
      // Allow only 8 Digit numeric input for HSN Code
      if (value !== '' && !/^\d{0,8}$/.test(value)) {
        return; // Don't update if invalid
      }
      // Set error if length exceeds 8
      setHsnError(value.length > 8);
    }

    if (name === 'supplierCode') {
      // Allow only 3 Digit numeric input for Supplier Code
      if (value !== '' && !/^\d{0,3}$/.test(value)) {
        return; // Don't update if invalid
      }
      // Set error if length exceeds 3
      setSupplierCodeError(value.length > 3);
    }

    // Handle Material Flow change - auto-lock class to F when FIN is selected
    if (name === 'materialFlow') {
      // Clear primary field error for materialFlow
      setPrimaryFieldError(prev => ({ ...prev, materialFlow: false }));

      if (value === 'FIN') {
        setFormData(prev => ({
          ...prev,
          materialFlow: value,
          class: 'F' // Auto-lock class to F for FIN
        }));
        return;
      } else {
        // Reset class when switching away from FIN
        setFormData(prev => ({
          ...prev,
          materialFlow: value,
          class: ''
        }));
        return;
      }
    }

    // Handle primary fields and clear their errors
    if (name === 'class' || name === 'category' || name === 'materialName') {
      setPrimaryFieldError(prev => ({ ...prev, [name]: false }));
    }

    // Handle GST validation logic
    if (name === 'cgst') {
      //  If entering CGST , (CGST = SGST)
      const numValue = parseFloat(value);
      const hasError = value !== '' && numValue > 28;

      // Update both cgst and sgst values and their error states
      setFormData(prev => ({
        ...prev,
        cgst: value,
        sgst: value // Set SGST to same value as CGST
      }));

      setGstError(prev => ({
        ...prev,
        cgst: hasError,
        sgst: hasError
      }));
    } else if (name === 'sgst') {
      // If entering SGST , (CGST = SGST)
      const numValue = parseFloat(value);
      const hasError = value !== '' && numValue > 28;

      // Update both sgst and cgst values and their error states
      setFormData(prev => ({
        ...prev,
        sgst: value,
        cgst: value // Set CGST to same value as SGST
      }));

      setGstError(prev => ({
        ...prev,
        sgst: hasError,
        cgst: hasError
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if required fields are empty
    if (!formData.materialFlow || !formData.class || !formData.category || !formData.materialName) {
      setShowRequiredError(true);
      setShowPrimaryFieldError(true);
      setShowGstError(false);

      // Set error states for empty primary fields
      setPrimaryFieldError({
        materialFlow: !formData.materialFlow,
        class: !formData.class,
        category: !formData.category,
        materialName: !formData.materialName
      });
      return;
    }

    // Check if any GST value exceeds 28
    if (gstError.cgst || gstError.sgst || gstError.igst) {
      setShowGstError(true);
      setShowRequiredError(false);
      setShowPrimaryFieldError(false);
      return;
    }

    setShowGstError(false);
    setShowRequiredError(false);
    setShowPrimaryFieldError(false);
    
    const submitData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Please login to continue');
          return;
        }

        const response = await fetch('http://localhost:5000/api/master/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          setShowGstError(false);
          setShowRequiredError(false);
          alert('Material master created successfully!');
          handleReset();
        } else {
          alert(data.message || 'Failed to create material master');
        }
      } catch (error) {
        console.error('Error creating material master:', error);
        alert('Failed to create material master. Please try again.');
      }
    };

    submitData();
  };

  const handleReset = () => {
    setFormData({
      materialFlow: '',
      class: '',
      category: '',
      materialName: '',
      hsnCode: '',
      supplierName: '',
      supplierCode: '',
      cgst: '',
      igst: '',
      sgst: '',
      costPerItem: ''
    });

    // Reset error states
    setGstError({
      cgst: false,
      sgst: false,
      igst: false
    });

    setHsnError(false);
    setSupplierCodeError(false);
    setPrimaryFieldError({
      materialFlow: false,
      class: false,
      category: false,
      materialName: false
    });

    setShowGstError(false);
    setShowRequiredError(false);
    setShowPrimaryFieldError(false);
  };

  return (
    <div className="stock-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="stock-header">
            <button className="back-btn" onClick={() => navigate('/stock/master')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            <div className="header-text">
              <h1 className="page-title">Create Material</h1>
            </div>
          </div>
          
          <div className="form-container">
            <form onSubmit={handleSubmit} className="master-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="materialFlow">Material Flow <span className="required">*</span></label>
                  <select
                    id="materialFlow"
                    name="materialFlow"
                    value={formData.materialFlow}
                    onChange={handleChange}
                    required
                    className={`${primaryFieldError.materialFlow ? 'error-input' : ''}`}
                  >
                    <option value="" disabled hidden>Select material flow</option>
                    <option value="BOM">BOM</option>
                    <option value="FIN">FIN</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="class">Class <span className="required">*</span></label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    disabled={formData.materialFlow === 'FIN'}
                    className={`${primaryFieldError.class ? 'error-input' : ''}`}
                  >
                    <option value="" disabled hidden>Select class</option>
                    {formData.materialFlow === 'BOM' ? (
                      <>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </>
                    ) : (
                      <>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category <span className="required">*</span></label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                    required
                    className={`${primaryFieldError.category ? 'error-input' : ''}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="materialName">Material Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="materialName"
                    name="materialName"
                    value={formData.materialName}
                    onChange={handleChange}
                    placeholder="Enter material name"
                    required
                    className={`${primaryFieldError.materialName ? 'error-input' : ''}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hsnCode">HSN Code</label>
                  <input
                    type="text"
                    id="hsnCode"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleChange}
                    placeholder="Enter HSN code (max 8 digits)"
                    className={`${hsnError ? 'error-input' : ''}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplierName">Supplier Name</label>
                  <input
                    type="text"
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplierCode">Supplier Code</label>
                  <input
                    type="text"
                    id="supplierCode"
                    name="supplierCode"
                    value={formData.supplierCode}
                    onChange={handleChange}
                    placeholder="Enter supplier code (max 3 digits)"
                    className={`${supplierCodeError ? 'error-input' : ''}`}
                  />
                </div>

                <div className="form-group">
                <label htmlFor="cgst">CGST (%)</label>
                <div className="input-with-icon">
                    <input
                      type="text"
                      id="cgst"
                      name="cgst"
                      value={formData.cgst}
                      onChange={handleChange}
                      placeholder="Enter CGST percentage"
                      disabled={formData.igst !== ''}
                      className={`${formData.igst !== '' ? 'disabled-input' : ''} ${gstError.cgst ? 'error-input' : ''}`}
                    />
                    {formData.igst !== '' && (
                      <svg className="lock-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="sgst">SGST (%)</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="sgst"
                      name="sgst"
                      value={formData.sgst}
                      onChange={handleChange}
                      placeholder="Enter SGST percentage"
                      disabled={formData.igst !== ''}
                      className={`${formData.igst !== '' ? 'disabled-input' : ''} ${gstError.sgst ? 'error-input' : ''}`}
                    />
                    {formData.igst !== '' && (
                      <svg className="lock-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="igst">IGST (%)</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      id="igst"
                      name="igst"
                      value={formData.igst}
                      onChange={handleChange}
                      placeholder="Enter IGST percentage"
                      disabled={formData.cgst !== '' || formData.sgst !== ''}
                      className={`${formData.cgst !== '' || formData.sgst !== '' ? 'disabled-input' : ''} ${gstError.igst ? 'error-input' : ''}`}
                    />
                    {(formData.cgst !== '' || formData.sgst !== '') && (
                      <svg className="lock-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="costPerItem">Cost per Item (₹)</label>
                  <input
                    type="text"
                    id="costPerItem"
                    name="costPerItem"
                    value={formData.costPerItem}
                    onChange={handleChange}
                    placeholder="Enter cost per item"
                  />
                </div>
              </div>

              <div className="form-actions">
                {showRequiredError && (
                  <div className="required-error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Please fill all required fields marked with *</span>
                  </div>
                )}
                {showGstError && (gstError.cgst || gstError.sgst || gstError.igst) && (
                  <div className="gst-error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>GST values cannot exceed 28%</span>
                  </div>
                )}
                <button type="button" className="btn-reset" onClick={handleReset}>
                  Reset
                </button>
                <button type="submit" className="btn-submit">
                  Create Material
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMaster;
