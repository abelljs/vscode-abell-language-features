import { CompletionItemKind, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"
import { compile } from 'abell/dist/vite-plugin-abell/compiler';
import { execRegexOnAll } from "../helpers";

export function getAbellMode() {
  return {
    getId() {
      return 'abell'
    },
    doComplete(document: TextDocument, position: Position) {
			const abellCompletions = [];
			const abellComponentFunctions = execRegexOnAll(
				/(?:import) (\w*) *?from *?["'`](.*?)\.abell["'`]/g,
				document.getText()
			);

			for (const match of abellComponentFunctions.matches) {
				const componentPath = `${match[2]}.abell`;
				abellCompletions.push({
					label: match[1],
					kind: CompletionItemKind.Function,
					documentation: `Custom Abell Component required from '${componentPath}'\n\n`,
				})
			}

      return abellCompletions;
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}