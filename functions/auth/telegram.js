import { pagesHandler } from "../_shared/adapt.js";
import { handler } from "../_shared/telegram.js";

export const onRequest = pagesHandler(handler);
