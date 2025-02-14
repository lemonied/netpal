import { Fab, styled } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  useDraggable,
  DndContext,
  useSensors,
  PointerSensor,
  useSensor,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

const Wrapper = styled(Fab)`
  position: fixed;
  z-index: 99999;
`;

interface SharedProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface DraggableItemProps extends SharedProps {
  position: {
    x: number;
    y: number;
  };
}

const DraggableItem = (props: DraggableItemProps) => {
  const { position, onClick } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : '',
    bottom: position.y,
    right: position.x,
  };

  return (
    <Wrapper
      size="medium"
      color="secondary"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <Add />
    </Wrapper>
  );
};

const FloatingAction = (props: SharedProps) => {

  const { onClick } = props;

  const [position, setPosition] = React.useState({ x: 20, y: 20 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        const { delta } = e;
        setPosition(pre => {
          return {
            x: pre.x - delta.x,
            y: pre.y - delta.y,
          };
        });
      }}
    >
      <DraggableItem position={position} onClick={onClick} />
    </DndContext>
  );
};

export default FloatingAction;
