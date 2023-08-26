Monorepo for JavaScript Copilot component.

# Background
LLM has changed people's work and life significantly. However, it does not always return the right answer, and therefore has limited applications. Copilot UI greatly expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy to use UI specialized for natural language input
- Support for text-only or text containing HTML
- Provide helpers for OpenAI library, SSE stream and text stream.

## Packages

- [js-copilot](./packages/js-copilot/README.md)
- [react-copilot](./packages/react-copilot/README.md)
- [demo](./packages/demo/README.md)

# Guide for users

## normal state:
| Key | Action |
|-----|--------|
| Ctrl+Enter | Start completion |

## completion state:
| Key | Action |
|-----|--------|
| Esc | Collapse completion |
| Character Key | Collapse completion and insert pressed key |

Unlike Github copilot, you can perform operations such as arrow keys, copy, and paste even during completion.
