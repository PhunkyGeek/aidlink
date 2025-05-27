// components/SkeletonLoginForm.tsx
export default function SkeletonLoginForm() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-black shadow rounded-xl max-w-md w-full p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4" />
  
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
  
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
  
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
  
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto" />
  
          <div className="flex justify-center gap-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  