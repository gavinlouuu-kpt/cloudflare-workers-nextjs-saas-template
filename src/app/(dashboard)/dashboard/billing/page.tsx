import { getSessionOrGuest } from "@/utils/auth";
import { PageHeader } from "@/components/page-header";
import { GuestFeatureGate } from "@/components/guest-feature-gate";
import { TransactionHistory } from "./_components/transaction-history";
import { CreditPackages } from "./_components/credit-packages";

export default async function BillingPage() {
  const sessionResult = await getSessionOrGuest();
  
  // Check if it's a guest session
  const isGuest = sessionResult && 'type' in sessionResult;

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/dashboard",
            label: "Dashboard"
          },
          {
            href: "/dashboard/billing",
            label: "Billing"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <GuestFeatureGate feature="canAccessBilling">
          <CreditPackages />
          <div className="mt-4">
            <TransactionHistory />
          </div>
        </GuestFeatureGate>
      </div>
    </>
  );
}
