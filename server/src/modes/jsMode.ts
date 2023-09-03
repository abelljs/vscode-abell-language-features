
import { CompletionItemKind, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"

export function getJSMode() {
  return {
    getId() {
      return 'javascript'
    },
    doComplete(document: TextDocument, position: Position) {
      return [];
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}