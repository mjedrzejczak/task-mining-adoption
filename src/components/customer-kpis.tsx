import type { CustomerFilter, CustomerKpis as Kpis } from "@/lib/customers";
import { Stat } from "@/components/ui/stat";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

// Top KPI strip. The first three cards double as table filter toggles; the
// rest are read-only roll-ups. All values reflect the customers in view.
export function CustomerKpis({
  kpis,
  filter,
  onToggle,
}: {
  kpis: Kpis;
  filter: CustomerFilter;
  onToggle: (f: CustomerFilter) => void;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Stat
        label="Active contracts"
        value={kpis.activeContracts.toLocaleString("en-US")}
        onClick={() => onToggle("Active")}
        active={filter === "Active"}
        hint="customers with a live Task Mining contract"
      />
      <Stat
        label="Active, no clients"
        value={kpis.noUsage.toLocaleString("en-US")}
        tone="warning"
        onClick={() => onToggle("No usage")}
        active={filter === "No usage"}
        hint="active contract · 0 active clients"
      />
      <Stat
        label="Active + adopting"
        value={kpis.adopting.toLocaleString("en-US")}
        tone="success"
        onClick={() => onToggle("Adopting")}
        active={filter === "Adopting"}
        hint="active contract with ≥1 client"
      />
      <Stat
        label="Contract value (ACV)"
        value={currency.format(kpis.totalAcv)}
        hint={`${kpis.activeContracts} active contracts in view`}
      />
      <Stat
        label="ACV at risk"
        value={currency.format(kpis.noUsageAcv)}
        tone="warning"
        hint="live contracts with no usage"
      />
      <Stat
        label="Active clients (all)"
        value={kpis.totalActiveClients.toLocaleString("en-US")}
        hint={`across ${kpis.customersInView} customers in view`}
      />
    </section>
  );
}
