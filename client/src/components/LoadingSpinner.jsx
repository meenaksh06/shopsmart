const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className={`spinner ${sizeClass}`} aria-hidden="true"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
