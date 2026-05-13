import { Klass, LexicalNode, LexicalNodeReplacement, ParagraphNode, TextNode } from 'lexical'
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListNode, ListItemNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from '@lexical/link'
export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode
  ]
