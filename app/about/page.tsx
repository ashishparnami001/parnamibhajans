import { SITE_NAME } from '@/lib/config'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#14629F] dark:text-[#CFE6F7] mb-6">
        परिचय <span className="text-base font-normal text-[#7A6550] dark:text-[#8A9AAA]">/ About</span>
      </h1>
      <div className="bg-[#FFFBF3] dark:bg-[#0E2A4A] rounded-xl border border-[#DACAAE] dark:border-[#1D4068] p-6">
        <div className="w-24 h-24 rounded-full bg-[#EDE3CD] dark:bg-[#1D4068] flex items-center justify-center text-4xl mx-auto mb-4">
          🙏
        </div>
        <h2 className="text-xl font-semibold text-center text-[#14629F] dark:text-[#CFE6F7] mb-2">
          स्वर्णा पारनामी
        </h2>
        <p className="text-[#7A6550] dark:text-[#8A9AAA] text-center mb-6">
          भजन रचयिता — [Bio to be added]
        </p>
        <div className="border-t border-[#DACAAE] dark:border-[#1D4068] pt-4">
          <h3 className="font-medium text-[#44201A] dark:text-[#EDE3CD] mb-2">संपर्क / Contact</h3>
          <p className="text-[#7A6550] text-sm">[Contact details to be added]</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-[#7A6550] dark:text-[#8A9AAA] text-center">
        {SITE_NAME} — भजन संग्रह · Built with Next.js
      </p>
    </div>
  )
}
