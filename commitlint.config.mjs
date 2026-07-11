const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [0],
    "subject-max-length": [0],
    "body-max-length": [0],
    "body-max-line-length": [0],
    "footer-max-length": [0],
    "footer-max-line-length": [0],
    "scope-max-length": [0],
    "type-max-length": [0],
  },
};

export default commitlintConfig;
