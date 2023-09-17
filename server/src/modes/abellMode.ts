import { CompletionItem, CompletionItemKind, Range, TextDocument } from "vscode-languageserver"
import { Position } from "vscode-languageserver-textdocument"
import { } from 'typescript/lib/tsserverlibrary';
import { execRegexOnAll } from "../helpers";
import { LanguageMode } from "../languageModes";

const builtInJSFunctions: (CompletionItem & {on?: string})[] = [
	{
		label: '/** @declaration */',
		insertText: '/** @declaration */',
		filterText: 'declaration',
		kind: CompletionItemKind.Keyword,
		documentation: 'Use this to declare Abell block as variable declaration block'
	},
	{
		label: 'console.log',
		kind: CompletionItemKind.Function,
		documentation: 'console.log from javascript (logs in your terimnal)'
	},
	{
		label: 'import',
		kind: CompletionItemKind.Keyword,
	},
	{
		label: 'from',
		kind: CompletionItemKind.Keyword,
	},
	{
		label: 'setTimeout',
		kind: CompletionItemKind.Function
	},
	{
		label: 'setInterval',
		kind: CompletionItemKind.Function
	},
	{
		label: 'clearTimeout',
		kind: CompletionItemKind.Function
	},
	{
		label: 'clearInterval',
		kind: CompletionItemKind.Function
	},
	{
		label: 'props',
		kind: CompletionItemKind.Variable
	},
	{
		label: 'Object',
		kind: CompletionItemKind.Variable
	},
	{
		on: 'Object.',
		label: 'values',
		kind: CompletionItemKind.Function,
	},
	{
		on: 'Object.',
		label: 'keys',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'map',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'filter',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'reduce',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'toUpperCase',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'toLowerCase',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'includes',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'startsWith',
		kind: CompletionItemKind.Function,
	},
	{
		on: '.',
		label: 'endsWith',
		kind: CompletionItemKind.Function,
	}
]


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

			const globalBuiltIns = builtInJSFunctions.filter((built) => !built.on)
			const onProps = builtInJSFunctions.filter(
				(built) => {
					const getText = (on: string) => document.getText(
						Range.create(
							{ line: position.line, character: 0},
							position
						)
					)

					return built.on && getText(built.on).trim().includes(built.on)
				}
					
			)

      return {
				isIncomplete: true,
				items: [...globalBuiltIns, ...abellCompletions, ...onProps]
			};
    },
    onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
  }
}