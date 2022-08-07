import { CompletionItemKind, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"
import { } from 'typescript/lib/tsserverlibrary';
import { execRegexOnAll } from "../helpers";
import { LanguageMode } from "../languageModes";

export function getAbellMode(): LanguageMode {
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

      return {
				isIncomplete: true,
				items: abellCompletions
			};
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}