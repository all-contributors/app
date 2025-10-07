# Working with forks:

## Syncing a fork

1. `git remote add parent git@github.com:all-contributors/all-contributors-bot.git`
2. `git fetch parent`
3. `git checkout main` or `git checkout empty-contribs` (this branch on your fork)
4. `git merge parent/main`

See https://help.github.com/articles/syncing-a-fork/
