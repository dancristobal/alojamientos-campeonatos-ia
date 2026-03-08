import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false
}) => {
    const icons = {
        danger: <AlertTriangle className="w-10 h-10 text-rose-500" />,
        warning: <HelpCircle className="w-10 h-10 text-amber-500" />,
        info: <Info className="w-10 h-10 text-blue-500" />
    };

    const colors = {
        danger: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600',
        warning: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600',
        info: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className={`p-4 rounded-3xl ${colors[variant]}`}>
                    {icons[variant]}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                    {description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                    <Button 
                        variant="secondary" 
                        onClick={onClose} 
                        className="flex-1 order-2 sm:order-1"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        variant={variant === 'danger' ? 'danger' : 'primary'} 
                        onClick={onConfirm} 
                        isLoading={isLoading}
                        className="flex-1 order-1 sm:order-2"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
