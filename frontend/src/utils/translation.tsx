import { useApp } from '../i18n/AppContext';

// HOC (Higher Order Component) untuk auto-translate semua page
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return (props: P) => {
    const { t } = useApp();
    return <Component {...props} t={t} />;
  };
}

// Hook untuk menggunakan translation di functional component
export { useApp } from '../i18n/AppContext';
