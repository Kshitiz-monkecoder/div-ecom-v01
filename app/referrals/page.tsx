import CustomerLayout from "@/components/customer-layout";
import ClientReferrals from "@/components/referrals/client-referrals";

export default async function ReferralsPage() {
  return (
    <CustomerLayout>
      <ClientReferrals />
    </CustomerLayout>
  );
}
