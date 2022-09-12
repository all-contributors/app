const parseComment = require("../../lib/parse-comment");

describe("parseComment", () => {
  test("Basic intent to add", () => {
    expect(
      parseComment(
        `@all-contributors please add jakebolam for doc, infra and code`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam",
      contributions: ["doc", "infra", "code"],
    });
  });

  test("Basic intent to add - ignore case (for action and contributions, NOT for user)", () => {
    expect(
      parseComment(
        `@all-contributors please Add jakeBolam for DOC, inFra and coDe`
      )
    ).toEqual({
      action: "add",
      who: "jakeBolam",
      contributions: ["doc", "infra", "code"],
    });
  });

  test("Basic intent to add - non name username", () => {
    expect(
      parseComment(`@all-contributors please add tbenning for design`)
    ).toEqual({
      action: "add",
      who: "tbenning",
      contributions: ["design"],
    });
  });

  test("Basic intent to add - capitalized username", () => {
    expect(
      parseComment(`@all-contributors please add Rbot25_RULES for tool`)
    ).toEqual({
      action: "add",
      who: "Rbot25_RULES",
      contributions: ["tool"],
    });
  });

  test("Basic intent to add - with plurals", () => {
    expect(parseComment(`@all-contributors please add dat2 for docs`)).toEqual({
      action: "add",
      who: "dat2",
      contributions: ["doc"],
    });
  });

  test("Support full words (like infrastructure)", () => {
    expect(
      parseComment(
        `@all-contributors please add jakebolam for infrastructure, documentation`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam",
      contributions: ["infra", "doc"],
    });
  });

  test("Support adding people with mentions", () => {
    expect(
      parseComment(`@all-contributors please add @sinchang for infrastructure`)
    ).toEqual({
      action: "add",
      who: "sinchang",
      contributions: ["infra"],
    });
  });

  test("Support alternative sentences", () => {
    expect(
      parseComment(`@all-contributors add @sinchang for infrastructure`)
    ).toEqual({
      action: "add",
      who: "sinchang",
      contributions: ["infra"],
    });

    expect(
      parseComment(
        `Jane you are crushing it in documentation and your infrastructure work has been great too. Let's add jane.doe23 for her contributions. cc @all-contributors-bot`
      )
    ).toEqual({
      action: "add",
      who: "jane.doe23",
      contributions: ["doc", "infra"],
    });
  });

  test("Support split words (like user testing)", () => {
    expect(
      parseComment(
        `@all-contributors please add jakebolam for infrastructure, fund finding`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam",
      contributions: ["infra", "fundingFinding"],
    });

    expect(
      parseComment(
        `@all-contributors please add jakebolam for infrastructure, user testing and testing`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam",
      contributions: ["infra", "userTesting", "test"],
    });
  });

  test("Support split words types that are referenced via other terms (e.g. a plural split word)", () => {
    expect(
      parseComment(
        `@all-contributors please add @jakebolam for infrastructure, funds`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam",
      contributions: ["infra", "fundingFinding"],
    });
  });

  test("Intent unknown", () => {
    expect(parseComment(`@all-contributors please lollmate for tool`)).toEqual({
      action: false,
    });
  });

  test("Ensure (trailing) hyphens are not discarded", () => {
    expect(
      parseComment(`@all-contributors please add @jakebolam- for testing`)
    ).toEqual({
      action: "add",
      who: "jakebolam-",
      contributions: ["test"],
    });

    expect(
      parseComment(
        `@all-contributors please add @jakebolam-jakebolam for bugs, ideas`
      )
    ).toEqual({
      action: "add",
      who: "jakebolam-jakebolam",
      contributions: ["bug", "ideas"],
    });
  });

  test("Contribution unknown", () => {
    expect(
      parseComment(`@all-contributors please add @octocat for unknown`)
    ).toEqual({
      action: "add",
      who: "octocat",
      contributions: [],
    });
  });
});
