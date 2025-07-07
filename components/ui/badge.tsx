import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ 
  className = "", 
  variant = "default",
  ...props 
}: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  const variantStyles = {
    default: "bg-purple-600 text-white",
    secondary: "bg-purple-100 text-purple-900",
    destructive: "bg-red-100 text-red-900",
    outline: "border border-purple-200 text-purple-900"
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`

  return <div className={combinedClassName} {...props} />
}

export { Badge } 