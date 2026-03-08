-- Burne Cafe Place — PostgreSQL Schema
-- Run: psql -U postgres -d burne_cafe -f src/db/schema.sql

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'employee', 'manager');
CREATE TYPE order_status AS ENUM ('preparing', 'on_the_way', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card_on_delivery', 'online_card');
CREATE TYPE delivery_type AS ENUM ('asap', 'custom');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'customer',
  phone         VARCHAR(20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stores
CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  district   VARCHAR(100) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employee — Store mapping
CREATE TABLE IF NOT EXISTS employee_stores (
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, store_id)
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  image_url   TEXT,
  base_price  NUMERIC(10,2) NOT NULL,
  is_popular  BOOLEAN NOT NULL DEFAULT false,
  is_new      BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  discount    NUMERIC(5,2) NOT NULL DEFAULT 0,
  calories    INTEGER,
  protein     INTEGER,
  carbs       INTEGER,
  fat         INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Sizes
CREATE TABLE IF NOT EXISTS product_sizes (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name         VARCHAR(50) NOT NULL,
  price_addition NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Product Milk Options
CREATE TABLE IF NOT EXISTS product_milk_options (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  price_addition NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Product Extras
CREATE TABLE IF NOT EXISTS product_extras (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  price_addition NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id               SERIAL PRIMARY KEY,
  code             VARCHAR(50) NOT NULL UNIQUE,
  discount_type    discount_type NOT NULL,
  discount_value   NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  order_number      VARCHAR(50) NOT NULL UNIQUE,
  customer_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  store_id          INTEGER REFERENCES stores(id) ON DELETE SET NULL,
  status            order_status NOT NULL DEFAULT 'preparing',
  subtotal          NUMERIC(10,2) NOT NULL,
  tax_amount        NUMERIC(10,2) NOT NULL,
  discount_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  coupon_id         INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
  delivery_type     delivery_type NOT NULL DEFAULT 'asap',
  custom_time       VARCHAR(10),
  payment_method    payment_method NOT NULL,
  order_note        TEXT,
  customer_name     VARCHAR(100),
  customer_phone    VARCHAR(20),
  city              VARCHAR(100),
  district          VARCHAR(100),
  neighborhood      VARCHAR(100),
  full_address      TEXT,
  estimated_delivery VARCHAR(50),
  is_manual         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items (snapshot of customization at order time)
CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name   VARCHAR(100) NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1,
  selected_size  VARCHAR(50),
  size_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  selected_milk  VARCHAR(100),
  milk_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price     NUMERIC(10,2) NOT NULL,
  total_price    NUMERIC(10,2) NOT NULL,
  note           TEXT
);

-- Order Item Extras (snapshot)
CREATE TABLE IF NOT EXISTS order_item_extras (
  id            SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  extra_name    VARCHAR(100) NOT NULL,
  extra_price   NUMERIC(10,2) NOT NULL DEFAULT 0
);
