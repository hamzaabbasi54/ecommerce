export const metadata = {
  title: 'Shipping & Returns | Electronica',
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Shipping & Returns</h1>
      <div className="prose prose-slate dark:prose-invert">
        <h2 className="text-xl font-semibold mt-8 mb-4">Shipping Policy</h2>
        <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.</p>
        <ul className="list-disc pl-5 mt-4 space-y-2">
          <li>Standard Shipping (3-5 business days): $5.00</li>
          <li>Express Shipping (1-2 business days): $15.00</li>
          <li>Free Shipping on all orders over $200.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">Return Policy</h2>
        <p>You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
      </div>
    </div>
  );
}
