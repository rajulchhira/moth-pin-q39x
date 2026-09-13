import { pagesHandler } from "../../../_shared/adapt.js";
import { handler } from "../../../_shared/ticket.js";

export const onRequest = pagesHandler(handler);
