import {
  appendNode,
  insertAfterCursor,
  insertBeforeCursor,
  insertBeforeNode,
} from "./utils/insert";
import {
  getTextBeforeCursor,
  getInnerTextOfUnattachedElement,
  getTextAfterCursor,
} from "./utils/text";
import { scrollIntoCursor } from "./utils/scroll";

const completionClassName = "completion" + Math.random().toString(36).slice(2);

/**
 * @typedef StreamState
 * @property {Function} abort - Function to abort the stream
 * @property {Promise<void>} promise - Promise that resolves when the stream is finished
 */
export type StreamState = {
  abort: () => void;
  promise: Promise<void>;
};

/**
 * @typedef CompletionHandler
 * @description Callback to append completion result
 * @param {Object} params - Parameters for the completion handler
 * @param {string} [params.precedingText] - Text before the cursor
 * @param {string} [params.followingText] - Text after the cursor
 * @param {Function} callback - Callback to append completion result
 * @returns {StreamState}
 */
export type CompletionHandler = (params: {
  precedingText?: string | undefined;
  followingText?: string | undefined;
  callback: (output: string) => void;
}) => StreamState;

/**
 * @typedef ErrorHandler
 * @description Callback to handle errors
 * @param {any} error - The error to handle
 * @returns {void}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorHandler = (error: any) => void;

const getCompletionNode = (text: string) => {
  const node = document.createElement("span");
  node.classList.add(completionClassName);
  node.style.opacity = "0.5";
  node.innerText = text;
  return node;
};

/**
 * @class CopilotEngine
 * @description Engine to handle completion. You can conver any DIV element to a completion-enabled editor.
 * @param {Object} params - Parameters for the CopilotEngine
 * @param {string} params.value - Initial value
 * @param {boolean} [params.textOnly=true] - If true, only text can be inserted
 * @param {Function} [params.onChange] - Callback when value is changed
 * @param {number} [params.delay] - Delay to start automatic completion. If not specified, completion not start automatically.
 * @param {CompletionHandler} params.handler - Completion handler
 * @param {ErrorHandler} params.errorHandler - error handler, callback error in CompletionHandler
 * @param {HTMLDivElement} params.element - The DIV element to be converted to a completion-enabled editor
 */
export class CopilotEngine {
  /**
   *  @field {boolean} textOnly - If true, only text can be inserted
   */
  textOnly?: boolean;
  /**
   * @field {Function} onChange - Callback when value is changed
   */
  onChange?: (value: string) => void;
  /**
   * @field {number} delay - Delay to start automatic completion. If not specified, completion not start automatically.
   */
  delay?: number;
  /**
   * @field {CompletionHandler} handler - Completion handler
   */
  handler?: CompletionHandler;
  /**
   * @field {CompletionHandler} errorHandler - error handler, callback error in CompletionHandler
   */
  errorHandler?: ErrorHandler;
  /**
   * @internal
   */
  private containerElement: HTMLDivElement;
  /**
   * @internal
   */
  private completionElement?: HTMLSpanElement;
  /**
   * @internal
   */
  private isInComposition = false;
  /**
   * @internal
   */
  private _currentText = "";
  /**
   * @internal
   */
  private completionRequest?: StreamState;
  constructor(params: {
    value: string;
    textOnly?: boolean;
    onChange?: (value: string) => void;
    delay?: number;
    handler: CompletionHandler;
    errorHandler?: ErrorHandler;
    element: HTMLDivElement;
  }) {
    this.textOnly = params.textOnly !== false;
    this.onChange = params.onChange;
    this.delay = params.delay;
    this.handler = params.handler;
    this.errorHandler = params.errorHandler;
    this.containerElement = params.element;
    this.value = params.value;

    this.containerElement.setAttribute("contenteditable", "true");
    this.containerElement.addEventListener("keydown", this.onKeyDown);
    this.containerElement.addEventListener("input", this.onInput);
    this.containerElement.addEventListener("paste", this.onPaste);
    this.containerElement.addEventListener("drop", this.onDrop);
    this.containerElement.addEventListener(
      "compositionstart",
      this.onCompositionStart,
    );
    this.containerElement.addEventListener(
      "compositionend",
      this.onCompositionEnd,
    );
  }

  get value() {
    return this._currentText;
  }

  set value(value: string | undefined) {
    if ((value || "") !== this._currentText) {
      if (this.containerElement) {
        this.containerElement.innerText = value || "";
      }
    }
  }

  close() {
    this.containerElement.removeEventListener("keydown", this.onKeyDown);
    this.containerElement.removeEventListener("input", this.onInput);
    this.containerElement.removeEventListener("paste", this.onPaste);
    this.containerElement.removeEventListener("drop", this.onDrop);
    this.containerElement.removeEventListener(
      "compositionstart",
      this.onCompositionStart,
    );
    this.containerElement.removeEventListener(
      "compositionend",
      this.onCompositionEnd,
    );
  }
  /**
   * @internal
   */
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isInComposition) {
      return;
    }
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      this.startCompletion();
    } else if (e.key === "Enter" && !e.altKey && !e.metaKey) {
      e.preventDefault();
      insertBeforeCursor("\n");
      this.onValueChange();
      scrollIntoCursor(this.containerElement);
    } else if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
      // noop
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!this.completionRequest || !this.completionElement) return;
      const copletionText = this.completionElement.innerText;
      if (!copletionText) return;
      const sepeartorMatch = copletionText.match(/[。、！,」｝.,!} \n]/);
      const separatorPosition = sepeartorMatch
        ? (sepeartorMatch.index || 0) + sepeartorMatch[0].length
        : copletionText.length;
      const determinedCompletion = copletionText.slice(0, separatorPosition);
      this.completionElement.innerText = copletionText.slice(separatorPosition);
      insertBeforeNode(determinedCompletion, this.completionElement);
      scrollIntoCursor(this.containerElement);
      this.onValueChange();
    } else if (["Escape"].includes(e.key)) {
      this.stopCompletion();
    } else if (e.key.length > 1) {
      // normal key
    } else {
      this.stopCompletion();
      this.requestCompletion();
    }
  };
  /**
   * @internal
   */
  private onInput = () => {
    this.onValueChange();
  };

  /**
   * @internal
   */
  private onPaste = (e: ClipboardEvent) => {
    if (!this.textOnly && !this.completionElement) return;
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    insertBeforeCursor(text);
    this.onValueChange();
  };

  /**
   * @internal
   */
  private onDrop = (e: DragEvent) => {
    if (!this.textOnly && !this.completionElement) return;
    e.preventDefault();
    const text = e.dataTransfer?.getData("text/plain");
    if (!text) return;
    insertBeforeCursor(text);
    this.onValueChange();
  };

  /**
   * @internal
   */
  private onCompositionStart = () => {
    this.isInComposition = true;
  };

  /**
   * @internal
   */
  private onCompositionEnd = () => {
    this.isInComposition = false;
    this.onValueChange();
  };

  /**
   * @internal
   */
  private getAllText() {
    if (this.completionRequest && this.containerElement) {
      const node = this.containerElement.cloneNode(true) as HTMLDivElement;
      node
        .querySelectorAll(`.${completionClassName}`)
        .forEach((node) => node.remove());
      return getInnerTextOfUnattachedElement(node).replace(/\n$/, "");
    } else {
      return this.containerElement?.innerText.replace(/\n$/, "") || "";
    }
  }

  /**
   * @internal
   */
  private onValueChange() {
    if (this.isInComposition) {
      return;
    }
    const text = this.getAllText();
    this._currentText = text;
    this.onChange?.(text);
  }

  /**
   * @internal
   */
  private stopCompletion() {
    if (!this.completionRequest) return;
    // Element with completionClassName may be separated by pasting HTML, so we need to remove all.
    this.containerElement
      ?.querySelectorAll(`.${completionClassName}`)
      .forEach((dom) => {
        dom.remove();
      });
    this.completionElement = undefined;
    this.completionRequest?.abort();
    this.completionRequest = undefined;
  }

  /**
   * @internal
   */
  private startCompletion() {
    this.stopCompletion();
    this.completionElement = getCompletionNode("");
    insertAfterCursor(this.completionElement);
    const precedingText = getTextBeforeCursor(this.containerElement);
    const followingText = getTextAfterCursor(this.containerElement)?.replace(
      /\n$/,
      "",
    );
    const onError = (error: unknown) => {
      this.stopCompletion();
      if (this.errorHandler) this.errorHandler?.(error);
      else throw error;
    };
    console.log({ precedingText, followingText });
    try {
      this.completionRequest = this.handler?.({
        precedingText,
        followingText,
        callback: (output) => {
          if (!this.completionElement) return;
          appendNode(output, this.completionElement);
        },
      });
    } catch (e) {
      onError(e);
    }
    (async () => {
      try {
        await this.completionRequest?.promise;
      } catch (e) {
        onError(e);
      }
    })();
  }
  /**
   * @internal
   */
  private requestCompletion = (() => {
    let timeoutId: NodeJS.Timeout | undefined;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (this.delay) {
        timeoutId = setTimeout(() => {
          this.startCompletion();
          timeoutId = undefined;
        }, this.delay);
      }
    };
  })();
}