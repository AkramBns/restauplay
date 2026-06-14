-- select i.id, i.name, t.unit  from ShoppingItem i inner JOIN ShoppingTransaction t on i.id = t.shopping_item_id where i.name like "%pomme%"

-- SELECT i.id as id, t.id as trx_id, i.name, t.unit FROM ShoppingItem i inner JOIN ShoppingTransaction t on i.id =t.shopping_item_id WHERE i.name LIKE '%pomm%' LIMIT 6

 -- SELECT i.id as id, t.id as trx_id, i.name, t.unit FROM ShoppingItem i inner JOIN ShoppingTransaction t on i.id =t.shopping_item_id WHERE i.name LIKE '%tom%' LIMIT 6.0
 
 
SELECT i.id as id, t.id as trx_id, i.name, t.unit FROM ShoppingItem i inner JOIN ShoppingTransaction t on i.id =t.shopping_item_id WHERE i.name LIKE '%pom%' LIMIT 6.0