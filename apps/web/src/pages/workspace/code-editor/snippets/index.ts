import type * as monaco from 'monaco-editor';

export type SnippetDef = {
  trigger: string;
  label: string;
  insertText: string;
  detail?: string;
};

export const CODE_SNIPPETS: SnippetDef[] = [
  {
    trigger: 'rafce',
    label: 'React Arrow FC',
    insertText:
      'const ${1:Component} = () => {\n  return (\n    <div>\n      $0\n    </div>\n  )\n}\nexport default ${1:Component}',
  },
  {
    trigger: 'useState',
    label: 'useState hook',
    insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:null})',
  },
  {
    trigger: 'useEffect',
    label: 'useEffect hook',
    insertText: 'useEffect(() => {\n  $1\n  return () => {\n    $2\n  }\n}, [$0])',
  },
  {
    trigger: 'cl',
    label: 'console.log',
    insertText: "console.log('${1:label}', $0)",
  },
  {
    trigger: 'imp',
    label: 'import',
    insertText: "import ${1:module} from '${2:path}'",
  },
  {
    trigger: 'dgigRead',
    label: 'dgigFs readFile',
    insertText: "const { content } = await window.dgigFs!.readFile('${1:path}')",
    detail: 'D-GIG FS',
  },
  {
    trigger: 'dgigWrite',
    label: 'dgigFs writeFile',
    insertText:
      "await window.dgigFs!.writeFile('${1:path}', ${2:content})",
    detail: 'D-GIG FS',
  },
  {
    trigger: 'afn',
    label: 'async function',
    insertText: 'async function ${1:name}(${2:args}) {\n  $0\n}',
  },
  {
    trigger: 'try',
    label: 'try/catch',
    insertText: 'try {\n  $1\n} catch (error) {\n  console.error(error)\n  $0\n}',
  },
];

const LANGS = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'];

let registered = false;

export function registerSnippets(monacoApi: typeof monaco) {
  if (registered) return;
  registered = true;

  monacoApi.languages.registerCompletionItemProvider(LANGS, {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const items: monaco.languages.CompletionItem[] = CODE_SNIPPETS.map((s) => ({
        label: s.label,
        kind: monacoApi.languages.CompletionItemKind.Snippet,
        insertText: s.insertText,
        insertTextRules:
          monacoApi.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: s.detail ?? s.trigger,
        filterText: s.trigger,
        sortText: `0_${s.trigger}`,
        range,
      }));

      return { suggestions: items };
    },
  });
}
