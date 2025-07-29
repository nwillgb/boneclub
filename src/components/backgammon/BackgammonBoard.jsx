
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackgammonPoint from "./BackgammonPoint";
import BackgammonChecker from "./BackgammonChecker";
import DoublingCube from "./DoublingCube";
import DiceFace from "./DiceFace";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export default function BackgammonBoard({
  position,
  bar = { white: 0, black: 0 },
  bornOff = { white: 0, black: 0 },
  isPlayerTurn,
  playerColor,
  doublingCube = null,
  showControls = false,
  showDoubleButton = false,
  onRollDice = () => {},
  onOfferDouble = () => {},
  rollDisabled = false,
  diceDisplay = null,
  onUndoMoves = () => {},
  onConfirmTurn = () => {},
  showUndo = false,
  showEndTurn = false,
  endTurnReady = false,
  onCheckerClick = () => {},
  isComputerOfferingDouble = false,
  doubledCubeValue = 2,
  onTakeDouble = () => {},
  onPassDouble = () => {},
  showPlayerDoubleThinking = false, // Added new prop
  // New props for practice tools
  showResultControls = false,
  isCorrect = false,
  onTryAgain = () => {},
  onNewOpening = () => {},
  showRevealComplete = false, // Added new prop for reveal functionality
}) {
    const calculatePipCount = (color) => {
        let pipCount = 0;
        for (let point = 1; point <= 24; point++) {
            if (position[point] && position[point].color === color) {
                const distance = color === 'white' ? point : (25 - point);
                pipCount += position[point].count * distance;
            }
        }
        if (bar[color] > 0) {
            pipCount += bar[color] * 25;
        }
        return pipCount;
    };

    const whitePips = calculatePipCount('white');
    const blackPips = calculatePipCount('black');

    const renderQuadrant = (points, isTop) => {
        return (
            <div className="flex w-full h-[40%]">
                {points.map(point => (
                    <BackgammonPoint
                        key={point}
                        pointNumber={point}
                        checkers={position[point]}
                        isTop={isTop}
                        isPlayerTurn={isPlayerTurn}
                        playerColor={playerColor}
                        onCheckerClick={onCheckerClick}
                    />
                ))}
            </div>
        );
    };

    const renderBornOffCheckers = (color, count, isTop) => {
        if (count === 0) return null;
        
        const checkers = [];
        const checkerHeight = 4; // % of container height
        const groupGap = 3; // % of container height

        for (let i = 0; i < count; i++) {
            const groupIndex = Math.floor(i / 5);
            const indexInGroup = i % 5;
            const offset = (groupIndex * (5 * checkerHeight + groupGap)) + (indexInGroup * checkerHeight);

            checkers.push(
                <div
                    key={i}
                    className="rounded-sm border shadow-sm"
                    style={{
                        width: '78%',
                        height: `${checkerHeight}%`,
                        backgroundColor: color === 'white' ? '#F5F5DC' : '#007e81',
                        borderColor: color === 'white' ? '#bdaa99' : '#005d60',
                        position: 'absolute',
                        [isTop ? 'top' : 'bottom']: `${offset}%`,
                        left: '11%'
                    }}
                />
            );
        }
        
        return checkers;
    };

    const handleBarClick = () => {
        if (isPlayerTurn && playerColor === 'white' && bar.white > 0 && onCheckerClick) {
            onCheckerClick('bar');
        }
    };

    return (
        <div className="w-full lg:w-[90%] max-w-7xl mx-auto relative">
            <div
                className="relative aspect-[1.6/1] bg-[#007e81] p-[4%] shadow-lg"
            >
                {/* Pip counts positioned relative to the outer frame */}
                <div className="absolute text-white text-sm font-semibold" style={{ top: '1%', right: '8%', transform: 'translateX(50%)' }}>
                    {blackPips}
                </div>
                <div className="absolute text-white text-sm font-semibold" style={{ bottom: '1%', right: '8%', transform: 'translateX(50%)' }}>
                    {whitePips}
                </div>

                <div className="bg-[#9fd3ba] shadow-inner flex h-full relative">

                    <div className="flex flex-col flex-1 justify-between relative">
                        {renderQuadrant([13, 14, 15, 16, 17, 18], true)}
                        {renderQuadrant([12, 11, 10, 9, 8, 7], false)}
                        
                        {/* Left Side Controls (Dice Display or Feedback) - Centered in left playing area */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                            <div className="pointer-events-auto">
                                {/* Show feedback for practice tools */}
                                {showResultControls ? (
                                    !(showRevealComplete && !isCorrect) && (
                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={true}
                                                className="uppercase font-bold py-3 px-8 rounded-md border-2 cursor-default"
                                                style={{ 
                                                    backgroundColor: 'transparent', 
                                                    color: isCorrect ? '#f26222' : '#dc2626',
                                                    borderColor: isCorrect ? '#f26222' : '#dc2626'
                                                }}
                                            >
                                                {isCorrect ? 'Correct!' : 'Incorrect'}
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    /* Normal dice display */
                                    diceDisplay && diceDisplay.length > 0 && (
                                        <div className="flex items-center gap-4">
                                          {diceDisplay.map(d => (
                                            <div 
                                                key={d.id} 
                                                className={`transition-opacity duration-300 ${d.isUsed ? 'opacity-60' : 'opacity-100'}`}
                                            >
                                              <DiceFace value={d.value} playerColor={d.playerColor} isUsed={d.isUsed} />
                                            </div>
                                          ))}
                                        </div>
                                    )
                                )}
                                
                                {/* Computer Double Offer Display OR Player Double Feedback */}
                                {(isComputerOfferingDouble || showPlayerDoubleThinking) && (
                                    <div className="text-center">
                                        <DoublingCube value={doubledCubeValue} disabled={true} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Center Bar */}
                    <div className="w-[4.8%] flex-shrink-0 bg-[#007e81] mx-[1%] flex flex-col items-center justify-center relative py-2">
                        <Droppable droppableId="bar-black" isDropDisabled={true}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full h-1/2 flex flex-col items-center justify-start relative">
                                    {Array.from({ length: Math.min(bar.black, 5) }).map((_, i) => {
                                        const spacing = bar.black <= 5 ? (i * 15) : (i * 12);
                                        return (
                                            <div key={i} className="absolute aspect-square left-1/2 transform -translate-x-1/2" style={{
                                                top: `${spacing}%`,
                                                width: '110%'
                                            }}>
                                                <BackgammonChecker color="black" />
                                                {bar.black > 5 && i === 4 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div
                                                            className="rounded-full flex items-center justify-center"
                                                            style={{
                                                                backgroundColor: '#f26222',
                                                                width: '60%',
                                                                height: '60%',
                                                                minWidth: '20px',
                                                                minHeight: '20px'
                                                            }}
                                                        >
                                                            <span className="text-white font-bold text-xs">
                                                                {bar.black}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <Droppable droppableId="bar-white">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full h-1/2 flex flex-col items-center justify-end relative">
                                    {Array.from({ length: Math.min(bar.white, 5) }).map((_, i) => {
                                        const isTopChecker = i === bar.white - 1;
                                        const spacing = bar.white <= 5 ? (i * 15) : (i * 12);

                                        if (isTopChecker && isPlayerTurn && playerColor === 'white') {
                                            return (
                                                <Draggable key={`bar-${i}`} draggableId={`checker-bar-${i}`} index={0}>
                                                    {(p, dragSnapshot) => (
                                                        <div
                                                            ref={p.innerRef}
                                                            {...p.draggableProps}
                                                            {...p.dragHandleProps}
                                                            className="absolute aspect-square left-1/2 cursor-pointer"
                                                            style={{
                                                                bottom: `${spacing}%`,
                                                                width: '110%',
                                                                zIndex: dragSnapshot.isDragging ? 1000 : 10 + i,
                                                                opacity: dragSnapshot.isDragging ? 0.8 : 1,
                                                                transform: `translate(-50%, 0) ${p.draggableProps.style.transform || ''} ${dragSnapshot.isDragging ? 'scale(1.1)' : 'scale(1)'}`,
                                                                transition: p.draggableProps.style.transition,
                                                            }}
                                                            onClick={!dragSnapshot.isDragging ? handleBarClick : undefined}
                                                        >
                                                            <BackgammonChecker color="white" />
                                                            {bar.white > 5 && i === 4 && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div
                                                                        className="rounded-full flex items-center justify-center"
                                                                        style={{
                                                                            backgroundColor: '#f26222',
                                                                            width: '60%',
                                                                            height: '60%',
                                                                            minWidth: '20px',
                                                                            minHeight: '20px'
                                                                        }}
                                                                    >
                                                                        <span className="text-white font-bold text-xs">
                                                                            {bar.white}
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
                                                key={i} 
                                                className={`absolute aspect-square left-1/2 transform -translate-x-1/2 ${isTopChecker && isPlayerTurn && playerColor === 'white' ? 'cursor-pointer' : ''}`} 
                                                style={{
                                                    bottom: `${spacing}%`,
                                                    width: '110%'
                                                }}
                                                onClick={isTopChecker && isPlayerTurn && playerColor === 'white' ? handleBarClick : undefined}
                                            >
                                                <BackgammonChecker color="white" />
                                                {bar.white > 5 && i === 4 && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div
                                                            className="rounded-full flex items-center justify-center"
                                                            style={{
                                                                backgroundColor: '#f26222',
                                                                width: '60%',
                                                                height: '60%',
                                                                minWidth: '20px',
                                                                minHeight: '20px'
                                                            }}
                                                        >
                                                            <span className="text-white font-bold text-xs">
                                                                {bar.white}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    <div className="flex flex-col flex-1 justify-between relative">
                        {renderQuadrant([19, 20, 21, 22, 23, 24], true)}
                        {renderQuadrant([6, 5, 4, 3, 2, 1], false)}
                        
                        {/* Right Side Controls (Action Buttons) - Centered in right playing area */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                            <div className="flex flex-col items-center gap-4 pointer-events-auto">
                                {showControls && (
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={onRollDice}
                                            disabled={rollDisabled}
                                            className="uppercase font-bold py-3 px-8 rounded-md hover:opacity-90"
                                            style={{ backgroundColor: '#e5e4cd', color: '#5a3217' }}
                                        >
                                            ROLL
                                        </Button>
                                        {showDoubleButton && (
                                            <Button
                                                onClick={onOfferDouble}
                                                className="uppercase text-white font-bold py-3 px-8 rounded-md hover:opacity-90"
                                                style={{ backgroundColor: '#f26222' }}
                                            >
                                                DOUBLE
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Result controls for practice tools */}
                                {showResultControls && (
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Show action buttons */}
                                        {!(showRevealComplete && !isCorrect) ? (
                                            isCorrect ? (
                                                <Button
                                                    onClick={onNewOpening}
                                                    className="uppercase font-bold py-3 px-8 rounded-md hover:opacity-90"
                                                    style={{ backgroundColor: '#e5e4cd', color: '#5a3217' }}
                                                >
                                                    New Opening
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={onTryAgain}
                                                    className="uppercase font-bold py-3 px-8 rounded-md hover:opacity-90"
                                                    style={{ backgroundColor: '#f26222', color: 'white' }}
                                                >
                                                    Reveal
                                                </Button>
                                            )
                                        ) : (
                                            /* Show Try Again and New Opening after reveal */
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    onClick={onTryAgain}
                                                    className="uppercase font-bold py-3 px-8 rounded-md hover:opacity-90"
                                                    style={{ backgroundColor: '#f26222', color: 'white' }}
                                                >
                                                    Try Again
                                                </Button>
                                                <Button
                                                    onClick={onNewOpening}
                                                    className="uppercase font-bold py-3 px-8 rounded-md hover:opacity-90"
                                                    style={{ backgroundColor: '#e5e4cd', color: '#5a3217' }}
                                                >
                                                    New Opening
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Computer Double Offer Buttons */}
                                {isComputerOfferingDouble && (
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={onTakeDouble}
                                            className="uppercase text-white font-bold py-3 px-8 rounded-md hover:opacity-90"
                                            style={{ backgroundColor: '#007e81' }}
                                        >
                                            Take
                                        </Button>
                                        <Button
                                            onClick={onPassDouble}
                                            className="uppercase text-white font-bold py-3 px-8 rounded-md hover:opacity-90"
                                            style={{ backgroundColor: '#f26222' }}
                                        >
                                            Pass
                                        </Button>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    {showUndo && (
                                        <Button
                                            onClick={onUndoMoves}
                                            className="uppercase text-white font-bold py-3 px-8 rounded-md hover:opacity-90"
                                            style={{ backgroundColor: '#f26222' }}
                                        >
                                            Undo
                                        </Button>
                                    )}
                                    
                                    {showEndTurn && (
                                        <Button
                                            onClick={onConfirmTurn}
                                            className="uppercase font-bold py-3 px-8 rounded-md transition-all duration-300"
                                            style={{ 
                                                backgroundColor: endTurnReady ? '#5a3217' : 'rgba(90, 50, 23, 0.3)',
                                                color: endTurnReady ? '#e5e4cd' : 'rgba(229, 228, 205, 0.7)',
                                                cursor: endTurnReady ? 'pointer' : 'not-allowed'
                                            }}
                                            disabled={!endTurnReady}
                                        >
                                            End Turn
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small separator bar */}
                    <div className="w-[2%] flex-shrink-0 bg-[#007e81]"></div>

                    {/* Bear-off tray */}
                    <div className="w-[8%] flex-shrink-0 flex flex-col items-center bg-[#9fd3ba] relative">
                        {/* Top half for black */}
                        <div className="h-1/2 w-full flex flex-col items-center justify-start p-2">
                            {doublingCube && doublingCube.owner === 'black' && !isComputerOfferingDouble && (
                                <div className="mb-2">
                                    <DoublingCube
                                        value={doublingCube.value}
                                        onClick={onOfferDouble}
                                        disabled={doublingCube.disabled}
                                    />
                                </div>
                            )}
                            <div className="flex-grow w-full relative">
                                {renderBornOffCheckers('black', bornOff.black, true)}
                            </div>
                        </div>

                        {/* Center Cube is absolutely positioned within this container */}
                        {doublingCube && doublingCube.owner === 'center' && !isComputerOfferingDouble && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                            <DoublingCube
                                value={doublingCube.value}
                                onClick={onOfferDouble}
                                disabled={doublingCube.disabled}
                            />
                        </div>
                        )}

                        {/* Bottom half for white */}
                        <div className="h-1/2 w-full flex flex-col items-center justify-end p-2">
                             <div className="flex-grow w-full relative">
                                {renderBornOffCheckers('white', bornOff.white, false)}
                            </div>
                            {doublingCube && doublingCube.owner === 'white' && !isComputerOfferingDouble && (
                                <div className="mt-2">
                                    <DoublingCube
                                        value={doublingCube.value}
                                        onClick={onOfferDouble}
                                        disabled={doublingCube.disabled}
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Invisible droppable areas that fill the space */}
                        <div className="absolute inset-0 z-0">
                            <Droppable droppableId="off-black" isDropDisabled={true}>
                                {(provided) => <div ref={provided.innerRef} {...provided.droppableProps} className="h-1/2 w-full" />}
                            </Droppable>
                            <Droppable droppableId="off-white">
                                {(provided) => <div ref={provided.innerRef} {...provided.droppableProps} className="h-1/2 w-full" />}
                            </Droppable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
