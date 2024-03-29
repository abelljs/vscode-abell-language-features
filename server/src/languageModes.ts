/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getCSSLanguageService } from 'vscode-css-languageservice';
// import { getDefaultCompilerOptions, getDefaultLibFilePath, LanguageServiceHost, sys, } from 'typescript';
// import { createLanguageService as createTSLanguageService } from '@volar/typescript-language-service';
import {
	CompletionList,
	Diagnostic,
	getLanguageService as getHTMLLanguageService,
	Position,
	Range,
	TextDocument
} from 'vscode-html-languageservice';
import { getCSSMode } from './modes/cssMode';
import { getDocumentRegions, HTMLDocumentRegions } from './embeddedSupport';
import { getHTMLMode } from './modes/htmlMode';
import { getLanguageModelCache, LanguageModelCache } from './languageModelCache';
import { getJSMode } from './modes/jsMode';
import { getAbellMode } from './modes/abellMode';

export * from 'vscode-html-languageservice';

export interface LanguageMode {
	getId(): string;
	doValidation?: (document: TextDocument) => Diagnostic[];
	doComplete?: (document: TextDocument, position: Position) => CompletionList;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

export interface LanguageModes {
	getModeAtPosition(document: TextDocument, position: Position): LanguageMode | undefined;
	getModesInRange(document: TextDocument, range: Range): LanguageModeRange[];
	getAllModes(): LanguageMode[];
	getAllModesInDocument(document: TextDocument): LanguageMode[];
	getMode(languageId: string): LanguageMode | undefined;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

export interface LanguageModeRange extends Range {
	mode: LanguageMode | undefined;
	attributeValue?: boolean;
}

export function getLanguageModes(): LanguageModes {
	const htmlLanguageService = getHTMLLanguageService();
	const cssLanguageService = getCSSLanguageService();
	// @TODO add TS Language Service here
	// const host: LanguageServiceHost = {
	// 	getNewLine: () => sys.newLine,
	// 	useCaseSensitiveFileNames: () => sys.useCaseSensitiveFileNames,
	// 	getDirectories: sys.getDirectories,
	// 	getCompilationSettings: getDefaultCompilerOptions,
	// 	getDefaultLibFileName: getDefaultLibFilePath,
	// 	getScriptFileNames: () => [],
	// 	getScriptVersion: (filename: string) => '',
	// };
	// const tsLanguageService = createTSLanguageService(ts, host);

	let documentRegions = getLanguageModelCache<HTMLDocumentRegions>(10, 60, document =>
		getDocumentRegions(htmlLanguageService, document)
	);

	let modelCaches: LanguageModelCache<any>[] = [];
	modelCaches.push(documentRegions);

	let modes = Object.create(null);
	modes['html'] = getHTMLMode(htmlLanguageService);
	modes['css'] = getCSSMode(cssLanguageService, documentRegions);
	modes['javascript'] = getJSMode();
	modes['abell'] = getAbellMode();

	return {
		getModeAtPosition(
			document: TextDocument,
			position: Position
		): LanguageMode | undefined {
			let languageId = documentRegions.get(document).getLanguageAtPosition(position);
			if (languageId) {
				return modes[languageId];
			}
			return undefined;
		},
		getModesInRange(document: TextDocument, range: Range): LanguageModeRange[] {
			return documentRegions
				.get(document)
				.getLanguageRanges(range)
				.map(r => {
					return <LanguageModeRange>{
						start: r.start,
						end: r.end,
						mode: r.languageId && modes[r.languageId],
						attributeValue: r.attributeValue
					};
				});
		},
		getAllModesInDocument(document: TextDocument): LanguageMode[] {
			let result = [];
			for (let languageId of documentRegions.get(document).getLanguagesInDocument()) {
				let mode = modes[languageId];
				if (mode) {
					result.push(mode);
				}
			}
			return result;
		},
		getAllModes(): LanguageMode[] {
			let result = [];
			for (let languageId in modes) {
				let mode = modes[languageId];
				if (mode) {
					result.push(mode);
				}
			}
			return result;
		},
		getMode(languageId: string): LanguageMode {
			return modes[languageId];
		},
		onDocumentRemoved(document: TextDocument) {
			modelCaches.forEach(mc => mc.onDocumentRemoved(document));
			for (let mode in modes) {
				modes[mode].onDocumentRemoved(document);
			}
		},
		dispose(): void {
			modelCaches.forEach(mc => mc.dispose());
			modelCaches = [];
			for (let mode in modes) {
				modes[mode].dispose();
			}
			modes = {};
		}
	};
}
