var gulp = require('gulp');
var fs  = require('fs');

var lunr = require('lunr');

gulp.task('lunr-index', () => {
  const documents = JSON.parse(fs.readFileSync('docs/index.json'));

  let lunrIndex = lunr(function() {
        this.field("title", {
            boost: 10
        });
        this.field("tags", {
            boost: 1
        });
        this.field("content");
        this.ref("uri");

        documents.forEach(function(doc) {
            this.add(doc);
        }, this);
    });

  fs.writeFileSync('static/js/lunr-index.json', JSON.stringify(lunrIndex));
});