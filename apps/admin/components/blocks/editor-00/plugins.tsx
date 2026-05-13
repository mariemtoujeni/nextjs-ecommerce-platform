import { useState } from 'react';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '~/components/editor/editor-ui/content-editable';
import { ToolbarPlugin } from '~/components/editor/plugins/toolbar/toolbar-plugin';
import { BlockFormatDropDown } from '~/components/editor/plugins/toolbar/block-format-toolbar-plugin';
import { FormatParagraph } from '~/components/editor/plugins/toolbar/block-format/format-paragraph';
import { FormatHeading } from '~/components/editor/plugins/toolbar/block-format/format-heading';
import { FormatNumberedList } from '~/components/editor/plugins/toolbar/block-format/format-numbered-list';
import { FormatBulletedList } from '~/components/editor/plugins/toolbar/block-format/format-bulleted-list';
import { FormatCheckList } from '~/components/editor/plugins/toolbar/block-format/format-check-list';
import { FormatQuote } from '~/components/editor/plugins/toolbar/block-format/format-quote';

import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { FontFamilyToolbarPlugin } from '~/components/editor/plugins/toolbar/font-family-toolbar-plugin';
import { FontSizeToolbarPlugin } from '~/components/editor/plugins/toolbar/font-size-toolbar-plugin';
import { FontFormatToolbarPlugin } from '~/components/editor/plugins/toolbar/font-format-toolbar-plugin';
import { FontBackgroundToolbarPlugin } from '~/components/editor/plugins/toolbar/font-background-toolbar-plugin';
import { FontColorToolbarPlugin } from '~/components/editor/plugins/toolbar/font-color-toolbar-plugin';
import { ElementFormatToolbarPlugin } from '~/components/editor/plugins/toolbar/element-format-toolbar-plugin';

export type PluginsProps = {
  placeholder?: string;
}

export function Plugins({ placeholder }: PluginsProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const defaultPlaceholder = 'Commencer à écrire...';

  return (
    <div className="relative">
      {/* toolbar plugins */}
      <ToolbarPlugin>
        {({ blockType }) => (
          <div className="vertical-align-middle sticky top-0 z-10 flex flex-wrap gap-2 overflow-auto border-b p-1">
            <FontFamilyToolbarPlugin />
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={['h1', 'h2', 'h3']} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatQuote />
            </BlockFormatDropDown>            
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
            <ElementFormatToolbarPlugin />
            <FontSizeToolbarPlugin />
            <FontColorToolbarPlugin />
            <FontBackgroundToolbarPlugin />
            {/* <LinkToolbarPlugin /> */}
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="">
            <div className="" ref={onRef}>
              <ContentEditable placeholder={placeholder || defaultPlaceholder} className="ContentEditable__root relative block min-h-72 overflow-auto min-h-full px-8 py-4 focus:outline-none h-72" />
            </div>
          </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <CheckListPlugin />
        {/* <ClickableLinkPlugin />
        <AutoLinkPlugin matchers={[]} />
        <LinkPlugin /> */}
      </div>
    </div>
  );
}
