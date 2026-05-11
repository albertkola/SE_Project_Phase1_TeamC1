import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-grid-3 text-text-primary">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-grid-3">
          <div className="w-16 h-16 rounded-full border border-border bg-surface flex items-center justify-center">
            <Compass size={28} className="text-text-secondary" />
          </div>
        </div>
        <h1 className="text-[80px] leading-none font-extrabold tracking-tight mb-grid-2">404</h1>
        <p className="text-h3 mb-grid-1">Page not found</p>
        <p className="text-body text-text-secondary mb-grid-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
