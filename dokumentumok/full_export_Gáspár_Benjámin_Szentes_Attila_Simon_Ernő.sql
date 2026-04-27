PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        );
INSERT INTO users VALUES(1,'Admin','admin@webshop.hu','$2b$10$7z1HrkTgwViI.j3EXGsHZ.Jh6Cf9SCtaXVT1ERIyT8zdfOeCZqasK','admin');
CREATE TABLE user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            phone TEXT,
            zip TEXT,
            city TEXT,
            address TEXT
        );
INSERT INTO user_profiles VALUES(1,1,'+36204756239','1051','Budapest','Fő utca 12.');
CREATE TABLE idempotency_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_value TEXT UNIQE,
            order_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
INSERT INTO idempotency_keys VALUES(1,'1776958644591-6d032887b47a159c7f9b4541000fc2d',1,'2026-04-23 15:37:35');
CREATE TABLE category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        );
INSERT INTO category VALUES(1,'Rendeléssel kapcsolatos kérdés');
INSERT INTO category VALUES(2,'Szállításról érdeklődnék');
INSERT INTO category VALUES(3,'Termék visszaküldése/csere');
INSERT INTO category VALUES(4,'Egyéb');
CREATE TABLE contact (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            email TEXT,
            category_id INTEGER,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES category(id)
        );
CREATE TABLE product_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            size_type TEXT
            );
INSERT INTO product_categories VALUES(1,'Ing','clothing');
INSERT INTO product_categories VALUES(2,'Zakó','clothing');
INSERT INTO product_categories VALUES(3,'Nadrág','clothing');
INSERT INTO product_categories VALUES(4,'Cipő','shoes');
CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price INTEGER,
            image TEXT,
            category_id INTEGER,
            description TEXT,
            sizes TEXT,
            stock TEXT
        );
INSERT INTO products VALUES(1,'Fehér elegáns ing',9990,'shirt1.jpg',1,'Prémium minőségű pamut ing, alkalmi és hétköznapi viseletre is.','S,M,L,XL,XXL','58');
INSERT INTO products VALUES(2,'Kék lezser ing',7990,'shirt2.jpg',1,'Kényelmes viselet, ideális hétvégi programokhoz.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(3,'Kockás flanel ing',9990,'shirt3.jpg',1,'Meleg és stílusos, tökéletes választás hűvösebb napokra.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(4,'Fekete zakó',24990,'jacket1.jpg',2,'Modern szabású, karcsúsított zakó elegáns eseményekre.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(5,'Szürke sportzakó',21990,'jacket2.jpg',2,'Elegáns, mégis könnyed megjelenést biztosít.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(6,'Sötétkék blézer',26990,'jacket3.jpg',2,'Klasszikus darab, amely minden ruhatár alapja.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(7,'Kék farmer nadrág',12990,'pants1.jpg',3,'Kényelmes, strapabíró farmer nadrág mindennapi használatra.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(8,'Bézs chino nadrág',11990,'pants2.jpg',3,'Elegáns és kényelmes, tökéletes irodai viselet.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(9,'Fekete szövetnadrág',14990,'pants3.jpg',3,'Hivatalos eseményekre ajánlott, prémium anyagból.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(10,'Férfi bőr cipő',19990,'shoes1.jpg',4,'Valódi bőrből készült, kényelmes talpbetéttel rendelkező cipő.','40,41,42,43,44,45','{"40":4,"41":3,"42":8,"43":2,"44":1}');
INSERT INTO products VALUES(11,'Fehér sportcipő',15990,'shoes2.jpg',4,'Trendi és kényelmes, mindennapi rohangáláshoz.','40,41,42,43,44,45','{"40":4,"41":3,"42":8,"43":2,"44":1}');
INSERT INTO products VALUES(12,'Futócipő',18990,'shoes3.jpg',4,'Könnyű szerkezet, kiváló ütéscsillapítás sportoláshoz.','40,41,42,43,44,45','{"40":4,"41":3,"42":8,"43":2,"44":1}');
CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_name TEXT,
            price INTEGER,
            quantity INTEGER,
            size TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id)
            );
INSERT INTO order_items VALUES(1,1,'Kék lezser ing',7990,1,'L');
CREATE TABLE product_stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                size TEXT,
                stock INTEGER,
                FOREIGN KEY(product_id) REFERENCES products(id)
            );
INSERT INTO product_stock VALUES(6,2,'S',5);
INSERT INTO product_stock VALUES(7,2,'M',2);
INSERT INTO product_stock VALUES(8,2,'L',7);
INSERT INTO product_stock VALUES(9,2,'XL',18);
INSERT INTO product_stock VALUES(10,2,'XXL',10);
INSERT INTO product_stock VALUES(11,3,'S',12);
INSERT INTO product_stock VALUES(12,3,'M',16);
INSERT INTO product_stock VALUES(13,3,'L',17);
INSERT INTO product_stock VALUES(14,3,'XL',3);
INSERT INTO product_stock VALUES(15,3,'XXL',16);
INSERT INTO product_stock VALUES(16,4,'S',5);
INSERT INTO product_stock VALUES(17,4,'M',8);
INSERT INTO product_stock VALUES(18,4,'L',20);
INSERT INTO product_stock VALUES(19,4,'XL',11);
INSERT INTO product_stock VALUES(20,4,'XXL',11);
INSERT INTO product_stock VALUES(21,5,'S',13);
INSERT INTO product_stock VALUES(22,5,'M',3);
INSERT INTO product_stock VALUES(23,5,'L',16);
INSERT INTO product_stock VALUES(24,5,'XL',11);
INSERT INTO product_stock VALUES(25,5,'XXL',5);
INSERT INTO product_stock VALUES(26,6,'S',19);
INSERT INTO product_stock VALUES(27,6,'M',15);
INSERT INTO product_stock VALUES(28,6,'L',1);
INSERT INTO product_stock VALUES(29,6,'XL',7);
INSERT INTO product_stock VALUES(30,6,'XXL',8);
INSERT INTO product_stock VALUES(31,7,'S',15);
INSERT INTO product_stock VALUES(32,7,'M',6);
INSERT INTO product_stock VALUES(33,7,'L',13);
INSERT INTO product_stock VALUES(34,7,'XL',4);
INSERT INTO product_stock VALUES(35,7,'XXL',3);
INSERT INTO product_stock VALUES(36,8,'S',6);
INSERT INTO product_stock VALUES(37,8,'M',9);
INSERT INTO product_stock VALUES(38,8,'L',14);
INSERT INTO product_stock VALUES(39,8,'XL',12);
INSERT INTO product_stock VALUES(40,8,'XXL',10);
INSERT INTO product_stock VALUES(41,9,'S',20);
INSERT INTO product_stock VALUES(42,9,'M',17);
INSERT INTO product_stock VALUES(43,9,'L',20);
INSERT INTO product_stock VALUES(44,9,'XL',20);
INSERT INTO product_stock VALUES(45,9,'XXL',8);
INSERT INTO product_stock VALUES(46,10,'40',1);
INSERT INTO product_stock VALUES(47,10,'41',4);
INSERT INTO product_stock VALUES(48,10,'42',10);
INSERT INTO product_stock VALUES(49,10,'43',6);
INSERT INTO product_stock VALUES(50,10,'44',8);
INSERT INTO product_stock VALUES(51,10,'45',17);
INSERT INTO product_stock VALUES(52,11,'40',12);
INSERT INTO product_stock VALUES(53,11,'41',20);
INSERT INTO product_stock VALUES(54,11,'42',19);
INSERT INTO product_stock VALUES(55,11,'43',19);
INSERT INTO product_stock VALUES(56,11,'44',9);
INSERT INTO product_stock VALUES(57,11,'45',3);
INSERT INTO product_stock VALUES(58,12,'40',3);
INSERT INTO product_stock VALUES(59,12,'41',18);
INSERT INTO product_stock VALUES(60,12,'42',5);
INSERT INTO product_stock VALUES(61,12,'43',8);
INSERT INTO product_stock VALUES(62,12,'44',19);
INSERT INTO product_stock VALUES(63,12,'45',1);
INSERT INTO product_stock VALUES(64,1,'S',6);
INSERT INTO product_stock VALUES(65,1,'XXL',19);
INSERT INTO product_stock VALUES(66,1,'M',15);
INSERT INTO product_stock VALUES(67,1,'L',3);
INSERT INTO product_stock VALUES(68,1,'XL',15);
CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            user_email TEXT,
            total_price INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            shipping_name TEXT,
            shipping_phone TEXT,
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_zip TEXT
            );
INSERT INTO orders VALUES(1,1,'admin@webshop.hu',7990,'pending','2026-04-23 15:37:35','Admin','+36204756239','Fő utca 12.','Budapest','1051');
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',1);
INSERT INTO sqlite_sequence VALUES('product_categories',4);
INSERT INTO sqlite_sequence VALUES('category',4);
INSERT INTO sqlite_sequence VALUES('products',12);
INSERT INTO sqlite_sequence VALUES('product_stock',68);
INSERT INTO sqlite_sequence VALUES('orders',1);
INSERT INTO sqlite_sequence VALUES('order_items',1);
INSERT INTO sqlite_sequence VALUES('idempotency_keys',1);
INSERT INTO sqlite_sequence VALUES('user_profiles',1);
PRAGMA writable_schema=OFF;
COMMIT;
