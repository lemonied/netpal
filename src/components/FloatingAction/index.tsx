import { Fab, styled } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  useDraggable,
  DndContext,
  useSensors,
  PointerSensor,
  useSensor,
} from '@dnd-kit/core';
import React from 'react';
import { emitMessage, messageListener, sendMessage } from '@/utils';
import { useWindowFocus } from '@/hooks';
import { positionFormat } from './util';

const Wrapper = styled(Fab)`
  position: fixed;
  z-index: 99999;
`;

interface DraggableItemProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  position: {
    x: number;
    y: number;
  };
}

const DraggableItem = React.forwardRef<HTMLButtonElement, DraggableItemProps>((props, ref) => {
  const { position, onClick } = props;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const mergedTransform = React.useMemo(() => {
    if (transform && buttonRef.current) {
      const windowWidth = document.documentElement.clientWidth;
      const windowHeight = document.documentElement.clientHeight;
      const mergedPosition = positionFormat(position.x - transform.x / windowWidth * 100, position.y - transform.y / windowHeight * 100, buttonRef.current);
      const mergedX = (position.x - mergedPosition.x) * windowWidth / 100;
      const mergedY = (position.y - mergedPosition.y) * windowHeight / 100;
      return {
        ...transform,
        x: mergedX,
        y: mergedY,
      };
    }
  }, [position, transform]);
  const style: React.CSSProperties = {
    transform: mergedTransform
      ? `translate(${mergedTransform.x}px, ${mergedTransform.y}px) scale(${mergedTransform.scaleX}, ${mergedTransform.scaleY})`
      : '',
    bottom: `${position.y}%`,
    right: `${position.x}%`,
  };

  React.useImperativeHandle(ref, () => buttonRef.current!);

  setNodeRef(buttonRef.current);

  return (
    <Wrapper
      size="medium"
      color="secondary"
      ref={buttonRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <Add />
    </Wrapper>
  );
});

const FloatingAction = () => {

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [position, setPosition] = React.useState(() => {
    return {
      x: 5 / document.documentElement.clientWidth * 100,
      y: 5 / document.documentElement.clientHeight * 100,
    };
  });
  const [sidePanelOpen, setSidePanelOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );

  React.useEffect(() => {
    setPosition(pre => positionFormat(pre.x, pre.y, buttonRef.current));
  }, []);

  React.useEffect(() => {
    return messageListener('panel-status', (data) => {
      setSidePanelOpen(data);
    });
  }, []);

  useWindowFocus(() => {
    sendMessage('get-panel-status').then(data => {
      setSidePanelOpen(data);
    });
  }, { immediate: true });

  if (sidePanelOpen) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        const { delta } = e;
        const x = delta.x / document.documentElement.clientWidth * 100;
        const y = delta.y / document.documentElement.clientHeight * 100;
        setPosition((pre) => {
          return positionFormat(pre.x - x, pre.y - y, buttonRef.current);
        });
      }}
    >
      <DraggableItem
        ref={buttonRef}
        position={position}
        onClick={() => {
          emitMessage('open-panel');
        }}
      />
    </DndContext>
  );
};

export default FloatingAction;
