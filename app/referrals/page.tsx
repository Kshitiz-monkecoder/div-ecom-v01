import CustomerLayout from "@/components/customer-layout";
import ReferralsClient from "./ReferralsClient";
import { LanguageProvider } from "@/components/language-provider";

export default async function ReferralsPage() {
  return (
    <LanguageProvider>
      <CustomerLayout>
        <ReferralsClient />
      </CustomerLayout>
    </LanguageProvider>
  );
}