import { SITE_NAME } from '@/lib/config'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        परिचय <span className="text-base font-normal text-gray-400">/ About</span>
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-amber-200 dark:border-gray-700 p-6">
        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-4xl mx-auto mb-4">
          🙏
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
          स्वर्णा पारनामी
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          भजन रचयिता — [Bio to be added]
        </p>
        <div className="border-t border-amber-100 dark:border-gray-800 pt-4">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">संपर्क / Contact</h3>
          <p className="text-gray-500 text-sm">[Contact details to be added]</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-400 text-center">
        {SITE_NAME} — भजन संग्रह · Built with Next.js
      </p>
    </div>
  )
}
