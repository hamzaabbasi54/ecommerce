"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecentSalesTable({ sales }) {
  if (!sales || sales.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-border h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Recent Sales</h2>
        <p className="text-sm text-muted-foreground">Latest orders in this season</p>
      </div>

      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Customer name</TableHead>
              <TableHead className="font-medium">Product</TableHead>
              <TableHead className="font-medium">Date</TableHead>
              <TableHead className="text-right font-medium">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-surface-container-low transition-colors">
                <TableCell className="font-medium text-foreground">
                  {sale.customerName}
                </TableCell>
                <TableCell className="text-foreground max-w-[200px] truncate">
                  {sale.product}
                </TableCell>
                <TableCell className="text-foreground">
                  {new Date(sale.date).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell className="text-foreground font-medium text-right">
                  ${sale.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
