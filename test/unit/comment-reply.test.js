const CommentReply = require("../../lib/modules/comment-reply");

describe("CommentReply", () => {
  test("Won't send comment twice", async () => {
    const contextMock = {
      payload: {
        comment: {
          user: {
            login: "octocat",
          },
        },
      },
      issue: () => ({}),
      octokit: {
        issues: { createComment() {} },
      },
      log: {
        debug() {},
      },
    };
    const commentReply = new CommentReply(contextMock);
    await commentReply.send();

    expect(async () => {
      await commentReply.send();
    }).rejects.toThrow("Message already sent");
  });
});
