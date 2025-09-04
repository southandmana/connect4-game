import React from 'react'
import './Board.css'

function Board({ board, onColumnClick, winningPieces = [] }) {
  console.log('Board component received board:', board, 'Type:', typeof board, 'Is array:', Array.isArray(board))
  
  if (!board || !Array.isArray(board)) {
    console.error('Board prop is not an array:', board)
    return <div className="board">Loading board...</div>
  }

  // Helper function to check if a cell is part of the winning pattern
  const isWinningPiece = (rowIndex, colIndex) => {
    return winningPieces.some(piece => piece.row === rowIndex && piece.col === colIndex)
  }
  
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => {
            const isWinner = isWinningPiece(rowIndex, colIndex)
            return (
              <div
                key={colIndex}
                className="cell"
                onClick={() => onColumnClick(colIndex)}
              >
                <div className={`disc ${cell || ''} ${isWinner ? 'winning' : ''}`}></div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Board