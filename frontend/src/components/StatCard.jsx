export const StatCard = ({ title, value, icon: Icon, color = 'primary', description }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'cyan':
        return {
          iconBg: 'rgba(6, 182, 212, 0.15)',
          iconColor: 'var(--cyan)'
        };
      case 'success':
        return {
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconColor: 'var(--success)'
        };
      case 'danger':
        return {
          iconBg: 'rgba(244, 63, 94, 0.15)',
          iconColor: 'var(--danger)'
        };
      case 'warning':
        return {
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: 'var(--warning)'
        };
      default:
        return {
          iconBg: 'rgba(79, 70, 229, 0.15)',
          iconColor: 'var(--primary)'
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="glass-card metric-card">
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </span>
        <div className="metric-value">{value}</div>
        {description && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            {description}
          </span>
        )}
      </div>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-sm)',
        background: styles.iconBg,
        color: styles.iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
