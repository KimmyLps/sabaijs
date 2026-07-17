import * as address from "./address/index.js";
import * as bank from "./bank/index.js";
import * as batch from "./batch/index.js";
import * as currency from "./currency/index.js";
import * as geography from "./geography/index.js";
import * as collection from "./collection/index.js";
import * as date from "./date/index.js";
import * as invoice from "./invoice/index.js";
import * as quotation from "./quotation/index.js";
import * as receipt from "./receipt/index.js";
import * as text from "./text/index.js";
import * as validators from "./validators/index.js";

export * from "./address/index.js";
export * from "./bank/index.js";
export * from "./batch/index.js";
export * from "./currency/index.js";
export * from "./geography/index.js";
export * from "./collection/index.js";
export * from "./date/index.js";
export * from "./invoice/index.js";
export * from "./quotation/index.js";
export * from "./receipt/index.js";
export * from "./text/index.js";
export * from "./validators/index.js";

const sabaijs = {
  ...address,
  ...bank,
  ...batch,
  ...currency,
  ...geography,
  ...collection,
  ...date,
  ...invoice,
  ...quotation,
  ...receipt,
  ...text,
  ...validators,
};

export default sabaijs;
