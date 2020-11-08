/** helper */

export const execRegexOnAll = (regex:RegExp, template:string) => {
  /** allMatches holds all the results of RegExp.exec() */
	const allMatches = [];
  let match:any = regex.exec(template);
  if (!match) {
    return { matches: [], input: template };
  }

  const { input } = match;

  while (match !== null) {
    delete match.input;
    allMatches.push(match);
    match = regex.exec(template);
  }

  return { matches: allMatches, input };
};

