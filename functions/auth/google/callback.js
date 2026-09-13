import { pagesHandler } from "../../_shared/adapt.js";
import { handler } from "../../_shared/google.js";

export const onRequest = pagesHandler(handler);
