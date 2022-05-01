import GitInfo from 'react-git-info/macro'

export function getCommitInfo (): string {
  const gitInfo = GitInfo()
  return gitInfo.commit.shortHash
}
