import type { CustomerFilter, CustomerKpis as Kpis } from "@/lib/customers";
import { Stat } from "@/components/ui/stat";
import { Delta } from "@/components/ui/delta";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const num = (n: number) => n.toLocaleString("en-US");
const money = (n: number) => currency.format(n);

// Contract roll-ups for the adoption view. Toggle cards drive the table filter.
export function CustomerKpis({
  kpis,
  deltas,
  filter,
  onToggle,
}: {
  kpis: Kpis;
  deltas?: Kpis;
  filter: CustomerFilter;
  onToggle: (f: CustomerFilter) => void;
}) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Stat
        label="Active contracts"
        value={kpis.activeContracts.toLocaleString("en-US")}
        delta={deltas ? <Delta value={deltas.activeContracts} format={num} /> : undefined}
        hint="customers with a live Task Mining contract"
      />
      <Stat
        label="Active, no clients"
        value={kpis.noUsage.toLocaleString("en-US")}
        tone="warning"
        delta={deltas ? <Delta value={deltas.noUsage} goodWhenUp={false} format={num} /> : undefined}
        onClick={() => onToggle("No usage")}
        active={filter === "No usage"}
        hint="active contract · 0 active clients"
      />
      <Stat
        label="Active + adopting"
        value={kpis.adopting.toLocaleString("en-US")}
        tone="success"
        delta={deltas ? <Delta value={deltas.adopting} format={num} /> : undefined}
        onClick={() => onToggle("Adopting")}
        active={filter === "Adopting"}
        hint="active contract with ≥1 client"
      />
      <Stat
        label="Contract value (ACV)"
        value={currency.format(kpis.totalAcv)}
        delta={deltas ? <Delta value={deltas.totalAcv} format={money} /> : undefined}
        hint={`${kpis.activeContracts} active contracts in view`}
      />
      <Stat
        label="ACV at risk"
        value={currency.format(kpis.noUsageAcv)}
        tone="warning"
        delta={deltas ? <Delta value={deltas.noUsageAcv} goodWhenUp={false} format={money} /> : undefined}
        hint="live contracts with no usage"
      />
      <Stat
        label="Active clients (all)"
        value={kpis.totalActiveClients.toLocaleString("en-US")}
        delta={deltas ? <Delta value={deltas.totalActiveClients} format={num} /> : undefined}
        hint={`across ${kpis.customersInView} customers in view`}
      />
    </section>
  );
}
