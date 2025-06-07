import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;