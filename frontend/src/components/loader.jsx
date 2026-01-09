import '../styles/componentStyles/loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader">
        <span style={{'--d': '0ms'}}>M</span>
        <span style={{'--d': '100ms'}}>A</span>
        <span style={{'--d': '200ms'}}>G</span>
        <span style={{'--d': '300ms'}}>I</span>
        <span style={{'--d': '400ms'}}>Z</span>
        <span style={{'--d': '500ms'}}>H</span>
      </div>
    </div>
  );
}

export default Loader;
