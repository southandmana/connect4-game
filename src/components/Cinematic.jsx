import React, { useState, useEffect } from 'react'
import './Cinematic.css'

function Cinematic({ character, type, onComplete }) {
  const [currentScene, setCurrentScene] = useState(0)
  const [showText, setShowText] = useState(false)
  
  // Get cinematic data based on character and type (opening/ending)
  const getCinematicData = () => {
    const cinematics = {
      tai: {
        opening: [
          {
            image: '/images/cinematics/tai-opening-1.jpg',
            text: 'In the laid-back suburbs of Arlen, Tai takes a break from the porch to show some Connect 4 skills...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+VEFJJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/tai-opening-2.jpg',
            text: 'With a cool head and steady hands, Tai approaches the tournament with suburban confidence.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+VEFJJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/tai-opening-3.jpg',
            text: 'Time to show these neighbors how Connect 4 is really played in Texas!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+VEFJJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          }
        ],
        victory: [
          {
            image: '/images/cinematics/tai-victory-1.jpg',
            text: 'Victory! Tai keeps it cool as the Connect 4 champion of the neighborhood!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCBjdXJzaXZlIj5UQUkgV0lOUyE8L3RleHQ+PC9zdmc+'
          },
          {
            image: '/images/cinematics/tai-victory-2.jpg',
            text: 'Another successful backyard tournament! Time to celebrate with some sweet tea.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlRBSSBXSU5TITwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/tai-victory-3.jpg',
            text: 'Tai remains the coolest Connect 4 champion in all of Arlen, Texas!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlRBSSBXSU5TITwvdGV4dD48L3N2Zz4='
          }
        ],
        defeat: [
          {
            image: '/images/cinematics/tai-defeat.jpg',
            text: 'Well, that was a good game. Time to head back to the porch and try again later.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmVhdEdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y1ZjNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NTczZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2RlZmVhdEdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYjg1NzNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+VEFJIExPU0VTPC90ZXh0Pjwvc3ZnPg=='
          }
        ]
      },
      siole: {
        opening: [
          {
            image: '/images/cinematics/siole-opening-1.jpg',
            text: 'From the competitive streets of the neighborhood, Siole never backs down from a challenge...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U0lPTEUmYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/siole-opening-2.jpg',
            text: 'With backyard champion instincts, Siole approaches the Connect 4 board with determination.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U0lPTEUmYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/siole-opening-3.jpg',
            text: 'No backing down now! Time to show everyone what a true competitor can do!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U0lPTEUmYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          }
        ],
        victory: [
          {
            image: '/images/cinematics/siole-victory-1.jpg',
            text: 'Victory! Siole proves that competitive spirit wins the day!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNJT0xFIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/siole-victory-2.jpg',
            text: 'Another backyard challenger defeated! The champion spirit lives on.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNJT0xFIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/siole-victory-3.jpg',
            text: 'Siole stands as the undisputed backyard Connect 4 champion!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNJT0xFIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          }
        ],
        defeat: [
          {
            image: '/images/cinematics/siole-defeat.jpg',
            text: 'A tough loss, but a true competitor never gives up! Next time will be different.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmVhdEdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y1ZjNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NTczZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2RlZmVhdEdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYjg1NzNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U0lPTEUgTE9TRVM8L3RleHQ+PC9zdmc+'
          }
        ]
      },
      gianni: {
        opening: [
          {
            image: '/images/cinematics/gianni-opening-1.jpg',
            text: 'Like every successful deal, Gianni approaches Connect 4 with strategic business acumen...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+R0lBTk5JJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/gianni-opening-2.jpg',
            text: 'Every game is a negotiation, every move a calculated investment in victory.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+R0lBTk5JJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/gianni-opening-3.jpg',
            text: 'Time to close this deal and show them what real strategy looks like!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+R0lBTk5JJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          }
        ],
        victory: [
          {
            image: '/images/cinematics/gianni-victory-1.jpg',
            text: 'Victory! Another successful deal closed in the Connect 4 marketplace!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkdJQU5OSSBXSU5TITwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/gianni-victory-2.jpg',
            text: 'Strategic thinking and business sense lead to another profitable victory!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkdJQU5OSSBXSU5TITwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/gianni-victory-3.jpg',
            text: 'Gianni proves that treating every game like a business deal pays off!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkdJQU5OSSBXSU5TITwvdGV4dD48L3N2Zz4='
          }
        ],
        defeat: [
          {
            image: '/images/cinematics/gianni-defeat.jpg',
            text: 'Sometimes deals fall through, but a smart businessman learns from every setback.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmVhdEdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y1ZjNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NTczZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2RlZmVhdEdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYjg1NzNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+R0lBTk5JIExPU0VTPC90ZXh0Pjwvc3ZnPg=='
          }
        ]
      },
      jon: {
        opening: [
          {
            image: '/images/cinematics/jon-opening-1.jpg',
            text: 'With the wisdom of the Texas countryside, Jon approaches Connect 4 with folksy strategy...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+Sk9OJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/jon-opening-2.jpg',
            text: 'Sometimes the simplest country wisdom beats the fanciest city strategies.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+Sk9OJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/jon-opening-3.jpg',
            text: 'Time to show these folks how we play Connect 4 down in Texas!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+Sk9OJmFwb3M7UyBTVE9SWTwvdGV4dD48L3N2Zz4='
          }
        ],
        victory: [
          {
            image: '/images/cinematics/jon-victory-1.jpg',
            text: 'Victory! Sometimes good old-fashioned Texas wisdom gets the job done!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkpPTiBXSU5TITwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/jon-victory-2.jpg',
            text: 'Another victory for country strategy and friendly Texan determination!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkpPTiBXSU5TITwvdGV4dD48L3N2Zz4='
          },
          {
            image: '/images/cinematics/jon-victory-3.jpg',
            text: 'Jon proves that folksy wisdom and Texas spirit win the day!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPkpPTiBXSU5TITwvdGV4dD48L3N2Zz4='
          }
        ],
        defeat: [
          {
            image: '/images/cinematics/jon-defeat.jpg',
            text: 'Well, that was a learning experience. As my granddaddy used to say, "There\'s always next time!"',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmVhdEdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y1ZjNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NTczZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2RlZmVhdEdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYjg1NzNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+Sk9OIExPU0VTPC90ZXh0Pjwvc3ZnPg=='
          }
        ]
      },
      southern: {
        opening: [
          {
            image: '/images/cinematics/southern-opening-1.jpg',
            text: 'From the shadows emerges the legendary Southern, master of Connect 4...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U09VVEhFUk4mYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/southern-opening-2.jpg',
            text: 'Years of training in the mysterious arts of strategic thinking have led to this moment.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U09VVEhFUk4mYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/southern-opening-3.jpg',
            text: 'The legend awakens. Time to show why they call me the ultimate Connect 4 master!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1YnVyYmFuR3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmNWYzZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNzdWJ1cmJhbkdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYzg4NjBkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U09VVEhFUk4mYXBvcztTIFNUT1JZPC90ZXh0Pjwvc3ZnPg=='
          }
        ],
        victory: [
          {
            image: '/images/cinematics/southern-victory-1.jpg',
            text: 'Victory! The legend proves that mastery is not just a title, but a way of life!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNPVVRIRVJOIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/southern-victory-2.jpg',
            text: 'Another challenger falls before the power of legendary Connect 4 mastery!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNPVVRIRVJOIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          },
          {
            image: '/images/cinematics/southern-victory-3.jpg',
            text: 'The legend lives on. Southern remains the ultimate Connect 4 champion!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZpY3RvcnlHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjODg2MGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCN2aWN0b3J5R3JhZGllbnQpIi8+PHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiNjODg2MGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJDb21pYyBTYW5zIE1TLCB1cnNpdmUiPlNPVVRIRVJOIFdJTlMhPC90ZXh0Pjwvc3ZnPg=='
          }
        ],
        defeat: [
          {
            image: '/images/cinematics/southern-defeat.jpg',
            text: 'Even legends must learn. This defeat only makes the legend stronger for next time.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImRlZmVhdEdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Y1ZjNlOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NTczZSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2RlZmVhdEdyYWRpZW50KSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LXNpemU9IjQwIiBmaWxsPSIjYjg1NzNlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQ29taWMgU2FucyBNUywgY3Vyc2l2ZSI+U09VVEhFUk4gTE9TRVM8L3RleHQ+PC9zdmc+'
          }
        ]
      }
    }
    
    return cinematics[character.id]?.[type] || []
  }

  const scenes = getCinematicData()
  const currentSceneData = scenes[currentScene]
  
  // Debug: Victory cinematic should show here
  if (type === 'victory') {
    console.log("🏆 VICTORY CINEMATIC - Should be visible now!")
  }

  useEffect(() => {
    // Show text with a slight delay after component mounts
    const timer = setTimeout(() => {
      setShowText(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [currentScene])

  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setShowText(false)
      setTimeout(() => {
        setCurrentScene(currentScene + 1)
      }, 300)
    } else {
      // Cinematic is complete
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  if (!currentSceneData) {
    // No cinematic data, skip directly to next stage
    onComplete()
    return null
  }

  return (
    <div className="cinematic" onClick={handleNext}>
      <div className="cinematic-background">
        <img 
          src={currentSceneData.image} 
          alt={`${character.name} cinematic scene ${currentScene + 1}`}
          className="cinematic-image"
          onError={(e) => {
            e.target.src = currentSceneData.fallbackImage
          }}
        />
        <div className="cinematic-overlay"></div>
      </div>
      
      <div className={`cinematic-text-overlay ${showText ? 'show' : ''}`}>
        <div className="cinematic-text">
          {currentSceneData.text}
        </div>
        
        <div className="cinematic-controls">
          <div className="continue-prompt">
            {currentScene < scenes.length - 1 ? 'Tap to continue...' : 'Tap to start tournament...'}
          </div>
          
          <button className="skip-button" onClick={handleSkip}>
            Skip ⏭️
          </button>
        </div>
      </div>
      
      <div className="cinematic-progress">
        {scenes.map((_, index) => (
          <div 
            key={index} 
            className={`progress-dot ${index <= currentScene ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Cinematic