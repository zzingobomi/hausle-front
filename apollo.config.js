module.exports = {
  client: {
    includes: ["./src/**/*.tsx"],
    tagName: "gql",
    service: {
      name: "hausle-back",
      url: "http://localhost:17200/graphql",
    },
  },
};
