const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

/**
 * Shared button used across the app so every CTA looks and behaves consistently.
 * variant: 'primary' | 'secondary' | 'ghost'
 */
export default function Button({
  children,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...rest
}) {
  const base = VARIANTS[variant] ?? VARIANTS.primary

  return (
    <button className={`${base} ${className}`} {...rest}>
      {Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2.25} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2.25} />}
    </button>
  )
}
