import React from 'react'
import './Board.css'

function Board({ board, onColumnClick }) {
  console.log('Board component received board:', board, 'Type:', typeof board, 'Is array:', Array.isArray(board))
  
  if (!board || !Array.isArray(board)) {
    console.error('Board prop is not an array:', board)
    return <div className="board">Loading board...</div>
  }
  
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className="cell"
              onClick={() => onColumnClick(colIndex)}
            >
              <div className={`disc ${cell || ''}`}></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board