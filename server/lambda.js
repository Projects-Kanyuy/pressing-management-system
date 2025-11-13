import app from "./server.js";
import serverless from "@vendia/serverless-express";

export const handler = serverless({ app });
