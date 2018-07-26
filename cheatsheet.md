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




