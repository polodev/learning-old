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