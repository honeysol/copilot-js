Monorepo for JavaScript Copilot component.

# Background
LLM has changed people's work and lives significantly. However, it does not always return the correct answer and has limited applications. Copilot UI dramatically expands the applications of LLM by allowing collaboration between LLM and humans. For this, high-quality Copilot components are essential for the development of humans with LLM.

# Features
- Easy-to-use UI specialized for natural language input
- Support for text-only or text-containing HTML
- Provide helpers for the OpenAI library, SSE, and text streams.

## Packages

- [copilot-js](./packages/copilot-js/README.md)
- [copilot-react](./packages/copilot-react/README.md)
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
