import { useEffect, useId, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import ImageTool from '@editorjs/image';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import EditorjsList from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import Embed from '@editorjs/embed';
import { uploadEditorImage } from '../api';

const emptyContent = {
  blocks: [{ type: 'paragraph', data: { text: '' } }],
};

export default function Editor({ initialData, onChange, disabled = false }) {
  const editorRef = useRef(null);
  const initialDataRef = useRef(initialData);
  const onChangeRef = useRef(onChange);
  const timeoutRef = useRef(null);
  const holderId = `editor-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current) return undefined;

    const editor = new EditorJS({
      holder: holderId,
      readOnly: disabled,
      data: initialDataRef.current?.blocks ? initialDataRef.current : emptyContent,
      placeholder: 'Tell your story...',
      tools: {
        paragraph: Paragraph,
        header: Header,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: uploadEditorImage,
            },
          },
        },
        quote: Quote,
        checklist: Checklist,
        list: EditorjsList,
        code: CodeTool,
        table: Table,
        delimiter: Delimiter,
        embed: Embed,
      },
      onChange: async (api) => {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(async () => {
          onChangeRef.current?.(await api.saver.save());
        }, 500);
      },
    });
    editorRef.current = editor;

    return () => {
      window.clearTimeout(timeoutRef.current);
      editorRef.current = null;
      editor.isReady.then(() => editor.destroy()).catch(() => {});
    };
  }, [disabled, holderId]);

  return (
    <div className="editor-shell rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">
      <div id={holderId} />
    </div>
  );
}
