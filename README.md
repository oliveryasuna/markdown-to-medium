# markdown-to-medium

Converts Markdown to HTML and copies it to your clipboard as rich text. Paste directly into Medium (or any rich text editor) with formatting preserved.

## Installation

```sh
bun install
bun link
```

## Usage

```sh
cat article.md | m2m
```

The HTML is copied to your clipboard. Paste into Medium with `Cmd+V` / `Ctrl+V`.

## Platform Requirements

- **macOS** -- Swift (included with Xcode/CLT)
- **Linux** -- `xclip` (`sudo apt install xclip`)
- **Windows** -- PowerShell (included with Windows)

## Security

HTML output is not sanitized. Malicious Markdown (e.g., `<script>` tags) will be included in the clipboard contents. Most rich text editors (including Medium) sanitize on paste, but be cautious when pasting into contexts that render raw HTML.

## License

This project is licensed under the [MIT License](LICENSE).
