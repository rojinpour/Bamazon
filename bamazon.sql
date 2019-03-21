DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(25) NULL,
  department_name VARCHAR(25) NULL,
  price DECIMAL(10, 2) NULL,
  stock_quantity INTEGER(10),
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES 
	('HP', 'Computers', 1000.00, 10),
	('Sony', 'Speakers', 167.50, 5),
	('Beats', 'Headphones', 200.00, 10000),
 	('iPhone 8', 'Cell Phones', 800.00, 100),
	('Nike', 'Sunglasses', 199.99, 1),
	('Webcam', 'Computer Accessories', 75.49, 100),
	('LG Monitor', 'Computer Accessories', 549.99, 15),
	('Canon', 'Camera', 1035.00, 10),
	('Nikon', 'Camera', 1150.00, 5),
('Apple Charger', 'Computer Accessories', 120.00, 2);