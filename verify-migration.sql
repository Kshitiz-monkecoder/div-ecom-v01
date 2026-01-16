-- Verify migration completion

-- Check OrderItem table structure
.schema OrderItem

-- Check if orders have orderNumbers
SELECT COUNT(*) as orders_without_number FROM "Order" WHERE "orderNumber" IS NULL OR "orderNumber" = '';

-- Check order count vs OrderItem count
SELECT 
    (SELECT COUNT(*) FROM "Order") as total_orders,
    (SELECT COUNT(*) FROM "OrderItem") as total_order_items;

-- Sample check: show a few orders with their items
SELECT 
    o."orderNumber",
    o."id" as order_id,
    COUNT(oi."id") as item_count
FROM "Order" o
LEFT JOIN "OrderItem" oi ON o."id" = oi."orderId"
GROUP BY o."id", o."orderNumber"
LIMIT 5;
