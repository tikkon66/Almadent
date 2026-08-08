import { useState } from 'react';
import './confirm.css';

type ConfirmActionProps = {
    text: string;
    successText: string;
    children: React.ReactNode;
    action: () => Promise<void>;
};

type Message = {
    text: string;
    type: 'success' | 'error';
};

function Confirm({
    text,
    successText,
    children,
    action,
}: ConfirmActionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [toast, setToast] = useState<Message | null>(null);

    const handleConfirm = async (): Promise<void> => {
        let message: Message;

        try {
            // Выполняем переданное действие
            await action();

            message = {
                text: successText,
                type: 'success',
            };
        } catch (err) {
            console.error(err);

            message = {
                text: err instanceof Error ? err.message : 'Произошла ошибка',
                type: 'error',
            };
        }


        // Показываем нужный тост (успех или ошибка)
        setToast(message);
        // Скрываем тост через 3 секунды
        setTimeout(() => {
            setToast(null);
            setIsOpen(false);
        }, 3000);
    };

    return (
        <>
            <span onClick={() => setIsOpen(true)}>
                {children}
            </span>

            {isOpen && (
                <>
                    <div className="confirm-backdrop" onClick={() => setIsOpen(false)} />

                    <div className="confirm-modal">
                        <h3>{text}</h3>

                        <div className="confirm-actions">
                            <button
                                className="cancel-btn"
                                type="button"
                                onClick={() => setIsOpen(false)}
                            >
                                Отмена
                            </button>

                            <button
                                className="confirm-btn"
                                type="button"
                                onClick={handleConfirm}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </>
            )}

            {toast && (
                <div
                    className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'
                        }`}
                >
                    {toast.text}
                </div>
            )}
        </>
    );
}

export default Confirm;