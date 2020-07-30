/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
	CompletionList,
	createConnection,
	Diagnostic,
	InitializeParams,
	ProposedFeatures,
	TextDocuments,
	TextDocumentSyncKind
} from 'vscode-languageserver';
import { getLanguageModes, LanguageModes } from './languageModes';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let languageModes: LanguageModes;

connection.onInitialize((_params: InitializeParams) => {
	languageModes = getLanguageModes();

	documents.onDidClose(e => {
		languageModes.onDocumentRemoved(e.document);
	});
	connection.onShutdown(() => {
		languageModes.dispose();
	});

	return {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: false
			}
		}
	};
});

connection.onInitialized(() => {});

connection.onDidChangeConfiguration(_change => {
	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument) {
	try {
		const version = textDocument.version;
		const diagnostics: Diagnostic[] = [];
		if (textDocument.languageId === 'abell') {
			const modes = languageModes.getAllModesInDocument(textDocument);
			const latestTextDocument = documents.get(textDocument.uri);
			if (latestTextDocument && latestTextDocument.version === version) {
				// check no new version has come in after in after the async op
				modes.forEach(mode => {
					if (mode.doValidation) {
						mode.doValidation(latestTextDocument).forEach(d => {
							diagnostics.push(d);
						});
					}
				});
				connection.sendDiagnostics({ uri: latestTextDocument.uri, diagnostics });
			}
		}
	} catch (e) {
		connection.console.error(`Error while validating ${textDocument.uri}`);
		connection.console.error(e);
	}
}

// const execRegexOnAll = (regex: RegExp, template: string) => {
//   /** allMatches holds all the results of RegExp.exec() */
//   const allMatches = [];
//   let match = regex.exec(template);
//   if (!match) {
//     return { matches: [], input: template };
//   }

//   const { input } = match;

//   while (match !== null) {
//     delete match.input;
//     allMatches.push(match);
//     match = regex.exec(template);
//   }

//   return { matches: allMatches, input };
// };



// function isCursorInAbellBlock(text: string, position: {line: number, character: number}): boolean {
// 	const { matches } = execRegexOnAll(/{{(.+?)}}/g, text);
// 	const positionOffset = text
// 		.split('\n')
// 		.slice(0, position.line)
// 		.reduce((prev:number, item:string) => prev + item.length, 0) + position.line + position.character;
		
// 	for (const match of matches) {
// 		const blockStart = match.index;
// 		const blockEnd = match[0].length + match.index;
// 		if (positionOffset > blockStart && positionOffset < blockEnd) {
// 			return true;
// 		}
// 	}

// 	return false;
// }

connection.onCompletion(async (textDocumentPosition, token) => {
	const document = documents.get(textDocumentPosition.textDocument.uri);
	if (!document) {
		return null;
	}

	// if (isCursorInAbellBlock(document.getText(), textDocumentPosition.position)) {
	// 	return null;
	// }

	const mode = languageModes.getModeAtPosition(document, textDocumentPosition.position);
	if (!mode || !mode.doComplete) {
		return CompletionList.create();
	}
	const doComplete = mode.doComplete!;

	return doComplete(document, textDocumentPosition.position);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
