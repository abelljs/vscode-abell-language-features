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
			const htmlCompletions = htmlLanguageService.doComplete(
				document,
				position,
				htmlLanguageService.parseHTMLDocument(document)
			)

			return {
				isIncomplete: htmlCompletions.isIncomplete,
				items: htmlCompletions.items
			};
		},
		onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
	};
}
