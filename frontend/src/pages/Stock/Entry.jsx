import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/pageStyles/Stock/DeleteMaster.css';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

const Entry = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle back button navigation - always redirect to stock page
  useEffect(() => {
    // Mark this page in history
    const currentState = { page: 'entry', timestamp: Date.now() };
    window.history.replaceState(currentState, '', window.location.href);
    
    const handlePopState = (event) => {
      // When back button is pressed, navigate to stock page instead
      event.preventDefault();
      navigate('/stock', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/master`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.masters || []);
      } else {
        console.error('Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch =
      material.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || material.materialFlow === filterType;

    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const handleSelect = (material) => {
    // Navigate to EntryStock page with material data
    navigate('/stock/entry-stock', {
      state: {
        material: material
      }
    });
  };

  return (
    <div className="dm-wrapper">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar title="Material Entry" onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} />
      <div className="dm-content page-with-navbar">
        <div className="dm-container">
          <div className="dm-main-panel">
            <div className="dm-filter-bar">
              <div className="dm-search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search by Material Code or Mat"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="dm-filter-tabs">
                <button
                  className={`dm-tab ${filterType === 'all' ? 'dm-tab-active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All
                </button>
                <button
                  className={`dm-tab ${filterType === 'BOM' ? 'dm-tab-active' : ''}`}
                  onClick={() => setFilterType('BOM')}
                >
                  BOM
                </button>
                <button
                  className={`dm-tab ${filterType === 'FIN' ? 'dm-tab-active' : ''}`}
                  onClick={() => setFilterType('FIN')}
                >
                  FIN
                </button>
              </div>
            </div>

            {loading ? (
              <div className="dm-loading">
                <div className="dm-spinner"></div>
                <p>Loading materials...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="dm-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h2>No Materials Found</h2>
                <p>{searchTerm ? 'Try adjusting your search criteria' : 'No materials available'}</p>
              </div>
            ) : (
              <div className="dm-grid">
                {paginatedMaterials.map((material) => (
                  <div key={material.id} className="dm-card entry-card">
                    <div className="dm-card-header">
                      <span className="dm-code-badge">{material.materialCode || 'N/A'}</span>
                      <span className={`dm-flow-badge dm-flow-${material.materialFlow?.toLowerCase()}`}>
                        {material.materialFlow}
                      </span>
                    </div>

                    <div className="dm-card-body">
                      <h3 className="dm-material-name">{material.materialName}</h3>

                      <div className="dm-info-list">
                        <div className="dm-info-row">
                          <span className="dm-label">Category:</span>
                          <span className="dm-value">{material.category || '-'}</span>
                        </div>
                        <div className="dm-info-row">
                          <span className="dm-label">HSN Code:</span>
                          <span className="dm-value">{material.hsnCode || '-'}</span>
                        </div>
                        <div className="dm-info-row">
                          <span className="dm-label">Cost/Item:</span>
                          <span className="dm-value dm-price">
                            <IndianRupee size={15} />
                            {material.costPerItem || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="dm-card-footer">
                      <button
                        className="dm-delete-btn"
                        onClick={() => handleSelect(material)}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 11 12 14 22 4"></polyline>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        Select for Entry
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls - Only Previous/Next */}
                {totalPages > 1 && (
                  <div className="dm-pagination">
                    <button
                      className="dm-pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    <button
                      className="dm-pagination-btn"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entry;
