import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../upload/route";

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
