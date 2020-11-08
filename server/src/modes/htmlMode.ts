/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CompletionItemKind } from 'vscode-languageserver';
import { execRegexOnAll } from '../helpers';
import {
	LanguageMode,
	LanguageService as HTMLLanguageService,
	Position,
	TextDocument
} from '../languageModes';

export function getHTMLMode(htmlLanguageService: HTMLLanguageService): LanguageMode {
	return {
		getId() {
			return 'html';
		},
		doComplete(document: TextDocument, position: Position) {
			const abellCompletions = [];
			const componentVariables = execRegexOnAll(
				/(?:const|var|let) (\w*) *?= *?require\(["'`](.*?)\.abell["'`]\)/g,
				document.getText()
			);

			for (const match of componentVariables.matches) {
				abellCompletions.push({
					label: match[1] + ' ',
					kind: CompletionItemKind.Variable,
					documentation: 'Custom Abell Component required from \'' + match[2] + '.abell\''
				})
			}

			const htmlCompletions = htmlLanguageService.doComplete(
				document,
				position,
				htmlLanguageService.parseHTMLDocument(document)
			)

			return {
				isIncomplete: htmlCompletions.isIncomplete,
				items: [...htmlCompletions.items, ...abellCompletions]
			};
		},
		onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
	};
}
