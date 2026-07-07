# markdown-to-medium

Converts Markdown to HTML and prints it to stdout. Pipe it wherever you want — a file, your clipboard, or another tool.

## Installation

Install globally from npm (works on any runtime — Bun, Node 18+, or Deno):

```sh
bun install -g @oliveryasuna/m2m
```

Or run it once without installing:

```sh
bunx @oliveryasuna/m2m < article.md
```

## Usage

```sh
cat article.md | m2m
```

The HTML is written to stdout. Redirect it to a file:

```sh
cat article.md | m2m > article.html
```

Or pipe it to your clipboard to paste into Medium (or any rich text editor):

```sh
# macOS
cat article.md | m2m | pbcopy

# Linux (X11)
cat article.md | m2m | xclip -selection clipboard -t text/html

# Linux (Wayland)
cat article.md | m2m | wl-copy --type text/html

# Windows
Get-Content article.md -Raw | m2m | Set-Clipboard
```

## Security

HTML output is not sanitized. Malicious Markdown (e.g., `<script>` tags) will be included in the output. Most rich text editors (including Medium) sanitize on paste, but be cautious when piping into contexts that render raw HTML.

## License

This project is licensed under the [MIT License](LICENSE).
