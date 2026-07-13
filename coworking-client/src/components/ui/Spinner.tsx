export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="h-8 w-8 rounded-full border-2 border-gray-200
        border-t-gray-900 animate-spin"/>
    </div>
  )
}