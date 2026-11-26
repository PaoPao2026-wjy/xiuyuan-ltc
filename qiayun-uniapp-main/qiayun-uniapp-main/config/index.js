// 环境：development / production / test
const ENV = process.env.NODE_ENV || "development";

const CONFIGS = {
  development: {
    API_BASE_URL: "http://101.132.251.43:3010",
    //API_BASE_URL: "https://api.laidianle.cc",
  },
  production: {
    API_BASE_URL: "https://api.laidianle.cc",
  },
  test: {
    API_BASE_URL: "http://101.132.251.43:3010",
  },
};

export const ENV_NAME = ENV;
export const API_BASE_URL = CONFIGS[ENV]?.API_BASE_URL || "";
