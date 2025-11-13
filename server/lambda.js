const server = require("./server");
const serverless = require("@vendia/serverless-express");

exports.handler = serverless({ app: server });
