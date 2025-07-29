import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import BackgammonChecker from "./BackgammonChecker";

const POINT_COLORS = {
  dark: "#5a3217",
  light: "#f26222"
};

const BackgammonPoint = ({ pointNumber, checkers, isTop, isPlayerTurn, playerColor, onCheckerClick }) => {
  const isDark = (pointNumber % 2 === 0);
  const color = isDark ? POINT_COLORS.dark : POINT_COLORS.light;
  
  const checkerCount = checkers?.count || 0;
  const checkerColor = checkers?.color;
  const canDrag = isPlayerTurn && checkerColor === playerColor && checkerCount > 0;
  const canClick = isPlayerTurn && checkerColor === playerColor && checkerCount > 0;

  const getCheckerSpacing = (index) => {
    const spacingPerChecker = 19; // in percent
    return index * spacingPerChecker;
  };

  const handlePointClick = () => {
    if (canClick && onCheckerClick) {
      onCheckerClick(pointNumber);
    }
  };

  return (
    <Droppable droppableId={`point-${pointNumber}`} isDropDisabled={!isPlayerTurn}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`relative flex flex-col items-center flex-1 h-full ${canClick ? 'cursor-pointer' : ''}`}
          onClick={handlePointClick}
        >
          <div className={`absolute ${isTop ? 'top-0' : 'bottom-0'} text-[1.5vh] font-bold text-white z-0 transform ${isTop ? 'translate-y-[-150%]' : 'translate-y-[150%]'}`}>
            {pointNumber}
          </div>
          
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 48 192" 
            preserveAspectRatio="none"
            className={`absolute ${isTop ? 'rotate-180' : ''}`}
            style={{
                filter: snapshot.isDraggingOver ? 'drop-shadow(0px 0px 8px #fef08a)' : 'none'
            }}
          >
            <polygon points="24,0 48,192 0,192" fill={color} />
          </svg>
          
          <div 
            className="absolute inset-0 z-10"
            style={{ pointerEvents: snapshot.isDraggingOver ? 'none' : 'auto' }}
          >
            {Array.from({ length: Math.min(checkerCount, 5) }).map((_, i) => {
              const isVisualTopChecker = i === Math.min(checkerCount, 5) - 1;
              const spacing = getCheckerSpacing(i);
              
              // Disable dragging when something is being dragged over this point
              const shouldAllowDrag = isVisualTopChecker && canDrag && !snapshot.isDraggingOver;
              
              if (shouldAllowDrag) {
                return (
                  <Draggable key={`${pointNumber}-draggable`} draggableId={`checker-${pointNumber}-top`} index={i}>
                    {(providedDraggable, dragSnapshot) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        className="absolute w-[90%] left-[5%] aspect-square"
                        style={{
                          [isTop ? 'top' : 'bottom']: `${spacing}%`,
                          zIndex: dragSnapshot.isDragging ? 1000 : 20 + i,
                          ...providedDraggable.draggableProps.style
                        }}
                      >
                        <BackgammonChecker color={checkerColor} />
                        {checkerCount > 5 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div 
                              className="rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: '#f26222',
                                width: '60%',
                                height: '60%',
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <span className="text-white font-bold text-xs leading-none">
                                {checkerCount}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              }

              return (
                <div
                  key={`${pointNumber}-static-${i}`}
                  className="absolute w-[90%] left-[5%] aspect-square"
                  style={{
                    [isTop ? 'top' : 'bottom']: `${spacing}%`,
                    zIndex: 20 + i,
                  }}
                >
                  <BackgammonChecker color={checkerColor} />
                  {checkerCount > 5 && isVisualTopChecker && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#f26222',
                          width: '60%',
                          height: '60%',
                          minWidth: '24px',
                          minHeight: '24px'
                        }}
                      >
                        <span className="text-white font-bold text-xs leading-none">
                          {checkerCount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div style={{ position: 'absolute', visibility: 'hidden' }}>
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default BackgammonPoint;