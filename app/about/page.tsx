import { SITE_NAME } from '@/lib/config'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#1B4E7A] dark:text-[#C8DFF0] mb-6">
        परिचय <span className="text-base font-normal text-[#7A6550] dark:text-[#8A9AAA]">/ About</span>
      </h1>
      <div className="bg-[#FDFAF5] dark:bg-[#0F2040] rounded-xl border border-[#D4C4A0] dark:border-[#1B3055] p-6">
        <div className="w-24 h-24 rounded-full bg-[#EDE4D2] dark:bg-[#1B3055] flex items-center justify-center text-4xl mx-auto mb-4">
          🙏
        </div>
        <h2 className="text-xl font-semibold text-center text-[#1B4E7A] dark:text-[#C8DFF0] mb-2">
          स्वर्णा पारनामी
        </h2>
        <p className="text-[#7A6550] dark:text-[#8A9AAA] text-center mb-6">
          भजन रचयिता — [Bio to be added]
        </p>
        <div className="border-t border-[#D4C4A0] dark:border-[#1B3055] pt-4">
          <h3 className="font-medium text-[#3D2010] dark:text-[#EDE4D2] mb-2">संपर्क / Contact</h3>
          <p className="text-[#7A6550] text-sm">[Contact details to be added]</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-[#7A6550] dark:text-[#8A9AAA] text-center">
        {SITE_NAME} — भजन संग्रह · Built with Next.js
      </p>
    </div>
  )
}
