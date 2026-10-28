import {describe, expect, it} from "vitest";
import Repository from "../../lib/modules/repository.js";
import {BranchNotFoundError} from "../../lib/modules/errors.js";
import setupRepository from "../../lib/setup-repository.js";

// vi.mock cannot intercept require() while the bot is CommonJS.
// Turn this suite back on in the ESM pull request.
describe.skip("Setup Repository", () => {
  const mockBranchName = "all-contributors/add-hertzg-tenshiAMD";
  const mockContext = {
    log: {
      debug() {},
    },
  };

  it("should base off latest on first time request", async () => {
    Repository.prototype.getRef.mockReturnValue(
      Promise.reject(new BranchNotFoundError(mockBranchName))
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toHaveBeenCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).not.toHaveBeenCalled();
    expect(Repository.prototype.getPullRequestsBy).not.toHaveBeenCalled();
    expect(Repository.prototype.setBaseBranch).not.toHaveBeenCalled();
  });

  it("should delete existing dangling (already merged) branches then recreate new pr", async () => {
    Repository.prototype.getRef.mockReturnValue(Promise.resolve());
    Repository.prototype.getPullRequestsBy.mockReturnValue(
      Promise.resolve({ data: [] })
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toHaveBeenCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).toHaveBeenCalledTimes(1);
    expect(Repository.prototype.setBaseBranch).toHaveBeenCalledTimes(1);
    expect(Repository.prototype.getPullRequestsBy).toHaveBeenCalledTimes(1);
  });

  it("should use existing branch only if pr for it was not merged yet", async () => {
    Repository.prototype.getRef.mockReturnValue(Promise.resolve());
    Repository.prototype.getPullRequestsBy.mockReturnValue(
      Promise.resolve({ data: [{}] })
    );

    await setupRepository({ branchName: mockBranchName, context: mockContext });

    expect(Repository.prototype.getRef).toHaveBeenCalledWith(mockBranchName);
    expect(Repository.prototype.deleteBranch).not.toHaveBeenCalled();
    expect(Repository.prototype.getPullRequestsBy).toHaveBeenCalledTimes(1);
    expect(Repository.prototype.setBaseBranch).toHaveBeenCalledTimes(1);
  });
});
