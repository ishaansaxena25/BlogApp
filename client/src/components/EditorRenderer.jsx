import DOMPurify from 'dompurify';

function SafeHtml({ as: Tag = 'p', html, className }) {
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html || '') }}
    />
  );
}

function renderList(items = [], ordered = false) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-2`}>
      {items.map((item, index) => {
        const content = typeof item === 'string' ? item : item.content;
        const children = typeof item === 'object' ? item.items : [];
        return (
          <li key={index}>
            <SafeHtml as="span" html={content} />
            {children?.length ? renderList(children, ordered) : null}
          </li>
        );
      })}
    </Tag>
  );
}

export default function EditorRenderer({ content }) {
  if (!content?.blocks?.length) return null;

  return (
    <div className="editor-content space-y-5 text-slate-300 leading-8">
      {content.blocks.map((block, index) => {
        const key = block.id || `${block.type}-${index}`;
        switch (block.type) {
          case 'header': {
            const level = Math.min(Math.max(block.data.level || 2, 1), 6);
            const Tag = `h${level}`;
            return <SafeHtml key={key} as={Tag} html={block.data.text} className="font-bold text-white" />;
          }
          case 'paragraph':
            return <SafeHtml key={key} html={block.data.text} />;
          case 'image':
            return (
              <figure key={key} className="space-y-2">
                <img src={block.data.file?.url} alt={block.data.caption || ''} className="w-full rounded-xl" />
                {block.data.caption && <SafeHtml as="figcaption" html={block.data.caption} className="text-center text-sm text-slate-500" />}
              </figure>
            );
          case 'quote':
            return <blockquote key={key} className="border-l-4 border-brand-500 pl-5 italic"><SafeHtml html={block.data.text} /></blockquote>;
          case 'checklist':
            return (
              <ul key={key} className="space-y-2">
                {(block.data.items || []).map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-3">
                    <input type="checkbox" checked={Boolean(item.checked)} readOnly />
                    <SafeHtml as="span" html={item.text} />
                  </li>
                ))}
              </ul>
            );
          case 'list':
            return <div key={key}>{renderList(block.data.items, block.data.style === 'ordered')}</div>;
          case 'code':
            return <pre key={key} className="overflow-x-auto rounded-xl bg-slate-900 p-4"><code>{block.data.code}</code></pre>;
          case 'table':
            return (
              <div key={key} className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>{(block.data.content || []).map((row, rowIndex) => (
                    <tr key={rowIndex}>{row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-slate-800 p-2"><SafeHtml as="span" html={cell} /></td>
                    ))}</tr>
                  ))}</tbody>
                </table>
              </div>
            );
          case 'delimiter':
            return <hr key={key} className="border-slate-800" />;
          case 'embed':
            return <iframe key={key} src={block.data.embed} title={block.data.caption || 'Embedded content'} className="aspect-video w-full rounded-xl" allowFullScreen />;
          default:
            return null;
        }
      })}
    </div>
  );
}
