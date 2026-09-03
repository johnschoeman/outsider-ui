type ButtonVariant = "primary" | "secondary"

export const buttonClasses = (variant: ButtonVariant): string => {
  const base =
    "font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

  if (variant === "primary") {
    return `${base} bg-accent-primary hover:bg-accent-primary-hover text-white`
  }

  return `${base} bg-surface-card border-2 border-ink text-ink hover:bg-ink hover:text-white`
}

export const inputClasses = (hasError: boolean): string => {
  const base = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ink"
  const stateClasses = hasError ? "border-error-border bg-error-bg" : "border-border-default"

  return `${base} ${stateClasses}`
}
