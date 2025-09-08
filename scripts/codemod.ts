import type { SgRoot } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";

async function transform(root: SgRoot<TS>): Promise<string> {
	const rootNode = root.root();

	const nodes = rootNode.findAll({
		rule: {
			pattern: "import type { $TYPE } from '@nuxt/ui-pro'",
		},
	});

	const edits = nodes.map((node) => {
		const type = node.getMatch("TYPE")?.text();
		return node.replace(`import type { ${type} } from '@nuxt/ui'`);
	});

	const newSource = rootNode.commitEdits(edits);
	return newSource;
}

export default transform;
