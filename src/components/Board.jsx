import React from 'react'
import './Board.css'

/**
 * Render a Connect Four board and handle user interaction (click & keyboard).
 *
 * Renders a 2D board grid from the provided board state, marks winning pieces,
 * exposes playable cells (tab-focusable) when the game is active, and invokes
 * onColumnClick when a column is selected via click or Enter/Space key.
 *
 * @param {Array<Array<string|null>>} board - 2D array of rows×columns representing the board state; each cell is 'red', another player token string, or null/empty. Expected to be 6 rows by 7 columns.
 * @param {function(number):void} onColumnClick - Called with the column index when the user selects a column.
 * @param {Array<{row:number,col:number}>} [winningPieces=[]] - Coordinates of cells that are part of the winning sequence.
 * @param {string} [currentPlayer='red'] - Identifier of the current player (used for accessible status messaging).
 * @param {string} [gameStatus='playing'] - Current game status (e.g., 'playing', 'won', 'draw'); when not 'playing' interaction is disabled.
 * @returns {import('react').JSX.Element} The rendered board element with appropriate ARIA roles/labels for screen readers.
 */
function Board({ board, onColumnClick, winningPieces = [], currentPlayer = 'red', gameStatus = 'playing' }) {
  console.log('Board component received board:', board, 'Type:', typeof board, 'Is array:', Array.isArray(board))
  
  if (!board || !Array.isArray(board)) {
    console.error('Board prop is not an array:', board)
    return <div className="board">Loading board...</div>
  }

  // Helper function to check if a cell is part of the winning pattern
  const isWinningPiece = (rowIndex, colIndex) => {
    return winningPieces.some(piece => piece.row === rowIndex && piece.col === colIndex)
  }
  
  // Keyboard navigation handler
  const handleKeyDown = (event, colIndex) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onColumnClick(colIndex)
    }
  }

  // Get accessible description for each cell
  const getCellDescription = (cell, rowIndex, colIndex, isWinner) => {
    const position = `Row ${6 - rowIndex}, Column ${colIndex + 1}`
    if (!cell) return `Empty cell, ${position}`
    const player = cell === 'red' ? 'Player' : 'Computer'
    const winnerText = isWinner ? ', winning piece' : ''
    return `${player} piece, ${position}${winnerText}`
  }

  return (
    <div 
      className="board"
      role="grid"
      aria-label={`Connect 4 game board, ${gameStatus === 'playing' ? `${currentPlayer} player's turn` : gameStatus}`}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row" role="row">
          {row.map((cell, colIndex) => {
            const isWinner = isWinningPiece(rowIndex, colIndex)
            const cellDescription = getCellDescription(cell, rowIndex, colIndex, isWinner)
            const canPlay = gameStatus === 'playing' && !cell && rowIndex === 5 || 
                           (rowIndex < 5 && board[rowIndex + 1][colIndex])
            
            return (
              <div
                key={colIndex}
                className="cell"
                role="gridcell"
                tabIndex={canPlay ? 0 : -1}
                aria-label={cellDescription}
                aria-disabled={gameStatus !== 'playing'}
                onClick={() => gameStatus === 'playing' && onColumnClick(colIndex)}
                onKeyDown={(e) => handleKeyDown(e, colIndex)}
              >
                <div 
                  className={`disc ${cell || ''} ${isWinner ? 'winning' : ''}`}
                  aria-hidden="true"
                ></div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Board