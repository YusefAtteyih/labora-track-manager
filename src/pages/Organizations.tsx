
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect component to maintain backward compatibility
const Organizations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new faculties page
    navigate('/faculties', { replace: true });
  }, [navigate]);

  return null;
};

export default Organizations;
