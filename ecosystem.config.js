module.exports = {
  apps: [
    {
      name: "habib-server",
      script: "./dist/server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "habib-email-worker",
      script: "./dist/workers/email.worker.js",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
