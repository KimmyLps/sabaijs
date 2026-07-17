import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "address/index": "src/address/index.ts",
    "bank/index": "src/bank/index.ts",
    "batch/index": "src/batch/index.ts",
    "currency/index": "src/currency/index.ts",
    "geography/index": "src/geography/index.ts",
    "collection/index": "src/collection/index.ts",
    "date/index": "src/date/index.ts",
    "invoice/index": "src/invoice/index.ts",
    "quotation/index": "src/quotation/index.ts",
    "receipt/index": "src/receipt/index.ts",
    "text/index": "src/text/index.ts",
    "validators/index": "src/validators/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node18",
});
