/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/src/models",
        "/src/op",
        "/src/routes",
        "/src/rpc"
    ]
};