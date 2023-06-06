const Config = require("../../lib/modules/config.js");

describe("Config", () => {
    test("ensure default options", async () => {
        const config = new Config();

        expect(config.options.files).toStrictEqual(["README.md"]);
        expect(config.options.contributorsPerLine).toStrictEqual(7);
        expect(config.options.commitType).toStrictEqual("docs");
        expect(config.options.commitConvention).toStrictEqual("angular");
        expect(config.options.skipCi).toStrictEqual(true);
        expect(config.options.imageSize).toStrictEqual(100);
        expect(config.options.commit).toStrictEqual(false);
        expect(config.options.contributors).toStrictEqual([]);
    });

    test("ensure fallback values for options", async () => {
        const config = new Config(null, {});
        config.get()

        expect(config.options.files).toStrictEqual(["README.md"]);
        expect(config.options.contributorsPerLine).toStrictEqual(7);
        expect(config.options.commitType).toStrictEqual("docs");
        expect(config.options.commitConvention).toStrictEqual("angular");
        expect(config.options.skipCi).toStrictEqual(true);
        expect(config.options.imageSize).toStrictEqual(100);
        expect(config.options.commit).toStrictEqual(false);
        expect(config.options.contributors).toStrictEqual([]);
    });

    test("invalid value for `files` option", async () => {
        const config = new Config(null, { files: "tenshia.md" });
        config.get()

        expect(config.options.files).toStrictEqual(["README.md"]);
    });

    test("invalid value for `commitType` option", async () => {
        const config = new Config(null, { commitType: null });
        config.get()

        expect(config.options.commitType).toStrictEqual("docs");
    });

    test("invalid value for `commitConvention` option", async () => {
        const config = new Config(null, { commitConvention: null });
        config.get()

        expect(config.options.commitConvention).toStrictEqual("angular");
    });

    test("invalid value for `contributorsPerLine` option", async () => {
        const config = new Config(null, { contributorsPerLine: "7" });
        config.get()

        expect(config.options.contributorsPerLine).toStrictEqual(7);
    });

    test("invalid value for `contributors` option", async () => {
        const config = new Config(null, { contributors: null });
        config.get()

        expect(config.options.contributors).toStrictEqual([]);
    });
});
