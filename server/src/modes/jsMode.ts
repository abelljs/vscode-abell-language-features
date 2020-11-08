import { CompletionItemKind, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"

export function getJSMode() {
  return {
    getId() {
      return 'javascript'
    },
    doComplete(document: TextDocument, position: Position) {
      const isAbellComponent = document.getText().trim().startsWith('<AbellComponent');  
      if (!isAbellComponent) {
        return [];
      }

      return [
        {
          label: 'scopedSelector',
          documentation: 'Like document.querySelector but selects element ensuring it is from the same component',
          kind: CompletionItemKind.Function
        },
        {
          label: 'scopedSelectorAll',
          documentation: 'Like document.querySelectorAll but selects element ensuring it is from the same component',
          kind: CompletionItemKind.Function
        }
      ]
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}