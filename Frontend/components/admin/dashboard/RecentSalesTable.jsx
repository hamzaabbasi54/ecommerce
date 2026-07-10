"use client";

export default function RecentSalesTable({ sales }) {
  if (!sales || sales.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-border h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Sales</h2>
        <p className="text-sm text-muted-foreground">Latest orders in this season</p>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border text-muted-foreground font-medium">
            <tr>
              <th className="pb-3 pr-4 font-medium">Customer name</th>
              <th className="pb-3 px-4 font-medium">Product</th>
              <th className="pb-3 px-4 font-medium">Date</th>
              <th className="pb-3 pl-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border/50 last:border-0 hover:bg-surface-container-low transition-colors">
                <td className="py-4 pr-4 font-medium text-foreground">
                  {sale.customerName}
                </td>
                <td className="py-4 px-4 text-foreground max-w-[200px] truncate">
                  {sale.product}
                </td>
                <td className="py-4 px-4 text-foreground">
                  {new Date(sale.date).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 pl-4 text-foreground font-medium text-right">
                  ${sale.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
