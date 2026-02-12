import { forwardRef } from 'react'

const GraphCanvas = forwardRef(function GraphCanvas(props, ref) {
  return (
    <div ref={ref} id="cy-container" className="h-full w-full bg-gray-950" />
  )
})

export default GraphCanvas
