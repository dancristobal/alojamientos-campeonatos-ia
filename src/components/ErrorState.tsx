import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Ha ocurrido un error",
    message,
    onRetry
}) => {
    return (
        <div className="p-12 glass bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 rounded-[2.5rem] flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-rose-900 dark:text-rose-200">{title}</h2>
            <p className="text-rose-700/80 dark:text-rose-400/80 mt-2 max-w-sm mx-auto">
                {message}
            </p>
            {onRetry && (
                <div className="mt-8">
                    <Button 
                        variant="danger" 
                        onClick={onRetry}
                        leftIcon={RefreshCw}
                    >
                        Reintentar conexión
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ErrorState;
