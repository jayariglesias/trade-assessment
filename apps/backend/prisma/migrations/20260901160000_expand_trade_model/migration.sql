PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS "trades";

CREATE TABLE "trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "side" TEXT NOT NULL,
    "trader" TEXT NOT NULL,
    "trade_date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "book" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "trade_timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
