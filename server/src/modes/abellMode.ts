import { CompletionItemKind, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"

export function getAbellMode() {
  return {
    getId() {
      return 'abell'
    },
    doComplete(document: TextDocument, position: Position) {
      const isAbellComponent = document.getText().trim().startsWith('<AbellComponent');
      
      const abellCompletions = [
				{
					label: 'Abell',
					kind: CompletionItemKind.Variable,
					documentation: 'Main Abell variable that exports all necessary data'
				},
				{
					label: 'contentArray',
					kind: CompletionItemKind.Variable,
					documentation: 'Returns Array of meta values of all content'
				},
				{
					label: 'contentObj',
					kind: CompletionItemKind.Variable,
					documentation: 'Returns Object of meta values of all content'
				},
				{
					label: 'globalMeta',
					kind: CompletionItemKind.Variable,
					documentation: 'Contains all meta values from abell.config.js file'
				},
				{
					label: 'importContent',
					kind: CompletionItemKind.Function,
					documentation: 'Import markdown file from content directory. \n\nAbell.importContent(\'./hello-world/index.md\')'
				}
      ]
      
      if (!isAbellComponent) {
        return abellCompletions;
      }

      return []
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}