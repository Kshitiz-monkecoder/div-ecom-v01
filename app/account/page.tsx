import CustomerLayout from "@/components/customer-layout";
import { AccountPageClient } from "@/components/account-page-client";
import { requireAuth } from "@/lib/proxy";
import { LanguageProvider } from "@/components/language-provider";

export default async function AccountPage() {
  const user = await requireAuth();

  return (
    <LanguageProvider>
      <CustomerLayout>
        <AccountPageClient
          name={user.name}
          email={user.email ?? null}
          phone={user.phone}
          createdAt={user.createdAt ? new Date(user.createdAt) : new Date()}
        />
      </CustomerLayout>
    </LanguageProvider>
  );
}