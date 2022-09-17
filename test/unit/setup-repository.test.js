const Repository = require("../../lib/modules/repository");
const { BranchNotFoundError } = require("../../lib/modules/errors");
const setupRepository = require("../../lib/setup-repository");

jest.mock("../../lib/modules/repository");

describe("Setup Repository", () => {
  const mockBranchName = "all-contributors/add-hertzg-tenshiAMD";
  const mockContext = {
    log: {
      debug() {},
    },
  };

  afterEach(() => jest.clearAllMocks());

  it("should base off latest on first time request", async () => {
    Repository.prototype.getRef.mockReturnValue(
      Promise.reject(new BranchNotFoundError(mockBranchName))
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toBeCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).not.toBeCalled();
    expect(Repository.prototype.getPullRequestsBy).not.toBeCalled();
    expect(Repository.prototype.setBaseBranch).not.toBeCalled();
  });

  it("should delete existing dangling (already merged) branches then recreate new pr", async () => {
    Repository.prototype.getRef.mockReturnValue(Promise.resolve());
    Repository.prototype.getPullRequestsBy.mockReturnValue(
      Promise.resolve({ data: [] })
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toBeCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).toBeCalledTimes(1);
    expect(Repository.prototype.setBaseBranch).toBeCalledTimes(1);
    expect(Repository.prototype.getPullRequestsBy).toBeCalledTimes(1);
  });

  it("should use existing branch only if pr for it was not merged yet", async () => {
    Repository.prototype.getRef.mockReturnValue(Promise.resolve());
    Repository.prototype.getPullRequestsBy.mockReturnValue(
      Promise.resolve({ data: [{}] })
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toBeCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).not.toBeCalled();
    expect(Repository.prototype.getPullRequestsBy).toBeCalledTimes(1);
    expect(Repository.prototype.setBaseBranch).toBeCalledTimes(1);
  });
});
