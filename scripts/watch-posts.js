const chokidar = require('chokidar')
const { exec } = require('child_process')
const path = require('path')

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog')

console.log('Watching for changes in content/blog...')

const watcher = chokidar.watch(CONTENT_DIR, {
  ignored: /(^|[\/\\])\../,
  persistent: true
})

const generatePosts = () => {
  exec('node scripts/generate-posts.js', { cwd: path.join(__dirname, '..') }, (err, stdout) => {
    if (err) {
      console.error('Error generating posts:', err)
      return
    }
    console.log(stdout.trim())
  })
}

watcher
  .on('add', () => generatePosts())
  .on('change', () => generatePosts())
  .on('unlink', () => generatePosts())
