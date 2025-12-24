import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import '../../styles/pageStyles/Stock/ArchivedMaster.css';
import { Undo2, Trash2 } from 'lucide-react';

const ArchivedMaster = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [archivedMaterials, setArchivedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchArchivedMaterials();
  }, []);

  const fetchArchivedMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/archive', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArchivedMaterials(data.archives || []);
      } else {
        console.error('Failed to fetch archived materials');
      }
    } catch (error) {
      console.error('Error fetching archived materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreMaterial = async (archive) => {
    if (!window.confirm(`Restore "${archive.materialName}" to active inventory?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/archive/${archive.id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Material restored successfully!');
        fetchArchivedMaterials();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to restore material'}`);
      }
    } catch (error) {
      console.error('Error restoring material:', error);
      alert('Error restoring material. Please try again.');
    }
  };

  const handlePermanentDelete = async (archive) => {
    if (!window.confirm(`PERMANENTLY DELETE "${archive.materialName}"?\n\nThis action CANNOT be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/archive/${archive.id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Material permanently deleted!');
        fetchArchivedMaterials();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to delete material'}`);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Error deleting material. Please try again.');
    }
  };

  const filteredArchivedMaterials = archivedMaterials.filter(material => {
    const matchesSearch =
      material.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' || material.materialFlow === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="am-wrapper">
      <Sidebar isExpanded={sidebarExpanded} onToggle={setSidebarExpanded} />
      <Navbar 
        title="Archived Materials" 
        onMenuClick={() => setSidebarExpanded(!sidebarExpanded)} 
        showCompanyName={sidebarExpanded}
      />
      <div className="am-content page-with-navbar">
        <div className="am-container">
          <div className="am-main-panel">
            <div className="am-filter-bar">
              <div className="am-search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search by Material Code or Material Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="am-filter-tabs">
                <button
                  className={`am-tab ${filterType === 'all' ? 'am-tab-active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All
                </button>
                <button
                  className={`am-tab ${filterType === 'BOM' ? 'am-tab-active' : ''}`}
                  onClick={() => setFilterType('BOM')}
                >
                  BOM
                </button>
                <button
                  className={`am-tab ${filterType === 'FIN' ? 'am-tab-active' : ''}`}
                  onClick={() => setFilterType('FIN')}
                >
                  FIN
                </button>
              </div>
            </div>

            {loading ? (
              <div className="am-loading">
                <div className="am-spinner"></div>
                <p>Loading archived materials...</p>
              </div>
            ) : filteredArchivedMaterials.length === 0 ? (
              <div className="am-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                <h2>No Archived Materials</h2>
                <p>{searchTerm ? 'Try adjusting your search criteria' : 'No materials have been archived yet'}</p>
              </div>
            ) : (
              <div className="am-grid">
                {filteredArchivedMaterials.map((material) => (
                  <div key={material.id} className="am-card">
                    <div className="am-card-header">
                      <span className="am-code-badge">{material.materialCode || 'N/A'}</span>
                      <span className={`am-flow-badge am-flow-${material.materialFlow?.toLowerCase()}`}>
                        {material.materialFlow}
                      </span>
                    </div>

                    <div className="am-card-body">
                      <h3 className="am-material-name">{material.materialName}</h3>

                      <div className="am-info-list">
                        <div className="am-info-row">
                          <span className="am-label">Category:</span>
                          <span className="am-value">{material.category || '-'}</span>
                        </div>
                        <div className="am-info-row">
                          <span className="am-label">HSN Code:</span>
                          <span className="am-value">{material.hsnCode || '-'}</span>
                        </div>
                        <div className="am-info-row">
                          <span className="am-label">Archived:</span>
                          <span className="am-value am-archived-date">
                            {material.archivedAt ? new Date(material.archivedAt).toLocaleDateString() : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="am-card-footer">
                      <button
                        className="am-restore-btn"
                        onClick={() => handleRestoreMaterial(material)}
                        title="Restore to active inventory"
                      >
                        <Undo2 size={16} />
                        Restore
                      </button>
                      <button
                        className="am-permanent-delete-btn"
                        onClick={() => handlePermanentDelete(material)}
                        title="Permanently delete"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedMaster;
