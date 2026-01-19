import CustomerLayout from "@/components/customer-layout";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  return (
    <CustomerLayout>
      <ReferralsClient />
    </CustomerLayout>
  );
}
