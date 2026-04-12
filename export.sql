PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        );
INSERT INTO users VALUES(1,'Egyéb','teszt@teszt.hu','$2b$10$102D5VpI7pVVtSdfHc1Hk.81vJ1i.hM.HOX2w3hlng27FPq.F0ZOO','admin');
INSERT INTO users VALUES(2,'admin','admin@webshop.hu','$2b$10$JwvGJcXLKoa79mV9Xl9WEOKZ882RHLg9X0MmshZvoIMUfGpu.88S2','admin');
INSERT INTO users VALUES(3,'teszt2','teszt2@teszt.hu','$2b$10$Kw23T1uy3QwAEgiBjnE.4OC.IGyiMR1sjp8K2EG0CNIpmAe23zNka','user');
CREATE TABLE user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            phone TEXT,
            zip TEXT,
            city TEXT,
            address TEXT
        );
INSERT INTO user_profiles VALUES(1,1,'+36204756239','2113','Budapest','fő utca 14');
INSERT INTO user_profiles VALUES(2,2,'+36204756239','1051','Budapest','fő utca 21');
INSERT INTO user_profiles VALUES(3,3,'+36204736239','2113','Erdőkertes','Fő utca 12');
CREATE TABLE category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        );
INSERT INTO category VALUES(1,'Rendeléssel kapcsolatos kérdés');
INSERT INTO category VALUES(2,'Szállításról érdeklődnék');
INSERT INTO category VALUES(3,'Termék visszaküldése');
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
INSERT INTO contact VALUES(1,NULL,'Egyéb','teszt@teszt.hu',1,'tesztelek','2026-04-10 16:41:16');
INSERT INTO contact VALUES(2,NULL,'Egyéb','teszt@teszt.hu',1,'tesztelek','2026-04-10 16:59:36');
INSERT INTO contact VALUES(3,1,'Egyéb','teszt@teszt.hu',1,'tesztelek','2026-04-10 17:00:23');
INSERT INTO contact VALUES(4,1,'Vezeték és keresztnév','pelda@email.hu',2,'Miben segíthetünk?','2026-04-11 20:36:39');
INSERT INTO contact VALUES(5,1,'Teszt','teszt@teszt.hu',4,'Teszt','2026-04-12 09:21:41');
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
INSERT INTO products VALUES(1,'Egyéb',11000,'shirt1.jpg',1,'Prémium minőségű pamut ing, alkalmi és hétköznapi viseletre is.','S,M,L,XL,XXL','{"S":5,"M":3,"L":8,"XL":2,"XXL":1}');
INSERT INTO products VALUES(2,'Kék lezser ing',7990,'shirt2.jpg',1,'Kényelmes viselet, ideális hétvégi programokhoz.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(3,'Kockás flanel ing',9990,'shirt3.jpg',1,'Meleg és stílusos, tökéletes választás hűvösebb napokra.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(4,'Fekete zakó',24990,'jacket1.jpg',2,'Modern szabású, karcsúsított zakó elegáns eseményekre.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(5,'Szürke sportzakó',21990,'jacket2.jpg',2,'Elegáns, mégis könnyed megjelenést biztosít.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(6,'Sötétkék blézer',26990,'jacket3.jpg',2,'Klasszikus darab, amely minden ruhatár alapja.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(7,'Kék farmer nadrág',12990,'pants1.jpg',3,'Kényelmes, strapabíró farmer nadrág mindennapi használatra.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(8,'Bézs chino nadrág',11990,'pants2.jpg',3,'Elegáns és kényelmes, tökéletes irodai viselet.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(9,'Fekete szövetnadrág',14990,'pants3.jpg',3,'Hivatalos eseményekre ajánlott, prémium anyagból.','S,M,L,XL,XXL','[object Object]');
INSERT INTO products VALUES(10,'Férfi bőr cipő',19990,'shoes1.jpg',4,'Valódi bőrből készült, kényelmes talpbetéttel rendelkező cipő.','40,41,42,43,44,45','[object Object]');
INSERT INTO products VALUES(11,'Fehér sportcipő',15990,'shoes2.jpg',4,'Trendi és kényelmes, mindennapi rohangáláshoz.','40,41,42,43,44,45','[object Object]');
INSERT INTO products VALUES(12,'Futócipő',18990,'shoes3.jpg',4,'Könnyű szerkezet, kiváló ütéscsillapítás sportoláshoz.','40,41,42,43,44,45','[object Object]');
CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_name TEXT,
            price INTEGER,
            quantity INTEGER, size TEXT,
            FOREIGN KEY(order_id) REFERENCES orders(id)
        );
INSERT INTO order_items VALUES(1,1,'Fehér elegáns ing',9990,1,NULL);
INSERT INTO order_items VALUES(2,2,'Fehér elegáns ing',9990,1,NULL);
INSERT INTO order_items VALUES(3,3,'Fehér elegáns ing',9990,1,NULL);
INSERT INTO order_items VALUES(4,4,'Egyéb',11000,1,NULL);
INSERT INTO order_items VALUES(5,5,'Egyéb',11000,2,NULL);
INSERT INTO order_items VALUES(6,6,'Egyéb',11000,1,NULL);
INSERT INTO order_items VALUES(7,6,'Kék lezser ing',7990,2,NULL);
INSERT INTO order_items VALUES(8,7,'Egyéb',11000,1,NULL);
INSERT INTO order_items VALUES(9,8,'Kockás flanel ing',9990,1,NULL);
INSERT INTO order_items VALUES(10,9,'Kockás flanel ing',9990,1,NULL);
INSERT INTO order_items VALUES(11,10,'Kockás flanel ing',9990,1,NULL);
INSERT INTO order_items VALUES(12,11,'Kék lezser ing',7990,1,'M');
INSERT INTO order_items VALUES(13,12,'Futócipő',18990,1,'40');
CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            user_email TEXT,
            guest_email TEXT NULL,
            total_price INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , shipping_name VARCHAR(255), shipping_phone VARCHAR(255), shipping_address TEXT, shipping_city TEXT, shipping_zip TEXT);
INSERT INTO orders VALUES(1,1,'teszt@teszt.hu',NULL,11490,'pending','2026-04-09 08:15:19',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(2,NULL,NULL,'email@email.com',11490,'pending','2026-04-09 08:20:35',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(3,1,'teszt@teszt.hu',NULL,11490,'pending','2026-04-09 08:21:44',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(4,NULL,NULL,'teszt@teszt.hu',22000,'pending','2026-04-10 06:31:44',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(5,1,'teszt@teszt.hu',NULL,22000,'pending','2026-04-10 06:57:31',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(6,1,'teszt@teszt.hu',NULL,26980,'pending','2026-04-10 07:50:09',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(7,NULL,NULL,'teszt@teszt.hu',11000,'pending','2026-04-10 17:08:31',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(8,1,'teszt@teszt.hu',NULL,9990,'pending','2026-04-11 07:33:44',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(9,1,'teszt@teszt.hu',NULL,9990,'pending','2026-04-11 16:43:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(10,1,'teszt@teszt.hu',NULL,9990,'pending','2026-04-11 16:43:24',NULL,NULL,NULL,NULL,NULL);
INSERT INTO orders VALUES(11,2,'admin@webshop.hu',NULL,7990,'pending','2026-04-11 17:57:19','admin','+36204756239','Fő utca 9','Budapest','1091');
INSERT INTO orders VALUES(12,1,'teszt@teszt.hu',NULL,18990,'pending','2026-04-11 20:46:26','Egyéb','+36204756239','Szuper utca 12','Őrbottyán','1051');
CREATE TABLE product_stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                size TEXT,
                stock INTEGER,
                FOREIGN KEY(product_id) REFERENCES products(id)
            );
INSERT INTO product_stock VALUES(1,1,'S',0);
INSERT INTO product_stock VALUES(2,1,'M',12);
INSERT INTO product_stock VALUES(3,1,'L',8);
INSERT INTO product_stock VALUES(4,1,'XL',5);
INSERT INTO product_stock VALUES(5,1,'XXL',5);
INSERT INTO product_stock VALUES(6,2,'S',10);
INSERT INTO product_stock VALUES(7,2,'M',5);
INSERT INTO product_stock VALUES(8,2,'L',3);
INSERT INTO product_stock VALUES(9,2,'XL',16);
INSERT INTO product_stock VALUES(10,2,'XXL',19);
INSERT INTO product_stock VALUES(11,3,'S',1);
INSERT INTO product_stock VALUES(12,3,'M',9);
INSERT INTO product_stock VALUES(13,3,'L',13);
INSERT INTO product_stock VALUES(14,3,'XL',2);
INSERT INTO product_stock VALUES(15,3,'XXL',2);
INSERT INTO product_stock VALUES(16,4,'S',8);
INSERT INTO product_stock VALUES(17,4,'M',7);
INSERT INTO product_stock VALUES(18,4,'L',16);
INSERT INTO product_stock VALUES(19,4,'XL',13);
INSERT INTO product_stock VALUES(20,4,'XXL',19);
INSERT INTO product_stock VALUES(21,5,'S',6);
INSERT INTO product_stock VALUES(22,5,'M',12);
INSERT INTO product_stock VALUES(23,5,'L',13);
INSERT INTO product_stock VALUES(24,5,'XL',13);
INSERT INTO product_stock VALUES(25,5,'XXL',16);
INSERT INTO product_stock VALUES(26,6,'S',10);
INSERT INTO product_stock VALUES(27,6,'M',18);
INSERT INTO product_stock VALUES(28,6,'L',20);
INSERT INTO product_stock VALUES(29,6,'XL',20);
INSERT INTO product_stock VALUES(30,6,'XXL',7);
INSERT INTO product_stock VALUES(31,7,'S',12);
INSERT INTO product_stock VALUES(32,7,'M',12);
INSERT INTO product_stock VALUES(33,7,'L',16);
INSERT INTO product_stock VALUES(34,7,'XL',10);
INSERT INTO product_stock VALUES(35,7,'XXL',13);
INSERT INTO product_stock VALUES(36,8,'S',5);
INSERT INTO product_stock VALUES(37,8,'M',8);
INSERT INTO product_stock VALUES(38,8,'L',2);
INSERT INTO product_stock VALUES(39,8,'XL',10);
INSERT INTO product_stock VALUES(40,8,'XXL',10);
INSERT INTO product_stock VALUES(41,9,'S',20);
INSERT INTO product_stock VALUES(42,9,'M',4);
INSERT INTO product_stock VALUES(43,9,'L',3);
INSERT INTO product_stock VALUES(44,9,'XL',18);
INSERT INTO product_stock VALUES(45,9,'XXL',5);
INSERT INTO product_stock VALUES(46,10,'40',12);
INSERT INTO product_stock VALUES(47,10,'41',9);
INSERT INTO product_stock VALUES(48,10,'42',18);
INSERT INTO product_stock VALUES(49,10,'43',5);
INSERT INTO product_stock VALUES(50,10,'44',5);
INSERT INTO product_stock VALUES(51,10,'45',13);
INSERT INTO product_stock VALUES(52,11,'40',18);
INSERT INTO product_stock VALUES(53,11,'41',5);
INSERT INTO product_stock VALUES(54,11,'42',17);
INSERT INTO product_stock VALUES(55,11,'43',16);
INSERT INTO product_stock VALUES(56,11,'44',8);
INSERT INTO product_stock VALUES(57,11,'45',5);
INSERT INTO product_stock VALUES(58,12,'40',1);
INSERT INTO product_stock VALUES(59,12,'41',7);
INSERT INTO product_stock VALUES(60,12,'42',4);
INSERT INTO product_stock VALUES(61,12,'43',2);
INSERT INTO product_stock VALUES(62,12,'44',4);
INSERT INTO product_stock VALUES(63,12,'45',6);
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('products',12);
INSERT INTO sqlite_sequence VALUES('product_stock',63);
INSERT INTO sqlite_sequence VALUES('users',3);
INSERT INTO sqlite_sequence VALUES('user_profiles',10);
INSERT INTO sqlite_sequence VALUES('orders',12);
INSERT INTO sqlite_sequence VALUES('order_items',13);
INSERT INTO sqlite_sequence VALUES('category',4);
INSERT INTO sqlite_sequence VALUES('contact',5);
PRAGMA writable_schema=OFF;
COMMIT;
