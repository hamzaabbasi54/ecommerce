export const orderSummaryTemplate = (order, user) => {
    // order items expect to have the nested product info
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea;">
                <p style="margin: 0; font-size: 14px; font-weight: 500; color: #111;">${item.product ? item.product.name : 'Product'}</p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eaeaea; text-align: right; font-size: 14px; color: #111;">
                $${(item.priceAtPurchase * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; color: #333; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #eaeaea; }
            .header { padding: 32px 40px; text-align: center; border-bottom: 1px solid #eaeaea; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; color: #111; letter-spacing: -0.5px; }
            .content { padding: 40px; }
            .greeting { margin-top: 0; font-size: 16px; color: #111; }
            .order-details { margin-top: 32px; }
            .order-details h2 { margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            .totals { margin-top: 24px; border-top: 2px solid #111; padding-top: 16px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #444; }
            .totals-row.bold { font-weight: 600; color: #111; font-size: 16px; margin-top: 12px; }
            .footer { padding: 24px 40px; text-align: center; font-size: 12px; color: #888; background-color: #fafafa; border-top: 1px solid #eaeaea; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
            </div>
            <div class="content">
                <p class="greeting">Hi ${user.name},</p>
                <p style="font-size: 14px; color: #555; line-height: 1.5;">Thank you for your order! We've received it and will start processing it shortly. Below are your order details.</p>
                
                <div class="order-details">
                    <h2>Order #${order.id.slice(-8).toUpperCase()}</h2>
                    <table>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <div class="totals-row"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
                        <div class="totals-row"><span>Shipping</span><span>$${order.shippingCharge.toFixed(2)}</span></div>
                        <div class="totals-row"><span>Tax</span><span>$${order.tax.toFixed(2)}</span></div>
                        <div class="totals-row bold"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
            <div class="footer">
                <p>If you have any questions, simply reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
