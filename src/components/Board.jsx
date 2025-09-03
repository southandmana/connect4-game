import React from 'react'
import './Board.css'

function Board({ board, onColumnClick }) {
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