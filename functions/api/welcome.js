import { pagesHandler } from "../_shared/adapt.js";
import { handler } from "../_shared/welcome.js";

export const onRequest = pagesHandler(handler);
