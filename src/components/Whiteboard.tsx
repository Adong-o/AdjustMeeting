import React, { useRef, useEffect, useState } from 'react'
import { X, Download, Trash2, Palette, Circle, Square, Minus, Edit3, Eraser } from 'lucide-react'

interface WhiteboardProps {
  isOpen: boolean
  onClose: () => void
}

interface DrawingData {
  x: number
  y: number
  tool: string
  color: string
  size: number
  isDrawing: boolean
}

const Whiteboard: React.FC<WhiteboardProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle'>('pen')
  const [currentColor, setCurrentColor] = useState('#3B82F6')
  const [brushSize, setBrushSize] = useState(3)
  const [drawingCount, setDrawingCount] = useState(0)

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#EC4899', // Pink
    '#000000', // Black
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      // Set default styles
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = currentColor
      ctx.lineWidth = brushSize
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = brushSize * 2
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setDrawingCount(prev => prev + 1)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDrawingCount(0)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Collaborative Whiteboard</h2>
            <div className="text-sm text-gray-500">
              {drawingCount} drawing{drawingCount !== 1 ? 's' : ''} • Tool: {currentTool}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadCanvas}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download whiteboard"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear whiteboard"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {/* Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'pen'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Pen tool"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === 'eraser'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Eraser tool"
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-gray-600" />
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  currentColor === color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              title="Custom color"
            />
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <div
              className="rounded-full bg-gray-800"
              style={{
                width: `${Math.max(brushSize, 4)}px`,
                height: `${Math.max(brushSize, 4)}px`,
              }}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full border border-gray-300 rounded-lg cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  )
}

export default Whiteboard