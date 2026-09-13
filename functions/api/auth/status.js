import { pagesHandler } from "../../_shared/adapt.js";
import { handler } from "../../_shared/status.js";

export const onRequest = pagesHandler(handler);
