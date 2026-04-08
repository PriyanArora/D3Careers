/* global process */
import fs from 'fs'
import path from 'path'

const rootDir = process.cwd()
const textTargets = [
  path.join(rootDir, 'src'),
  path.join(rootDir, 'public'),
]

const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.md'])
const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
const disallowedNamePattern = /emoji/i
const violations = []

function walkDirectory(dirPath, callback) {
  if (!fs.existsSync(dirPath)) {
    return
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      walkDirectory(fullPath, callback)
      continue
    }

    callback(fullPath, entry.name)
  }
}

for (const targetDir of textTargets) {
  walkDirectory(targetDir, (filePath, fileName) => {
    if (disallowedNamePattern.test(fileName)) {
      violations.push({ type: 'asset-name', filePath, detail: 'contains "emoji" in file name' })
    }

    const ext = path.extname(filePath)
    if (!textExtensions.has(ext)) {
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split(/\r?\n/)

    lines.forEach((line, index) => {
      if (emojiPattern.test(line)) {
        violations.push({
          type: 'text-emoji',
          filePath,
          detail: `line ${index + 1}`,
        })
      }
    })
  })
}

if (violations.length > 0) {
  console.error('No-emoji check failed. Remove emoji text or emoji-style asset naming from the UI codebase.')
  for (const violation of violations) {
    console.error(`- ${violation.type}: ${path.relative(rootDir, violation.filePath)} (${violation.detail})`)
  }
  process.exit(1)
}

console.info('No-emoji check passed.')