const ghpages = require('gh-pages');


ghpages.publish('dist', {
  message: 'Auto-generated commit',
  repo: `https://${process.env.gh_token}@github.com/vm-mishchenko/text-analyzer.git`,
  silent: false,
}, function (err) {
  console.log(err);
});
