import { useMemo } from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowRightIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Handle, Position, useNodeId } from '@xyflow/react';

import { Class, ClassProperty, IRI } from '@/types';
import {
  outEdgeCount,
  useNodeShallow,
  isUnmetClsProp,
  hasUnmetProfileClsProps,
  hasUnmetNodeClsProps,
  deselectAll,
  flowStore,
} from '@/store/flow';
import {
  contentClass,
  itemClass,
  parseIRI,
  targetClsTooltipClass,
} from '@/scripts/app-utils';
import { getItem } from '@/store/onto';
import { appStore } from '@/store/app';

const NodeMenuClass = () => {
  const nodeId = useNodeId()!;
  const node = useNodeShallow(nodeId);
  const edges = flowStore.use.edges();

  const items = useMemo(() => {
    if (!node) return [];

    const reachedMaxCount = (path: IRI, maxCount: number | undefined | null) =>
      maxCount == null ? false : outEdgeCount(node.id, path, edges) >= maxCount;

    const handleMouseDown = (
      event: React.MouseEvent,
      classProperty: ClassProperty
    ) => {
      if (event.button !== 0) return;
      appStore.setState(state => {
        state.draggedPropData = { classProperty, sourceNodeId: node.id };
        return state;
      });
      event.target?.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
      deselectAll();
    };

    const classItems = [];
    for (const [propClsIRI, clsProps] of node.data.recClsProps) {
      const propClsName = parseIRI(propClsIRI).name;
      const propItems = [];
      for (const [propName, clsProp] of Object.entries(clsProps).sort()) {
        if (clsProp.targetClass) {
          propItems.push(
            <div key={clsProp.path} className="class-menu-item">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <DropdownMenu.Item
                      onMouseDown={e => handleMouseDown(e, clsProp)}
                      disabled={reachedMaxCount(clsProp.path, clsProp.maxCount)}
                      asChild
                    >
                      <Handle
                        type="source"
                        position={Position.Left}
                        className={`
                          group pl-2 pr-3
                          text-sm text-spdx-dark flex justify-between items-center 
                          data-[highlighted]:text-mauve1 data-[highlighted]:cursor-pointer
                          data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none 
                        `}
                      >
                        {propName}
                        {isUnmetClsProp(node, clsProp) && (
                          <div className="w-[16px] flex items-center ml-2">
                            <span
                              className="material-symbols-outlined text-base text-rose-600 group-data-[highlighted]:hidden group-data-[]:hidden"
                              style={{
                                fontVariationSettings: `"FILL" 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                              }}
                            >
                              error
                            </span>
                          </div>
                        )}
                      </Handle>
                    </DropdownMenu.Item>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className={targetClsTooltipClass}
                      sideOffset={-5}
                      side="right"
                    >
                      <ArrowRightIcon />
                      <div
                        className={`mr-2
                        ${(getItem(clsProp.targetClass) as Class)!.abstract ? 'text-spdx-dark bg-white rounded px-1 box-border' : ''}
                      `}
                      >
                        {parseIRI(clsProp.targetClass).name}
                      </div>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          );
        }
      }
      if (propItems.length > 0) {
        classItems.push(
          <DropdownMenu.Sub key={propClsName}>
            <DropdownMenu.SubTrigger className={itemClass}>
              <div className="flex justify-between">
                <span className="pr-2">{propClsName}</span>
                {hasUnmetProfileClsProps(node, clsProps) && (
                  <div className="w-[16px] flex items-center pr-2">
                    <span
                      className="material-symbols-outlined text-base text-rose-600 group-data-[highlighted]:hidden group-data-[]:hidden"
                      style={{
                        fontVariationSettings: `"FILL" 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                      }}
                    >
                      error
                    </span>
                  </div>
                )}
              </div>
              <ChevronRightIcon />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent
              className={contentClass + ' pl-1 py-1'}
              sideOffset={-1}
              alignOffset={-5}
            >
              {propItems}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        );
      }
    }
    return classItems;
  }, [node, edges]);

  return items.length > 0 ? (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={itemClass}>
        <div className="flex justify-between">
          <span className="pr-2">Add Edge</span>
          {hasUnmetNodeClsProps(node) && (
            <div className="w-[16px] flex items-center pr-2">
              <span
                className="material-symbols-outlined text-base text-rose-600 group-data-[highlighted]:hidden group-data-[]:hidden"
                style={{
                  fontVariationSettings: `"FILL" 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                }}
              >
                error
              </span>
            </div>
          )}
        </div>
        <ChevronRightIcon />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={contentClass + ' p-1'}
          sideOffset={-1}
          alignOffset={-5}
        >
          {items}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  ) : null;
};

export default NodeMenuClass;
