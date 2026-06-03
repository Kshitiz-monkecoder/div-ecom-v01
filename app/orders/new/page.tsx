import CustomerLayout from '@/components/customer-layout'
import { LanguageProvider } from '@/components/language-provider'

const page = () => {
  return (
    <CustomerLayout>
      <LanguageProvider>
        <div className='flex h-full items-center justify-center text-4xl font-extralight text-gray-600'>
          New Order Page - Coming Soon!
        </div>
      </LanguageProvider>
    </CustomerLayout>
  )
}

export default page