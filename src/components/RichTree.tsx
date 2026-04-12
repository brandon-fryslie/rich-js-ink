/**
 * <RichTree> — Ink component wrapping rich-js Tree.
 */

import React, { useMemo } from "react";
import { Text, useWindowSize } from "ink";
import { Tree } from "rich-js";
import type { TreeOptions } from "rich-js";
import { renderToString } from "../render-to-string.js";

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

export interface RichTreeProps extends TreeOptions {
  /** Root node of the tree. */
  root: TreeNode;
  /** Override available width. */
  width?: number;
}

function addChildren(tree: Tree, children: TreeNode[]): void {
  for (const child of children) {
    const childTree = tree.add(child.label);
    if (child.children?.length) {
      addChildren(childTree, child.children);
    }
  }
}

function buildTree(node: TreeNode, options: TreeOptions): Tree {
  const tree = new Tree(node.label, options);
  addChildren(tree, node.children ?? []);
  return tree;
}

export function RichTree({
  root,
  width,
  ...treeOptions
}: RichTreeProps): React.JSX.Element {
  const windowSize = useWindowSize();
  const effectiveWidth = width ?? windowSize.columns;

  const output = useMemo(() => {
    const tree = buildTree(root, treeOptions);
    return renderToString(tree, { width: effectiveWidth });
  }, [root, effectiveWidth, treeOptions]);

  return <Text>{output}</Text>;
}
