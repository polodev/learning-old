# iterating categories taxonomy for sidebar

~~~go-html-template
  <ul>
    {{ range $key, $value := .Site.Taxonomies.categories }}
      <li><a href="{{ $.Site.BaseURL  }}categories/{{ $key | urlize  }}">{{ $key | humanize }}</a> ({{ len $value }})</li>
    {{ end }}
  </ul>
~~~

# showing categories for inside a post

~~~go-html-template
{{ if .Params.categories }}
  <span class="category-block">
    <strong>Categories:</strong> {{ range .Params.categories }}
    <a class="badge badge-info" href="{{$.Site.BaseURL}}categories/{{. | urlize }}">
      {{ . }}
    </a>
    {{ end }}
  </span>
{{ end}}
~~~

# showing previous and next link

~~~go-html-template
<div class="text-center py-3">
  {{ if .PrevInSection }}
    <a class="btn btn-info" href="{{.PrevInSection.Permalink}}">Next Post</a>
  {{ end }}
  {{ if .NextInSection }}
    <a class="btn btn-info" href="{{.NextInSection.Permalink}}">Previous Post</a>
  {{ end }}
</div>
~~~

# making pagination 
setting of paginate number in config.toml file 
~~~go-html-template
Paginate=2
~~~    

lopping `.Paginator.Pages` is list.html file .     

~~~go-html-template
{{ range .Paginator.Pages }}
{{ end }}
{{ partial "pagination" . }}
~~~    

making a partial pagination.html and paste content following          
~~~go-html-template
<!-- Code starts here -->
{{ $pag := $.Paginator }}
{{ if gt $pag.TotalPages 1 }}
{{ $.Scratch.Set "dot_rendered" false }}
<nav>
    <ul class="pagination">
        <!-- Don't show on 1st and 2nd page -->
        {{ if and (ne $pag.PageNumber 1) (ne $pag.PageNumber 2) }}
        <li class="page-item"><a href="{{ $pag.First.URL }}" rel="first" class="page-link">« First</a></li>
        {{ end }}

        {{ if $pag.HasPrev  }}
        <li class="page-item"><a href="{{ $pag.Prev.URL }}" rel="prev" class="page-link">‹ Prev</a></li>
        {{ end }}

        {{ range $pag.Pagers }}
            {{ if eq . $pag }} <!-- Current Page -->
            <li class="page-item active"><a href="{{ .URL }}" class="page-link">{{ .PageNumber }}</a></li>
            {{ else if and (ge .PageNumber (sub $pag.PageNumber 2)) (le .PageNumber (add $pag.PageNumber 2)) }}
            {{ $.Scratch.Set "dot_rendered" false }} <!-- Render prev 2 page and next 2 pages -->
            <li class="page-item"><a href="{{ .URL }}" class="page-link">{{ .PageNumber }}</a></li>
            {{ else if eq ($.Scratch.Get "dot_rendered") false }} <!-- render skip pages -->
            {{ $.Scratch.Set "dot_rendered" true }}
            <li class="page-item disabled"><a class="page-link">...</a></li>
            {{ end }}
        {{ end }}

        {{ if $pag.HasNext }}
        <li class="page-item"><a href="{{ $pag.Next.URL }}" rel="next" class="page-link">Next ›</a></li>
        {{ end }}

        <!-- Don't show on last and 2nd last page -->
        {{ if and (ne $pag.PageNumber $pag.TotalPages) ((ne $pag.PageNumber (sub $pag.TotalPages 1))) }}
        <li class="page-item"><a href="{{ $pag.Last.URL }}" rel="last" class="page-link">Last »</a></li>
        {{ end }}
    </ul>
</nav>
{{ end }}
<!-- Code ends here -->
~~~    

# publishDir 
we can make docs folder a website in github. So instead of public folder we can publish build in to docs folder by adding following setting in config.toml file 
~~~bash
publishDir='docs'
~~~

# how I added lunr search in my website 

1. set json output in config.toml file 
~~~js
[outputs]
home = [ "HTML", "RSS", "JSON"]
~~~

2. Added 'layout/index.json' file for json output structure. baseURL inside `config.toml` file matters.    

~~~js
[{{ range $index, $page := .Site.Pages }}
{{- if ne $page.Type "json" -}}
{{- if and $index (gt $index 0) -}},{{- end }}
{
  "uri": "{{ $page.Permalink }}",
  "title": "{{ htmlEscape $page.Title}}",
  "tags": [{{ range $tindex, $tag := $page.Params.tags }}{{ if $tindex }}, {{ end }}"{{ $tag| htmlEscape }}"{{ end }}],
  "description": "{{ htmlEscape .Description}}",
  "content": {{$page.Plain | jsonify}}
}
{{- end -}}
{{- end -}}]
~~~

3. Using `Hugo` command build the the site and generated json file. Which will be available root of the public directory `public/index.json`
4. make a gulp file for making lunr index and store file 
I have to install `lunr` , 'gulp' as dependency using npm  
~~~bash
npm init -y
npm i --save gulp lunr
~~~

make `gulpfile.json`  in my root and wrote following code 

~~~js
var gulp = require('gulp');
var fs  = require('fs');

var lunr = require('lunr');

gulp.task('lunr', () => {
  const documents = JSON.parse(fs.readFileSync('docs/index.json'));
  var store = {}
  documents.forEach(doc => {
    store[doc.uri] = {
        'title': doc.title
    };
  });
  console.log(store)

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
  var object = {
    store: store,
    index: lunrIndex
  }
  fs.writeFileSync('static/js/lunr-index.json', JSON.stringify(object));
});
~~~

to generate 'static/js/lunr-index.json' file we need do following command `gulp lunr`     
once we generate lunr index we can fetch json file using `fetch` api and listen to `keyup` event for search 

~~~js
$(document).ready(function () {
    'use strict';
    // Set up search
    var index, store;
    $.getJSON('/learning/js/lunr-index.json', function (response) {
        // Create index
        index = lunr.Index.load(response.index);
        // Create store
        store = response.store;
        // Handle search
        $('input#search').on('keyup', function () {
            // Get query
            var query = $(this).val();
            // Search for it
            var result = index.search(`${query}*`);
            console.log('result', result);
            // Output it
            var resultdiv = $('#search_result');
            if (result.length === 0 || query == '' ) {
                // Hide results
                resultdiv.hide();
            } else {
                // Show results
                resultdiv.empty();
                for (var item in result) {
                    var ref = result[item].ref;
                    var searchitem = '<li><a href="' + ref + '">' + store[ref].title + '</a></li>';
                    resultdiv.append(searchitem);
                }
                resultdiv.show();
            }
        });
    });
}); 

~~~








